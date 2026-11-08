import { useEffect, useState } from 'react';
import { apiRequest } from '@/services/apiClient';
const steps=['payment_pending','queued','creating','deploying','configuring','running'];
export default function InstanceProgress(){
 const [items,setItems]=useState([]);
 const [error,setError]=useState('');
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
 return <div className="mt-6 space-y-3">{items.map((item,i)=>{
  const stage=steps.indexOf(item.status);
  const percent=item.status==='running'?100:item.status==='failed'?0:Math.max(0,Math.round(stage/5*100));
  return <div key={item._id||i} className="rounded-xl border p-4">
   <div className="flex justify-between gap-3 text-sm"><strong>{item.name||'Cloud instance'}</strong><span className="capitalize text-muted-foreground">{item.status==='creating'||item.status==='deploying'?'Creating server…':(item.status||'Pending').replaceAll('_',' ')}</span></div>
   <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Server creation progress" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-emerald-500 transition-all" style={{width:percent+'%'}}/></div>
   <p className="mt-2 text-xs text-muted-foreground">{item.status==='running'?'Server ready':item.status==='failed'?'Provisioning failed':'Progress follows actual backend status.'}</p>
  </div>
 })}</div>
}
