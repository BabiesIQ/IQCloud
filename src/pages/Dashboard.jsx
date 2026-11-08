import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Cloud, Plus, RefreshCw, Server, Settings2, ShieldCheck, Wallet } from 'lucide-react';
import { apiRequest } from '@/services/apiClient';
import InstanceProgress from '@/components/InstanceProgress';

export default function Dashboard() {
 const navigate=useNavigate();
 const [account,setAccount]=useState(null);
 const [activity,setActivity]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 async function refresh(){
  setLoading(true);setError('');
  try{
   const user=await apiRequest('/api/v1/auth/me');
   setAccount(user);
   const result=await apiRequest('/api/v1/notifications').catch(()=>null);
   setActivity(Array.isArray(result?.notifications)?result.notifications.slice(0,3):Array.isArray(result?.items)?result.items.slice(0,3):[]);
  }catch(e){
   if(/unauthorized|session|401/i.test(e.message)){navigate('/login',{replace:true});return}
   setError(e.message||'Unable to load your account.');
  }finally{setLoading(false)}
 }
 useEffect(()=>{refresh()},[]);
 const name=[account?.firstName,account?.lastName].filter(Boolean).join(' ')||account?.email?.split('@')[0]||'there';
 const shortcuts=[
  {to:'/security',title:'Security center',detail:'Manage signed-in devices',Icon:ShieldCheck},
  {to:'/settings',title:'Preferences',detail:'Password and appearance',Icon:Settings2},
  {to:'/notifications',title:'Notifications',detail:'Review account activity',Icon:Bell},
 ];
 return <main className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:pt-14">
  <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-500"><Cloud size={15}/> Cloud workspace</div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{loading?'Loading workspace…':`Welcome back, ${name}`}</h1><p className="mt-3 text-sm text-muted-foreground">Your infrastructure and account, in one place.</p></div><button type="button" onClick={refresh} disabled={loading} className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm hover:bg-muted disabled:opacity-50"><RefreshCw size={16}/> Refresh</button></div>
  {error&&<div role="alert" className="mt-7 rounded-xl border border-red-500/30 p-4 text-sm">{error} <button onClick={refresh} className="ml-2 underline">Try again</button></div>}
  <div className="mt-9 grid gap-4 sm:grid-cols-3">
   <div className="rounded-2xl border bg-card p-5"><div className="flex items-center justify-between text-sm text-muted-foreground">Active servers <Server size={18}/></div><div className="mt-5 text-3xl font-semibold">—</div><p className="mt-2 text-xs text-muted-foreground">Server inventory not connected yet</p></div>
   <div className="rounded-2xl border bg-card p-5"><div className="flex items-center justify-between text-sm text-muted-foreground">Billing <Wallet size={18}/></div><div className="mt-5 text-lg font-semibold">Not configured</div><p className="mt-2 text-xs text-muted-foreground">No simulated charges or balances</p></div>
   <div className="rounded-2xl border bg-card p-5"><div className="flex items-center justify-between text-sm text-muted-foreground">Account <ShieldCheck size={18}/></div><div className="mt-5 text-lg font-semibold">{loading?'Checking…':account?.emailVerified?'Verified':'Verification pending'}</div><p className="mt-2 truncate text-xs text-muted-foreground">{account?.email||'Secure session'}</p></div>
  </div>
  <section className="mt-8 rounded-3xl border bg-card p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">Your servers</h2><p className="mt-2 text-sm text-muted-foreground">Your instances will appear when provisioning is connected.</p></div><Link to="/configure" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><Plus size={17}/> Explore server setup</Link></div><InstanceProgress/><div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed px-4 py-12 text-center"><span className="rounded-2xl bg-muted p-4"><Server size={26} className="text-muted-foreground"/></span><h3 className="mt-5 font-semibold">Server management is coming soon</h3><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Provisioning is being connected. We don't display demo servers as real infrastructure.</p><Link to="/configure" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-500">Explore setup <ArrowRight size={16}/></Link></div></section>
  <div className="mt-8 grid gap-6 lg:grid-cols-2">
   <section className="rounded-2xl border bg-card p-6"><h2 className="font-semibold">Quick access</h2><div className="mt-4 space-y-2">{shortcuts.map(({to,title,detail,Icon})=><Link key={to} to={to} className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted"><span className="rounded-lg bg-muted p-2"><Icon size={18}/></span><span className="flex-1"><span className="block text-sm font-medium">{title}</span><span className="block text-xs text-muted-foreground">{detail}</span></span><ArrowRight size={16} className="text-muted-foreground"/></Link>)}</div></section>
   <section className="rounded-2xl border bg-card p-6"><div className="flex items-center justify-between"><h2 className="font-semibold">Recent activity</h2><Link to="/notifications" className="text-xs font-medium text-emerald-500">View all</Link></div><div className="mt-5 space-y-3">{activity.length?activity.map((item,i)=><div key={item.id||item._id||i} className="rounded-xl border p-3"><p className="text-sm font-medium">{item.title||'Account activity'}</p><p className="mt-1 text-xs text-muted-foreground">{item.message||item.body||''}</p></div>):<div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">No recent activity to show.</div>}</div></section>
  </div>
 </main>;
}
