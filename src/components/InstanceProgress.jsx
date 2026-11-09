import { useEffect, useState } from 'react';
import { apiRequest } from '@/services/apiClient';
const steps=['payment_pending','queued','creating','deploying','configuring','running'];
export default function InstanceProgress(){
 const [items,setItems]=useState([]);
 const [error,setError]=useState('');
 const [deleting,setDeleting]=useState('');
 const [paying,setPaying]=useState('');
 const [paymentMessage,setPaymentMessage]=useState('');
 async function loadCheckout(){if(window.Razorpay)return;await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';script.onload=resolve;script.onerror=()=>reject(new Error('Could not load Razorpay Checkout'));document.head.appendChild(script)})}
 async function testPayment(id){setPaying(id);setPaymentMessage('');try{await loadCheckout();const order=await apiRequest('/api/v1/payments/test/orders',{method:'POST',body:{draftId:id}});if(!order.testOnly||order.amount!==100)throw new Error('Unexpected test order');new window.Razorpay({key:order.keyId,amount:order.amount,currency:order.currency,order_id:order.orderId,name:'BabiesIQ Cloud',description:'TEST ONLY · ₹1 simulated payment · no VPS purchase',handler:async response=>{try{const result=await apiRequest('/api/v1/payments/test/verify',{method:'POST',body:response});setPaymentMessage(result.verified?'Test payment verified. No server was created.':'Payment not verified')}catch(e){setPaymentMessage(e.message||'Payment verification failed')}},modal:{ondismiss:()=>setPaymentMessage('Test checkout closed')}}).open()}catch(e){setPaymentMessage(e.message||'Test checkout unavailable')}finally{setPaying('')}}
 async function removeDraft(id){if(!window.confirm('Delete this saved configuration?'))return;setDeleting(id);try{await apiRequest('/api/v1/instances/drafts/'+encodeURIComponent(id),{method:'DELETE'});setItems(old=>old.filter(item=>item._id!==id))}catch(e){setError(e.message||'Could not delete draft')}finally{setDeleting('')}}
 useEffect(()=>{
  let alive=true;
  const load=async()=>{
   try{const data=await apiRequest('/api/v1/instances');if(alive){setItems(Array.isArray(data.items)?data.items:[]);setError('')}}
   catch(e){if(alive)setError('Instance status is temporarily unavailable.')}
  };
  load();const interval=setInterval(()=>{if(!document.hidden)load()},12000);
  return()=>{alive=false;clearInterval(interval)}
 },[]);
 if(error)return <p role="status" className="mt-4 text-xs text-muted-foreground">{error}</p>;
 if(!items.length)return null;
 return <div className="mt-6 space-y-3">{paymentMessage&&<p role="status" className="rounded-xl border p-3 text-sm">{paymentMessage}</p>}{items.map((item,i)=>{
  const stage=steps.indexOf(item.status);
  const percent=item.status==='running'?100:item.status==='failed'?0:Math.max(0,Math.round(stage/5*100));
  return <div key={item._id||i} className="rounded-xl border p-4">
   <div className="flex justify-between gap-3 text-sm"><strong>{item.name||'Cloud instance'}</strong><span className="capitalize text-muted-foreground">{item.status==='creating'||item.status==='deploying'?'Creating server…':(item.status||'Pending').replaceAll('_',' ')}</span></div>
   <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Server creation progress" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-emerald-500 transition-all" style={{width:percent+'%'}}/></div>
   <p className="mt-2 text-xs text-muted-foreground">{item.status==='draft'?'Configuration saved. No payment taken and no server created.':item.status==='running'?'Server ready':item.status==='failed'?'Provisioning failed':'Progress follows actual backend status.'}</p>
   {item.status==='draft'&&<div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"><span className="text-muted-foreground">{item.ram} GB RAM · {item.cpu} vCPU · {item.storage} GB SSD · {item.region}</span><div className="flex flex-wrap gap-2"><button type="button" disabled={paying===item._id} onClick={()=>testPayment(item._id)} className="rounded-lg border px-3 py-2 text-emerald-500 disabled:opacity-50">{paying===item._id?"Opening…":"Test Razorpay ₹1"}</button><button type="button" disabled={deleting===item._id} onClick={()=>removeDraft(item._id)} className="rounded-lg border px-3 py-2 text-red-500 disabled:opacity-50">{deleting===item._id?'Deleting…':'Delete draft'}</button></div></div>}
  </div>
 })}</div>
}
