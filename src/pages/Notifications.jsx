import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '@/services/apiClient';

export default function Notifications() {
 const navigate=useNavigate();
 const [items,setItems]=useState([]);
 const [unread,setUnread]=useState(0);
 const [busy,setBusy]=useState('');
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const load=useCallback(async()=>{
  try{
   const data=await apiRequest('/api/v1/notifications');
   setItems(data.notifications||[]);
   setUnread(data.unreadCount||0);
   setError('');
   window.dispatchEvent(new Event('iqcloud:notifications-changed'));
  }catch(e){
   if(e.message==='unauthorized'){navigate('/login',{replace:true});return;}
   setError(e.message||'Could not load notifications');
  }finally{setLoading(false);}
 },[navigate]);
 useEffect(()=>{load()},[load]);
 async function markRead(id){
  setBusy(id);setError('');
  try{await apiRequest('/api/v1/notifications/'+encodeURIComponent(id)+'/read',{method:'POST'});await load();}
  catch(e){setError(e.message||'Unable to update notification');}
  finally{setBusy('');}
 }
 async function markAll(){
  setBusy('all');setError('');
  try{await apiRequest('/api/v1/notifications/read-all',{method:'POST'});await load();}
  catch(e){setError(e.message||'Unable to update notifications');}
  finally{setBusy('');}
 }
 return <main className="mx-auto max-w-3xl px-5 py-12 sm:py-20">
  <Link to="/dashboard" className="text-sm text-muted-foreground">← Dashboard</Link>
  <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
   <div><p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">Activity & security</p><h1 className="mt-2 text-3xl font-semibold">Notifications</h1><p className="mt-2 text-sm text-muted-foreground">{unread} unread · Recent account activity</p></div>
   <button onClick={markAll} disabled={!!busy||unread===0} className="rounded-xl border px-4 py-3 text-sm disabled:opacity-50">{busy==='all'?'Updating…':'Mark all as read'}</button>
  </div>
  {error&&<p role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">{error}</p>}
  <section className="mt-8 space-y-3" aria-label="Account notifications">
   {loading?<p className="text-sm text-muted-foreground">Loading notifications…</p>:items.length===0?<div className="rounded-2xl border p-8 text-center"><p className="font-medium">You're all caught up</p><p className="mt-2 text-sm text-muted-foreground">Account activity will appear here.</p></div>:
   items.map(item=><article key={item.id} className={`flex items-start justify-between gap-4 rounded-2xl border p-5 ${item.read?'bg-card':'border-emerald-500/30 bg-emerald-500/5'}`}>
    <div className="flex min-w-0 gap-3"><span aria-hidden="true" className="rounded-xl bg-emerald-500/10 p-3 text-lg">{item.type==='security'?'♢':'✦'}</span><div><div className="flex items-center gap-2"><h2 className="font-semibold">{item.title}</h2>{!item.read&&<span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-label="Unread"/>}</div><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.message}</p><p className="mt-2 text-xs text-muted-foreground">{item.createdAt?new Date(item.createdAt).toLocaleString():'Recently'}</p></div></div>
    {!item.read&&<button disabled={!!busy} onClick={()=>markRead(item.id)} className="shrink-0 rounded-lg border px-3 py-2 text-xs disabled:opacity-50">{busy===item.id?'Wait…':'Mark read'}</button>}
   </article>)}
  </section>
 </main>;
}
