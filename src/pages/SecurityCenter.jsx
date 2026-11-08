import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '@/services/apiClient';

function formatTime(value) {
 if(!value || Number.isNaN(Date.parse(value))) return 'Not available';
 return new Date(value).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
}
export default function SecurityCenter() {
 const [sessions,setSessions]=useState([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState('');
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const navigate=useNavigate();
 const refresh=useCallback(async()=>{
  try {
   const result=await apiRequest('/api/v1/auth/sessions');
   setSessions(result.sessions || []);setError('');
  } catch(e) {
   if(e.message==='unauthorized'){navigate('/login',{replace:true});return;}
   setError(e.message||'Could not load sessions');
  } finally {setLoading(false);}
 },[navigate]);
 useEffect(()=>{refresh()},[refresh]);
 async function revoke(id) {
  setBusy(id);setError('');setMessage('');
  try{
   await apiRequest('/api/v1/auth/sessions/'+encodeURIComponent(id),{method:'DELETE'});
   setMessage('Session signed out.');
   await refresh();
  }catch(e){setError(e.message)}finally{setBusy('')}
 }
 async function revokeOthers() {
  setBusy('others');setError('');setMessage('');
  try{
   await apiRequest('/api/v1/auth/sessions/revoke-others',{method:'POST'});
   setMessage('All other sessions have been signed out.');
   await refresh();
  }catch(e){setError(e.message)}finally{setBusy('')}
 }
 return <main className="mx-auto max-w-3xl px-5 py-12 sm:py-20">
  <Link to="/dashboard" className="text-sm text-muted-foreground">← Dashboard</Link>
  <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
   <div><p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">Account security</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Your devices</h1><p className="mt-2 text-sm text-muted-foreground">Review where your BabiesIQ Cloud account is signed in.</p></div>
   <button onClick={revokeOthers} disabled={!!busy||loading||sessions.length<=1} className="rounded-xl border px-4 py-3 text-sm font-medium disabled:opacity-50">{busy==='others'?'Signing out…':'Log out other devices'}</button>
  </div>
  {error&&<p role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">{error}</p>}
  {message&&<p role="status" className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-500">{message}</p>}
  <section className="mt-8 space-y-3" aria-label="Active sessions">
   {loading?<p className="text-sm text-muted-foreground">Loading your sessions…</p>:sessions.length===0?<p className="rounded-2xl border p-6 text-sm text-muted-foreground">No active sessions found.</p>:
   sessions.map(session=><article key={session.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5">
    <div className="flex min-w-0 items-start gap-3"><span className="rounded-xl bg-emerald-500/10 p-3 text-xl" aria-hidden="true">▣</span><div><h2 className="font-semibold">{session.device||'Unknown device'} {session.current&&<span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-normal text-emerald-500">This device</span>}</h2><p className="mt-1 text-xs text-muted-foreground">Last active: {formatTime(session.lastSeen)}</p><p className="text-xs text-muted-foreground">Signed in: {formatTime(session.createdAt)}</p></div></div>
    {!session.current&&<button disabled={!!busy} onClick={()=>revoke(session.id)} className="rounded-xl border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50">{busy===session.id?'Signing out…':'Sign out'}</button>}
   </article>)}
  </section>
  <p className="mt-8 text-xs leading-6 text-muted-foreground">Sessions automatically expire after 7 days of inactivity or 30 days total. If you see an unfamiliar device, revoke it and reset your password.</p>
 </main>;
}
