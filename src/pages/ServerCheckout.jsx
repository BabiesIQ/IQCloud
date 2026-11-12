import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, CreditCard, AlertTriangle } from 'lucide-react';
import { apiRequest } from '@/services/apiClient';
import { billingTerm, termQuote, priceINR } from '@/config/plans';
import BillingTermPicker from '@/components/cloud/BillingTermPicker';

export const route={path:'/dashboard/checkout',layout:'owner',access:'authenticated'};
export default function ServerCheckout(){
 const [params]=useSearchParams();
 const draftId=params.get('draftId')||'';
 const renewInstanceId=params.get('renewInstanceId')||'';
 const isRenewal=Boolean(renewInstanceId);
 const instanceId=isRenewal?renewInstanceId:draftId;
 const navigate=useNavigate();
 const [draft,setDraft]=useState(null);
 const [months,setMonths]=useState(1);
 const [loading,setLoading]=useState(true);
 const [paying,setPaying]=useState(false);
 const [error,setError]=useState('');
 const [order,setOrder]=useState(null);
 const [paymentUncertain,setPaymentUncertain]=useState(false);
 const [riskAcknowledged,setRiskAcknowledged]=useState(false);
 const busy=useRef(false);
 const quote=draft?termQuote(draft.ram,draft.cpu,months):null;
 const displayedQuote=order?.quote||quote;
 useEffect(()=>{
  let active=true;
  if(!/^[a-f0-9]{32}$/.test(instanceId)){
   setLoading(false);setError('Invalid instance configuration');return;
  }
  apiRequest('/api/v1/instances').then(data=>{
   if(!active)return;
   const found=(data.items||[]).find(x=>x._id===instanceId);
   const allowed=isRenewal?['running','expired','resuming','resume_pending'].includes(found?.status)&&!!found?.validUntil:found?.status==='draft';
   if(!allowed)throw Error(isRenewal?'This instance cannot be renewed yet. Open Dashboard for its current status.':'This draft is no longer payable. Check your dashboard before creating another payment.');
   setDraft(found);
   setMonths(isRenewal?1:billingTerm(found.billingMonths).months);
  }).catch(e=>{if(active)setError(e.message||'Instance unavailable')}).finally(()=>{if(active)setLoading(false)});
  return()=>{active=false};
 },[instanceId,isRenewal]);
 async function pay(){
  if(busy.current||!draft||!quote||paymentUncertain)return;
  if(isRenewal&&draft.status==='expired'&&!riskAcknowledged){
   setError('Please confirm that you understand ephemeral data can be lost when a stopped instance is redeployed.');return;
  }
  busy.current=true;setPaying(true);setError('');
  let modalOpened=false;
  try{
   let checkoutOrder=order;
   if(!checkoutOrder){
    checkoutOrder=isRenewal?
      await apiRequest('/api/v1/instances/'+encodeURIComponent(instanceId)+'/renewal/orders',{method:'POST',body:{billingMonths:months}}):
      await apiRequest('/api/v1/payments/test/orders',{method:'POST',body:{draftId:instanceId,billingMonths:months}});
    setOrder(checkoutOrder);
    if(checkoutOrder.amount!==quote.totalPaise||checkoutOrder.quote?.months!==months){
     setError('The backend price differs from your preview. Review the final gateway total below before continuing.');
     return;
    }
   }
   if(!checkoutOrder.keyId||!checkoutOrder.orderId)throw Error('Payment checkout is not ready');
   if(!window.Razorpay){
    await new Promise((resolve,reject)=>{
     const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';
     script.onload=resolve;script.onerror=()=>reject(Error('Could not load Razorpay checkout'));document.head.appendChild(script);
    });
   }
   const razorpay=new window.Razorpay({
    key:checkoutOrder.keyId,amount:checkoutOrder.amount,currency:checkoutOrder.currency,order_id:checkoutOrder.orderId,
    name:'BabiesIQ Cloud',description:(isRenewal?'Renewal · ':'Instance · ')+months+' month billing',
    handler:async response=>{
     setPaymentUncertain(true);
     try{
      await apiRequest('/api/v1/payments/test/verify',{method:'POST',body:response});
      navigate('/dashboard',{replace:true});
     }catch(e){
      setError('Payment may already have succeeded. Do NOT pay again. Check Dashboard for this order: '+checkoutOrder.orderId+'. '+(e.message||'Verification pending'));
     }finally{busy.current=false;setPaying(false)}
    },
    modal:{ondismiss:()=>{busy.current=false;setPaying(false);setError('If you completed payment, check your Dashboard. Do not pay again without checking order status.');}},
    theme:{color:'#10b981'}
   });
   razorpay.on('payment.failed',response=>{
    setError(response.error?.description||'Payment failed; check Razorpay status before retrying.');
    busy.current=false;setPaying(false);
   });
   razorpay.open();
   modalOpened=true;
  }catch(e){setError(e.message||'Checkout unavailable')}
  finally{if(!modalOpened){busy.current=false;setPaying(false)}}
 }
 return <main className="mx-auto max-w-3xl px-5 py-8 pb-24">
  <Link to={isRenewal?'/dashboard':'/dashboard/instances/new'} className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16}/> Back</Link>
  <p className="mt-7 text-xs font-bold uppercase tracking-widest text-emerald-500">Secure checkout</p>
  <h1 className="mt-2 text-3xl font-semibold">{isRenewal?'Renew your instance':'Review and checkout'}</h1>
  <p className="mt-3 text-sm text-muted-foreground">{isRenewal?'Renew the SAME VPS without creating a second service. Your existing validity is extended only after captured payment verification.':'Your root password is already encrypted with your draft; it is not required again after checkout.'}</p>
  {loading?<p className="mt-7">Loading your configuration…</p>:draft&&quote?<div className="mt-7 space-y-5">
   <div className="rounded-2xl border bg-card p-6">
    <div className="grid gap-4 sm:grid-cols-2">
     {[['Operating system',draft.os==='debian-12'?'Debian 12':'Ubuntu 24.04'],['RAM',draft.ram+' GB'],['CPU',draft.cpu+' vCPU'],['Region',draft.region],['SSH login','root'],['Storage','Shared ephemeral, no dedicated SSD']].map(([label,value])=><div key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></div>)}
    </div>
    {isRenewal&&draft.validUntil&&<p className="mt-4 rounded-xl bg-muted p-3 text-sm">Current validity ends: <strong>{new Date(draft.validUntil).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</strong>. Renewals extend from the later of now or the current expiry.</p>}
   </div>
   <div className="rounded-2xl border bg-card p-6">
    <BillingTermPicker months={months} onChange={value=>{setMonths(value);setError('')}} ram={draft.ram} cpu={draft.cpu} disabled={Boolean(order)||paying}/>
    {order&&<p className="mt-2 text-xs text-muted-foreground">Your secure Razorpay order is now locked to this term. Do not create another order to change validity.</p>}
    <div className="mt-6 space-y-3 rounded-xl bg-muted/50 p-5 text-sm">
     <div className="flex justify-between"><span>Monthly price × {displayedQuote.months} months</span><span>{priceINR(displayedQuote.subtotalPaise)}</span></div>
     <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400"><span>Discount ({displayedQuote.discountPercent}%)</span><span>- {priceINR(displayedQuote.discountPaise)}</span></div>
     <div className="flex justify-between border-t pt-3 text-lg font-bold"><span>Total payable</span><span>{priceINR(displayedQuote.totalPaise)}</span></div>
    </div>
    <p className="mt-4 text-xs leading-5 text-muted-foreground">Validity starts after SSH-ready for a new VPS. You will receive a warning 3 days before expiry. At expiry, the Railway deployment is stopped. Renewal requires another verified payment; there is no automatic card debit.</p>
    <div className="mt-4 flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-5 text-muted-foreground"><AlertTriangle size={17} className="shrink-0 text-amber-500"/> Railway root storage is ephemeral. Expiry followed by redeployment may erase data. Back up important files and renew before expiry.</div>
    {isRenewal&&draft.status==='expired'&&<label className="mt-4 flex items-start gap-2 text-sm"><input className="mt-1" type="checkbox" checked={riskAcknowledged} onChange={e=>setRiskAcknowledged(e.target.checked)}/><span>I understand restarting an expired Railway container may lose its files.</span></label>}
    <p className="mt-4 text-xs text-muted-foreground">Public SSH uses a provider hostname + port; dedicated IPv4 and IPv6 addresses are not included or guaranteed.</p>
    <button type="button" disabled={paying||paymentUncertain} onClick={pay} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary p-4 font-semibold text-primary-foreground disabled:opacity-50">
     <CreditCard size={18}/>{paying?'Opening payment…':paymentUncertain?'Verify payment in Dashboard':'Pay '+priceINR(displayedQuote.totalPaise)}
    </button>
    <p className="mt-3 text-center text-xs text-muted-foreground"><ShieldCheck size={13} className="mr-1 inline"/> The backend verifies the exact amount and gateway capture. Never pay twice for the same order.</p>
   </div>
  </div>:null}
  {error&&<p role="alert" className="mt-5 rounded-xl border border-amber-500/40 p-4 text-sm">{error}</p>}
 </main>;
}
