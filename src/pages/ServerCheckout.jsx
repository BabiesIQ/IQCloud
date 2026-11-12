import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, CreditCard } from 'lucide-react';
import { apiRequest } from '@/services/apiClient';

export const route={path:'/dashboard/checkout',layout:'owner',access:'authenticated'};
export default function ServerCheckout(){
 const [params]=useSearchParams();
 const draftId=params.get('draftId')||'';
 const navigate=useNavigate();
 const [draft,setDraft]=useState(null);
 const [loading,setLoading]=useState(true);
 const [paying,setPaying]=useState(false);
 const [error,setError]=useState('');
 const [order,setOrder]=useState(null);
 const busy=useRef(false);
 useEffect(()=>{
  let active=true;
  if(!/^[a-f0-9]{32}$/.test(draftId)){setLoading(false);setError('Invalid configuration');return}
  apiRequest('/api/v1/instances').then(data=>{
   if(!active)return;
   const found=(data.items||[]).find(x=>x._id===draftId);
   if(!found||found.status!=='draft')throw Error('This draft is no longer payable. Check your dashboard to avoid repeat payment.');
   setDraft(found);
  }).catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)});
  return()=>{active=false};
 },[draftId]);
 async function pay(){
  if(busy.current||!draft)return;
  busy.current=true;setPaying(true);setError('');
  try{
   let checkoutOrder=order;
   if(!checkoutOrder){
    checkoutOrder=await apiRequest('/api/v1/payments/test/orders',{method:'POST',body:{draftId}});
    setOrder(checkoutOrder);
   }
   if(!checkoutOrder.keyId||!checkoutOrder.orderId)throw Error('Payment checkout is not ready');
   if(!window.Razorpay){
    await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';script.onload=resolve;script.onerror=()=>reject(Error('Could not load Razorpay'));document.head.appendChild(script)});
   }
   const checkout=new window.Razorpay({
    key:checkoutOrder.keyId,amount:checkoutOrder.amount,currency:checkoutOrder.currency,order_id:checkoutOrder.orderId,
    name:'BabiesIQ Cloud',description:'Monthly RAM and CPU plan',
    handler:async response=>{
     try{
      await apiRequest('/api/v1/payments/test/verify',{method:'POST',body:response});
     }catch(e){setError('Payment may have been captured. Check the existing order; do not pay again. '+e.message)}
     finally{busy.current=false;setPaying(false);navigate('/dashboard')}
    },
    modal:{ondismiss:()=>{busy.current=false;setPaying(false);setError('If payment succeeded, check the dashboard and do not pay again.')}},
    theme:{color:'#10b981'}
   });
   checkout.on('payment.failed',response=>{setError(response.error?.description||'Payment failed.');busy.current=false;setPaying(false)});
   checkout.open();
  }catch(e){setError(e.message||'Checkout unavailable');busy.current=false;setPaying(false)}
 }
 return <main className="mx-auto max-w-3xl py-6">
  <Link to="/dashboard/instances/new" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16}/> Back</Link>
  <p className="mt-7 text-xs font-bold uppercase tracking-widest text-emerald-500">Secure checkout</p>
  <h1 className="mt-2 text-3xl font-semibold">Review and checkout</h1>
  <p className="mt-3 text-sm text-muted-foreground">Your root password was encrypted when you continued from Create Server. You do not need to enter it again after payment.</p>
  {loading?<p className="mt-7">Loading your configuration…</p>:draft?<div className="mt-7 rounded-2xl border bg-card p-6">
   <div className="grid gap-4 sm:grid-cols-2">
    {[[ 'Operating system',draft.os==='debian-12'?'Debian 12':'Ubuntu 24.04'],['RAM',draft.ram+' GB'],['CPU',draft.cpu+' vCPU'],['Region',draft.region],['SSH login','root • host and port after deployment'],['Storage','Shared ephemeral; no dedicated SSD quota']].map(([label,value])=><div key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></div>)}
   </div>
   <div className="mt-5 border-t pt-5"><p className="text-sm text-muted-foreground">Monthly compute price</p><p className="mt-2 text-3xl font-bold">₹{draft.computePriceINR}<span className="text-sm font-normal text-muted-foreground"> /month</span></p></div>
   <p className="mt-4 text-xs text-muted-foreground">Network uses Railway public TCP proxy (hostname + port). Dedicated public IPv4 and IPv6 addresses are not included or guaranteed. IPv4/IPv6 connectivity is dependent on provider DNS/routing. Disk data is ephemeral.</p>
   <button type="button" disabled={paying} onClick={pay} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary p-4 font-semibold text-primary-foreground disabled:opacity-50"><CreditCard size={18}/>{paying?'Opening payment…':'Proceed to Razorpay checkout'}</button>
   <p className="mt-3 text-center text-xs text-muted-foreground"><ShieldCheck size={13} className="mr-1 inline"/> Payment is verified by the backend before provisioning; do not pay twice.</p>
  </div>:null}
  {error&&<p role="alert" className="mt-5 rounded-xl border border-amber-500/40 p-4 text-sm">{error}</p>}
 </main>;
}