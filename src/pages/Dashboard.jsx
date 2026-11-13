import { useEffect, useState } from 'react';
import {useLocale} from '@/i18n/LocaleProvider';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Cloud, Plus, RefreshCw, Server, Settings2, ShieldCheck } from 'lucide-react';
import { apiRequest } from '@/services/apiClient';
import ServerCredentials from '@/components/ServerCredentials';
import ServerActions from '@/components/ServerActions';
import { CalendarClock, AlertTriangle } from 'lucide-react';

// Required by src/router/index.jsx, which auto-registers pages using exported route metadata.
export const route = { path: '/dashboard', layout: 'owner', access: 'authenticated' };

export default function Dashboard() {
 const {isInternational,formatPaise}=useLocale();
 const navigate=useNavigate();
 const [account,setAccount]=useState(null);
 const [activity,setActivity]=useState([]);
 const [instances,setInstances]=useState([]);
 const [removingDraft,setRemovingDraft]=useState('');
 const [payingDraft,setPayingDraft]=useState('');
 const [checkoutMessage,setCheckoutMessage]=useState('');
 const [checkoutErrorDraft,setCheckoutErrorDraft]=useState('');
 const [pilotOrder,setPilotOrder]=useState(null);
 const [checkingOrder,setCheckingOrder]=useState(null);
 const [pilotStatus,setPilotStatus]=useState(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 async function refresh(){
  setLoading(true);setError('');
  try{
   const user=await apiRequest('/api/v1/auth/me');
   setAccount(user);
   const inventory=await apiRequest('/api/v1/instances').catch(()=>null);
   setInstances(Array.isArray(inventory?.items)?inventory.items:[]);
   const paidItem=(inventory?.items||[]).find(item=>item.orderId && ['payment_verified','deploying','running'].includes(item.status));
   if(paidItem)setPilotOrder({orderId:paidItem.orderId,draftId:paidItem._id});
   const result=await apiRequest('/api/v1/notifications').catch(()=>null);
   setActivity(Array.isArray(result?.notifications)?result.notifications.slice(0,3):Array.isArray(result?.items)?result.items.slice(0,3):[]);
  }catch(e){
   if(/unauthorized|session|401/i.test(e.message)){navigate('/login',{replace:true});return}
   setError(e.message||'Unable to load your account.');
  }finally{setLoading(false)}
 }
 useEffect(()=>{refresh()},[]);
 // Razorpay's browser handler may be interrupted by mobile navigation.
 // Show the verified status coming from the backend webhook, even if the
 // Checkout callback did not reach this page.
 useEffect(()=>{
  let active=true;
  const sync=async()=>{
   try{
    const inventory=await apiRequest('/api/v1/instances');
    if(!active||!Array.isArray(inventory?.items))return;
    setInstances(inventory.items);
    const paid=inventory.items.find(item=>item.orderId&&['payment_verified','deploying','running'].includes(item.status));
    if(paid){
     setPilotOrder(previous=>previous?.orderId===paid.orderId?previous:{orderId:paid.orderId,draftId:paid._id});
     setPayingDraft('');
    }
   }catch{/* leave the last known server state visible */}
  };
  const timer=window.setInterval(sync,10000);
  return()=>{active=false;window.clearInterval(timer)};
 },[]);
 useEffect(()=>{
  if(!checkingOrder?.orderId)return;
  let active=true;
  const check=async()=>{
   try{
    const order=await apiRequest('/api/v1/payments/test/orders/'+encodeURIComponent(checkingOrder.orderId));
    if(!active)return;
    if(order.status==='captured_verified'){
     setPilotOrder({orderId:checkingOrder.orderId,draftId:checkingOrder.draftId});
     setCheckingOrder(null);
     setPayingDraft('');
     setCheckoutMessage('Razorpay Test Mode payment verified. Checking real Railway provisioning; do not pay again.');
    }
   }catch{/* signed webhooks and background reconciliation remain authoritative */}
  };
  check();
  const timer=window.setInterval(check,7000);
  return()=>{active=false;window.clearInterval(timer)};
 },[checkingOrder?.orderId]);
 async function deleteDraft(id){
  if(!id||removingDraft)return;
  setRemovingDraft(id);
  try{await apiRequest('/api/v1/instances/drafts/'+encodeURIComponent(id),{method:'DELETE'});setInstances(items=>items.filter(x=>x._id!==id));}
  catch(e){setError(e.message||'Could not delete draft')}
  finally{setRemovingDraft('')}
 }
 async function payTestDraft(id){
  if(isInternational){setCheckoutMessage('International PayPal checkout is not yet enabled. No Razorpay order was created.');return}
  if(payingDraft)return;
  setPayingDraft(id);setCheckoutMessage('');setCheckoutErrorDraft('');
  try{
   // Recheck the selected draft against the current account before opening Razorpay.
   const inventory=await apiRequest('/api/v1/instances');
   const fresh=(inventory?.items||[]).find(item=>item._id===id&&item.status==='draft');
   if(!fresh){setInstances(Array.isArray(inventory?.items)?inventory.items:[]);throw Error('This configuration is no longer available. Refresh or create a new one.')}
   const order=await apiRequest('/api/v1/payments/test/orders',{method:'POST',body:{draftId:fresh._id}});
   if(!order.keyId||!order.orderId)throw Error('Payment order unavailable');
   setCheckingOrder({orderId:order.orderId,draftId:id});
   if(!window.Razorpay){
    await new Promise((resolve,reject)=>{
     const script=document.createElement('script');
     script.src='https://checkout.razorpay.com/v1/checkout.js';
     script.onload=resolve;script.onerror=()=>reject(Error('Razorpay checkout could not load'));
     document.head.appendChild(script);
    });
   }
   const checkout=new window.Razorpay({
    key:order.keyId,amount:order.amount,currency:order.currency,order_id:order.orderId,
    name:'BabiesIQ Cloud',description:'Monthly compute plan • Railway provisioning requested after payment',
    handler:async result=>{
     try{
      const verified=await apiRequest('/api/v1/payments/test/verify',{method:'POST',body:result});
      setCheckoutMessage(verified.message||'Test payment captured');
      if(verified.status==='captured_verified')setPilotOrder({orderId:order.orderId,draftId:id});
     }catch(e){setCheckoutMessage('Waiting for secure Razorpay webhook verification. Do not pay again. '+e.message)}
     finally{setPayingDraft('')}
    },
    modal:{ondismiss:()=>{setPayingDraft('');setCheckoutMessage('Checking your existing Razorpay order. If you completed payment, do not pay again.');}},
    theme:{color:'#10b981'}
   });
   checkout.on('payment.failed',response=>{setCheckoutMessage(response.error?.description||'Test payment failed');setCheckingOrder(null);setPayingDraft('')});
   checkout.open();
  }catch(e){setCheckoutErrorDraft(id);setCheckoutMessage(e.message||'Checkout unavailable');setPayingDraft('')}
 }
 useEffect(()=>{
  if(!pilotOrder?.orderId)return;
  let mounted=true;
  const check=async()=>{
   try{
    const status=await apiRequest('/api/v1/payments/test/provision/'+encodeURIComponent(pilotOrder.orderId));
    if(mounted){
     setPilotStatus(status);
     if(status.status==='ready'||status.status==='needs_review')refresh();
    }
   }catch(e){if(mounted)setPilotStatus({status:'check_failed',message:e.message})}
  };
  check();
  const timer=window.setInterval(check,8000);
  return()=>{mounted=false;window.clearInterval(timer)};
 },[pilotOrder?.orderId]);
 const activeCount=instances.filter(x=>x.status==='running').length;
 const draftCount=instances.filter(x=>x.status==='draft').length;
 const name=[account?.firstName,account?.lastName].filter(Boolean).join(' ')||account?.email?.split('@')[0]||'there';
 const shortcuts=[
  {to:'/security',title:'Security center',detail:'Manage signed-in devices',Icon:ShieldCheck},
  {to:'/settings',title:'Preferences',detail:'Password and appearance',Icon:Settings2},
  {to:'/notifications',title:'Notifications',detail:'Review account activity',Icon:Bell},
 ];
 return <main className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:pt-14">
  <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-500"><Cloud size={15}/> Cloud workspace <span className="rounded border px-2 py-0.5 text-[10px] text-muted-foreground" title="Frontend deployment version">WEB-20261109-4</span></div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{loading?'Loading workspace…':`Welcome back, ${name}`}</h1><p className="mt-3 text-sm text-muted-foreground">Your infrastructure and account, in one place.</p></div><button type="button" onClick={refresh} disabled={loading} className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm hover:bg-muted disabled:opacity-50"><RefreshCw size={16}/> Refresh</button></div>
  {checkoutMessage&&!checkoutErrorDraft&&<div role="status" className="mt-6 rounded-xl border border-amber-500/30 p-4 text-sm">{checkoutMessage}</div>}
  {error&&<div role="alert" className="mt-7 rounded-xl border border-red-500/30 p-4 text-sm">{error} <button onClick={refresh} className="ml-2 underline">Try again</button></div>}
  <div className="mt-9 grid gap-4 sm:grid-cols-1">
   <div className="rounded-2xl border bg-card p-5"><div className="flex items-center justify-between text-sm text-muted-foreground">Active servers <Server size={18}/></div><div className="mt-5 text-3xl font-semibold">{loading?"—":activeCount}</div><p className="mt-2 text-xs text-muted-foreground">{draftCount} saved configuration{draftCount===1?"":"s"}</p></div>
  </div>
  <section className="mt-8 rounded-3xl border bg-card p-6 sm:p-8">
   <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">Your instances</h2><p className="mt-2 text-sm text-muted-foreground">Numbered servers with private connection details; only provisioned servers are numbered.</p></div><Link to="/dashboard/instances/new" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><Plus size={17}/> Create server</Link></div>
   <div className="mt-6 space-y-4">{instances.filter(i=>i.status!=='draft'&&i.status!=='deleted').slice().sort((a,b)=>new Date(a.createdAt||0)-new Date(b.createdAt||0)).map((item,index)=><div key={item._id} className="rounded-2xl border bg-background p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">Instance {index+1}</h3><p className="mt-1 text-sm text-muted-foreground">{item.os==='debian-12'?'Debian 12':item.os==='ubuntu-22'?'Ubuntu 22.04 LTS':item.os==='ubuntu-26'?'Ubuntu 26.04 LTS':'Ubuntu 24.04 LTS'} · {item.ram} GB RAM · {item.cpu} vCPU</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{item.status==='running'?'Running':item.status}</span></div>
    <p className="mt-2 text-xs text-muted-foreground">Region: {item.region} · Shared ephemeral storage · Public SSH via TCP proxy</p>
    {item.providerRuntime==='needs_review'&&<p className="mt-3 rounded-lg border border-amber-500/40 p-3 text-xs text-amber-600">Provider verification needs review. Your paid validity and last known SSH address are preserved. Do not pay again.</p>}
    {item.rootResetStatus==='redeploy_requested'&&<p className="mt-3 rounded-lg border p-3 text-xs text-muted-foreground">Root password update was requested. Railway may be redeploying this instance; check SSH connectivity before connecting.</p>}
    {item.validUntil&&<div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-sm">
     <div className="min-w-0"><div className="flex items-center gap-2 font-semibold"><CalendarClock size={16} className="text-emerald-500"/> Billing validity</div>
      <p className="mt-1 text-xs text-muted-foreground">Expires: {new Date(item.validUntil).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</p>
      {new Date(item.validUntil).getTime()<=Date.now()?<p className="mt-2 text-xs font-semibold text-amber-600">Expired · deployment is being stopped or is stopped</p>:
       new Date(item.validUntil).getTime()-Date.now()<=3*86400000&&<p className="mt-2 flex items-start gap-1 text-xs font-semibold text-amber-600"><AlertTriangle size={14}/> Expiring within 3 days — please renew now</p>}
     </div>
     {['running','paused','stopped','expired','resuming','resume_pending'].includes(item.status)&&<Link to={'/dashboard/checkout?renewInstanceId='+encodeURIComponent(item._id)} className="rounded-xl border border-emerald-500 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">Renew instance</Link>}
    </div>}
    {!item.validUntil&&item.status==='running'&&<p className="mt-2 text-xs text-muted-foreground">Legacy server: no new subscription expiry has been applied to this instance.</p>}
    <ServerActions item={item} onChanged={refresh}/>
    {item.status==='running'?<ServerCredentials item={item}/>:<p className="mt-3 text-xs text-muted-foreground">{['paused','stopped'].includes(item.status)?'This instance is stopped. Its saved endpoint is reserved; starting again creates a new Railway deployment and may erase ephemeral files.': ['expired','expiring','resume_pending','resuming','resume_failed'].includes(item.status)?'The paid period ended or renewal redeployment is in progress. Railway root data is ephemeral and may be lost when the service restarts.':'Your SSH details will appear after verified payment and successful provisioning.'}</p>}
   </div>)}
   {instances.filter(i=>i.status!=='draft'&&i.status!=='deleted').length===0&&<div className="rounded-xl border border-dashed p-7 text-center text-sm text-muted-foreground">No provisioned instances yet.</div>}</div>
   {instances.some(i=>i.status==='draft')&&<div className="mt-8"><h3 className="font-semibold">Saved drafts</h3><div className="mt-4 space-y-3">{instances.filter(i=>i.status==='draft').map((item,index)=><div key={item._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><p className="font-semibold">Draft {index+1}</p><p className="mt-1 text-xs text-muted-foreground">{item.os} · {item.ram} GB RAM · {item.cpu} vCPU · {formatPaise(item.computePriceINR*100)}/month · {item.billingMonths||1} month(s) validity</p></div><div className="flex gap-2"><Link to={'/dashboard/checkout?draftId='+encodeURIComponent(item._id)} className="rounded-lg border border-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-500">Checkout</Link><button type="button" disabled={!!removingDraft} onClick={()=>deleteDraft(item._id)} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50">{removingDraft===item._id?'Deleting…':'Delete'}</button></div></div>)}</div></div>}
  </section>
  <div className="mt-8 grid gap-6 lg:grid-cols-2">
   <section className="rounded-2xl border bg-card p-6"><h2 className="font-semibold">Quick access</h2><div className="mt-4 space-y-2">{shortcuts.map(({to,title,detail,Icon})=><Link key={to} to={to} className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted"><span className="rounded-lg bg-muted p-2"><Icon size={18}/></span><span className="flex-1"><span className="block text-sm font-medium">{title}</span><span className="block text-xs text-muted-foreground">{detail}</span></span><ArrowRight size={16} className="text-muted-foreground"/></Link>)}</div></section>
   <section className="rounded-2xl border bg-card p-6"><div className="flex items-center justify-between"><h2 className="font-semibold">Recent activity</h2><Link to="/notifications" className="text-xs font-medium text-emerald-500">View all</Link></div><div className="mt-5 space-y-3">{activity.length?activity.map((item,i)=><div key={item.id||item._id||i} className="rounded-xl border p-3"><p className="text-sm font-medium">{item.title||'Account activity'}</p><p className="mt-1 text-xs text-muted-foreground">{item.message||item.body||''}</p></div>):<div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">No recent activity to show.</div>}</div></section>
  </div>
 </main>;
}
