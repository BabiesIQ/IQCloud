import {useEffect,useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {ArrowRight,Globe2,RefreshCw,Server,ArrowLeft} from 'lucide-react';
import {apiRequest} from '@/services/apiClient';

export const route={path:'/domains',layout:'owner',access:'authenticated'};

export default function Domains(){
 const navigate=useNavigate();
 const [items,setItems]=useState([]);const [working,setWorking]=useState(true);const [error,setError]=useState('');
 async function refresh(){
  setWorking(true);setError('');
  try{
   const response=await apiRequest('/api/v1/instances');
   const list=(response.items||[]).filter(i=>i.status!=='draft'&&i.status!=='deleted').slice().sort((a,b)=>new Date(a.createdAt||0)-new Date(b.createdAt||0));
   setItems(list.map((server,index)=>({server,number:index+1})).filter(x=>x.server.status==='running'));
  }catch(e){if(/session|unauthorized|401/i.test(e.message)){navigate('/login',{replace:true});return}setError(e.message||'Unable to load your VPS')}
  finally{setWorking(false)}
 }
 useEffect(()=>{refresh()},[]);
 return <main className="mx-auto max-w-4xl pb-20">
  <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16}/> Dashboard</Link>
  <div className="mt-6 flex items-start gap-3"><div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-500"><Globe2 size={23}/></div><div className="flex-1"><p className="text-xs font-semibold uppercase tracking-[.15em] text-emerald-500">Networking</p><h1 className="mt-1 text-3xl font-semibold">Domains</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Select a VPS, enter the HTTP port your website uses, then connect your own domain and verify its DNS records.</p></div></div>
  <div className="mt-8 flex items-center justify-between"><h2 className="font-semibold">Your VPS</h2><button onClick={refresh} disabled={working} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm disabled:opacity-40"><RefreshCw size={15}/> Refresh</button></div>
  {error&&<p role="alert" className="mt-4 rounded-xl border border-red-500/40 p-4 text-sm text-red-500">{error}</p>}
  <div className="mt-4 space-y-3">
   {working&&!items.length&&<p className="rounded-2xl border p-6 text-sm text-muted-foreground">Loading your servers…</p>}
   {!working&&!items.length&&<div className="rounded-2xl border bg-card p-6"><p className="text-sm text-muted-foreground">No running VPS available for domain connection. Your VPS must be running and paid.</p><Link to="/dashboard" className="mt-4 inline-block text-sm font-semibold text-emerald-500 underline">Open Dashboard</Link></div>}
   {items.map(({server,number})=><Link key={server._id} to={'/domains/'+encodeURIComponent(server._id)} className="flex items-center gap-4 rounded-2xl border bg-card p-5 transition hover:border-emerald-500/50">
     <div className="rounded-xl bg-muted p-3"><Server size={19}/></div><div className="min-w-0 flex-1"><p className="font-semibold">Instance {number}</p><p className="mt-1 text-sm text-muted-foreground">{server.os?.replace('-',' ')} · {server.ram} GB RAM · {server.cpu} vCPU</p><p className="mt-1 text-xs text-emerald-500">Running · Manage HTTP domains</p></div><ArrowRight size={19} className="shrink-0 text-emerald-500"/>
   </Link>)}
  </div>
 </main>;
}
