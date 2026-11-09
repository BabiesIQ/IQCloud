import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Cloud, Plus, RefreshCw, Server, Settings2, ShieldCheck, Wallet } from 'lucide-react';
import { apiRequest } from '@/services/apiClient';
import InstanceProgress from '@/components/InstanceProgress';
import ServerNetworking from '@/components/ServerNetworking';

export default function Dashboard() {
 const navigate=useNavigate();
 const [account,setAccount]=useState(null);
 const [activity,setActivity]=useState([]);
 const [instances,setInstances]=useState([]);
 const [removingDraft,setRemovingDraft]=useState('');
 const [payingDraft,setPayingDraft]=useState('');
 const [checkoutMessage,setCheckoutMessage]=useState('');
 const [pilotOrder,setPilotOrder]=useState(null);
 const [pilotPassword,setPilotPassword]=useState('');
 const [provisioning,setProvisioning]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 async function refresh(){
  setLoading(true);setError('');
  try{
   const user=await apiRequest('/api/v1/auth/me');
   setAccount(user);
   const inventory=await apiRequest('/api/v1/instances').catch(()=>null);
   setInstances(Array.isArray(inventory?.items)?inventory.items:[]);
   const result=await apiRequest('/api/v1/notifications').catch(()=>null);
   setActivity(Array.isArray(result?.notifications)?result.notifications.slice(0,3):Array.isArray(result?.items)?result.items.slice(0,3):[]);
  }catch(e){
   if(/unauthorized|session|401/i.test(e.message)){navigate('/login',{replace:true});return}
   setError(e.message||'Unable to load your account.');
  }finally{setLoading(false)}
 }
 useEffect(()=>{refresh()},[]);
 async function deleteDraft(id){
  if(!id||removingDraft)return;
  setRemovingDraft(id);
  try{await apiRequest('/api/v1/instances/drafts/'+encodeURIComponent(id),{method:'DELETE'});setInstances(items=>items.filter(x=>x._id!==id));}
  catch(e){setError(e.message||'Could not delete draft')}
  finally{setRemovingDraft('')}
 }
 async function payTestDraft(id){
  if(payingDraft)return;
  setPayingDraft(id);setCheckoutMessage('');
  try{
   const order=await apiRequest('/api/v1/payments/test/orders',{method:'POST',body:{draftId:id}});
   if(!order.testMode)throw Error('Only test checkout is permitted');
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
    name:'BabiesIQ Cloud',description:'Compute-only monthly plan • Razorpay Test Mode • Railway deployment requested separately',
    handler:async result=>{
     try{
      const verified=await apiRequest('/api/v1/payments/test/verify',{method:'POST',body:result});
      setCheckoutMessage(verified.message||'Test payment captured');
      if(verified.status==='captured_verified_test')setPilotOrder({orderId:order.orderId,draftId:id});
     }catch(e){setCheckoutMessage('Verification failed: '+e.message)}
     finally{setPayingDraft('')}
    },
    modal:{ondismiss:()=>setPayingDraft('')},
    theme:{color:'#10b981'}
   });
   checkout.on('payment.failed',response=>{setCheckoutMessage(response.error?.description||'Test payment failed');setPayingDraft('')});
   checkout.open();
  }catch(e){setCheckoutMessage(e.message||'Test checkout unavailable');setPayingDraft('')}
 }
 async function provisionPilot(){
  if(!pilotOrder||provisioning)return;
  setProvisioning(true);setCheckoutMessage('');
  try{
   const result=await apiRequest('/api/v1/payments/test/provision',{method:'POST',body:{orderId:pilotOrder.orderId,password:pilotPassword}});
   setCheckoutMessage(result.message||result.error||('Railway provisioning status: '+result.status));
   setPilotPassword('');
   if(result.status==='deploying')setPilotOrder(null);
  }catch(e){setCheckoutMessage(e.message||'Provisioning unavailable')}
  finally{setProvisioning(false)}
 }
 const activeCount=instances.filter(x=>x.status==='running').length;
 const draftCount=instances.filter(x=>x.status==='draft').length;
 const name=[account?.firstName,account?.lastName].filter(Boolean).join(' ')||account?.email?.split('@')[0]||'there';
 const shortcuts=[
  {to:'/security',title:'Security center',detail:'Manage signed-in devices',Icon:ShieldCheck},
  {to:'/settings',title:'Preferences',detail:'Password and appearance',Icon:Settings2},
  {to:'/notifications',title:'Notifications',detail:'Review account activity',Icon:Bell},
 ];
 return <main className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:pt-14">
  <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-500"><Cloud size={15}/> Cloud workspace</div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{loading?'Loading workspace…':`Welcome back, ${name}`}</h1><p className="mt-3 text-sm text-muted-foreground">Your infrastructure and account, in one place.</p></div><button type="button" onClick={refresh} disabled={loading} className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm hover:bg-muted disabled:opacity-50"><RefreshCw size={16}/> Refresh</button></div>
  {pilotOrder&&<div className="mt-6 rounded-xl border border-amber-500/40 p-4 text-sm"><p className="font-semibold">Real Railway provisioning pilot</p><p className="mt-2 text-muted-foreground">All validated Ubuntu/Debian configurations (1–8 GB RAM, 1–8 vCPU, eligible 50–1000 GB selected allowance) can request a real Railway pilot. Only one provisioning attempt per account. Selected storage is not guaranteed persistent SSD, and requested region is not enforced yet. Railway charges may apply even though Razorpay is in Test Mode. Your root password is sent once over HTTPS, not saved as a draft.</p><input type="password" autoComplete="new-password" value={pilotPassword} onChange={e=>setPilotPassword(e.target.value)} placeholder="Root password (16+ characters)" className="mt-3 w-full rounded-lg border bg-background p-3"/><button type="button" disabled={provisioning||pilotPassword.length<16} onClick={provisionPilot} className="mt-3 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50">{provisioning?'Requesting Railway deployment…':'Provision real Railway pilot'}</button></div>}
  {checkoutMessage&&<div role="status" className="mt-6 rounded-xl border border-amber-500/30 p-4 text-sm">{checkoutMessage}</div>}
  {error&&<div role="alert" className="mt-7 rounded-xl border border-red-500/30 p-4 text-sm">{error} <button onClick={refresh} className="ml-2 underline">Try again</button></div>}
  <div className="mt-9 grid gap-4 sm:grid-cols-3">
   <div className="rounded-2xl border bg-card p-5"><div className="flex items-center justify-between text-sm text-muted-foreground">Active servers <Server size={18}/></div><div className="mt-5 text-3xl font-semibold">{loading?"—":activeCount}</div><p className="mt-2 text-xs text-muted-foreground">{draftCount} saved configuration{draftCount===1?"":"s"}</p></div>
   <div className="rounded-2xl border bg-card p-5"><div className="flex items-center justify-between text-sm text-muted-foreground">Billing <Wallet size={18}/></div><div className="mt-5 text-lg font-semibold">Test checkout enabled</div><p className="mt-2 text-xs text-muted-foreground">Razorpay Test Mode · selected monthly compute price · Railway provisioning requested after payment</p></div>
   <div className="rounded-2xl border bg-card p-5"><div className="flex items-center justify-between text-sm text-muted-foreground">Account <ShieldCheck size={18}/></div><div className="mt-5 text-lg font-semibold">{loading?'Checking…':account?.emailVerified?'Verified':'Verification pending'}</div><p className="mt-2 truncate text-xs text-muted-foreground">{account?.email||'Secure session'}</p></div>
  </div>
  <section className="mt-8 rounded-3xl border bg-card p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">Your servers</h2><p className="mt-2 text-sm text-muted-foreground">Your saved configurations appear here; only successfully provisioned services count as active.</p></div><Link to="/configure" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><Plus size={17}/> Explore server setup</Link></div><InstanceProgress/><ServerNetworking/>{instances.length>0&&<div className="mt-7 space-y-3"><h3 className="text-sm font-semibold">Saved configurations and servers</h3>{instances.map(item=><div key={item._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><p className="font-medium">{item.os==='debian-12'?'Debian 12':'Ubuntu 24.04'} · {item.ram} GB RAM · {item.cpu} vCPU</p><p className="mt-1 text-xs text-muted-foreground">{item.storage} GB selected (not guaranteed persistent) · {item.region} · {item.status==='draft'?'Draft — no server provisioned':item.status}</p></div>{item.status==='draft'&&<button type="button" disabled={!!payingDraft} onClick={()=>payTestDraft(item._id)} className="rounded-lg border border-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-500 disabled:opacity-50">{payingDraft===item._id?'Opening test checkout…':`Pay ₹${item.computePriceINR ?? '—'} /month (TEST)`}</button>}{item.status==='draft'&&<button type="button" disabled={!!removingDraft} onClick={()=>deleteDraft(item._id)} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50">{removingDraft===item._id?'Deleting…':'Delete draft'}</button>}</div>)}</div>}<div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed px-4 py-12 text-center"><span className="rounded-2xl bg-muted p-4"><Server size={26} className="text-muted-foreground"/></span><h3 className="mt-5 font-semibold">Server management is coming soon</h3><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Provisioning is being connected. We don't display demo servers as real infrastructure.</p><Link to="/configure" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-500">Explore setup <ArrowRight size={16}/></Link></div></section>
  <div className="mt-8 grid gap-6 lg:grid-cols-2">
   <section className="rounded-2xl border bg-card p-6"><h2 className="font-semibold">Quick access</h2><div className="mt-4 space-y-2">{shortcuts.map(({to,title,detail,Icon})=><Link key={to} to={to} className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted"><span className="rounded-lg bg-muted p-2"><Icon size={18}/></span><span className="flex-1"><span className="block text-sm font-medium">{title}</span><span className="block text-xs text-muted-foreground">{detail}</span></span><ArrowRight size={16} className="text-muted-foreground"/></Link>)}</div></section>
   <section className="rounded-2xl border bg-card p-6"><div className="flex items-center justify-between"><h2 className="font-semibold">Recent activity</h2><Link to="/notifications" className="text-xs font-medium text-emerald-500">View all</Link></div><div className="mt-5 space-y-3">{activity.length?activity.map((item,i)=><div key={item.id||item._id||i} className="rounded-xl border p-3"><p className="text-sm font-medium">{item.title||'Account activity'}</p><p className="mt-1 text-xs text-muted-foreground">{item.message||item.body||''}</p></div>):<div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">No recent activity to show.</div>}</div></section>
  </div>
 </main>;
}
