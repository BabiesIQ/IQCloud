import {useState,useRef} from 'react';
import {apiRequest} from '@/services/apiClient';
const input='w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm';
const button='rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50';
const primary='rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50';
const formatDate=v=>v&&new Date(v).getFullYear()>1?new Date(v).toLocaleString():'Not assigned';
const localDate=v=>{const d=new Date(v);if(!v||d.getFullYear()<2020)return '';return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16)};
const initial={ram:1,cpu:1,os:'ubuntu-24',region:'ap-southeast',days:30,rootPassword:'',adminPassword:''};
const regions=[['ap-southeast','Singapore'],['us-west','US West'],['us-east','US East'],['eu-west','Europe West']];
const systems=[['ubuntu-24','Ubuntu 24'],['ubuntu-22','Ubuntu 22'],['ubuntu-26','Ubuntu 26'],['debian-12','Debian 12']];
export default function AdminVPSManager({customer,instances=[],onRefresh}){
 const [create,setCreate]=useState(false),[form,setForm]=useState(initial),[email,setEmail]=useState(''),[users,setUsers]=useState([]),[owner,setOwner]=useState(null);
 const [manage,setManage]=useState(null),[until,setUntil]=useState(''),[phrase,setPhrase]=useState(''),[password,setPassword]=useState(''),[resume,setResume]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const requestId=useRef('');const lock=useRef(false);
 const selected=customer||owner;
 const change=(key,value)=>setForm(f=>({...f,[key]:value}));
 const run=async(fn)=>{if(lock.current)return;lock.current=true;setBusy(true);setError('');setMessage('');try{await fn()}catch(e){setError(e.message||'Request failed')}finally{lock.current=false;setBusy(false)}};
 const refresh=()=>{onRefresh?.()};
 const findUsers=()=>run(async()=>{if(!email.trim())throw Error('Enter the start of an email address');const r=await apiRequest('/api/v1/admin/users?search='+encodeURIComponent(email.trim().toLowerCase()));setUsers(r.items||[]);setOwner(null)});
 const createVPS=e=>{e.preventDefault();run(async()=>{
  if(!selected?.id||!selected.emailVerified||selected.accountDisabledAt)throw Error('Select an active, verified customer');
  if(!requestId.current)requestId.current=crypto.randomUUID().replaceAll('-','');
  const r=await apiRequest('/api/v1/admin/servers',{method:'POST',body:{...form,ram:Number(form.ram),cpu:Number(form.cpu),days:Number(form.days),userId:selected.id,requestId:requestId.current}});
  setMessage('VPS '+r.id+' — '+r.status+'. No payment created. Refresh to follow deployment.');
  requestId.current='';setForm(initial);setCreate(false);refresh();
 })};
 const start=(v,action)=>{setManage({v,action});setUntil(localDate(v.validUntil));setPhrase('');setPassword('');setResume(false);setMessage('');setError('')};
 const close=()=>{setManage(null);setPassword('');setPhrase('');setResume(false)};
 const expected=manage?(manage.action==='delete'?'DELETE ':'CHANGE ')+manage.v.id:'';
 const apply=e=>{e.preventDefault();run(async()=>{
  if(phrase!==expected||!password)throw Error('Confirm the exact phrase and admin password');
  const body={adminPassword:password,phrase};
  if(manage.action==='validity'){if(!until)throw Error('Choose an expiry date');body.validUntil=new Date(until).toISOString();body.resumeExpired=resume}
  await apiRequest('/api/v1/admin/servers/'+encodeURIComponent(manage.v.id)+'/'+manage.action,{method:'POST',body});
  setMessage(manage.action==='delete'?'VPS permanently deleted.':'VPS validity updated.');close();refresh();
 })};
 const copy=async id=>{try{await navigator.clipboard.writeText(id);setMessage('ID copied')}catch{setError('Copy unavailable; select the ID manually')}};
 return <div className="space-y-4">
  <div className="flex flex-wrap items-center gap-2"><button type="button" className={primary} disabled={busy} onClick={()=>{setCreate(v=>!v);setError('');setMessage('')}}>{create?'Close create form':'+ Create free VPS'}</button><button type="button" className={button} disabled={busy} onClick={refresh}>Refresh VPS</button></div>
  {error&&<p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">{error}</p>}
  {message&&<p role="status" className="break-all rounded-xl bg-emerald-500/10 p-3 text-sm">{message}</p>}
  {create&&<section className="space-y-4 rounded-2xl border border-border p-4">
   <h3 className="font-semibold">Complimentary VPS configuration</h3><p className="text-xs text-muted-foreground">No customer payment. Provider usage is billed to the Cloud owner. Validity starts after SSH is ready. Shared ephemeral storage applies.</p>
   {!customer&&<><div className="flex gap-2"><input className={input} aria-label="Customer email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Search customer email"/><button type="button" className={button} disabled={busy} onClick={findUsers}>Find</button></div><div className="max-h-44 space-y-1 overflow-auto">{users.map(u=><button type="button" disabled={busy||!u.emailVerified||!!u.accountDisabledAt} key={u.id} className={button+' w-full break-all text-left '+(owner?.id===u.id?'border-emerald-500':'')} onClick={()=>setOwner(u)}>{u.email}</button>)}</div></>}
   <p className="break-all text-sm">Owner: <strong>{selected?.email||'Select a customer'}</strong></p>
   <form onSubmit={createVPS} className="space-y-3">
    <div className="grid gap-3 sm:grid-cols-2">
     {['ram','cpu','days'].map(k=><label key={k} className="space-y-1 text-xs font-medium">{({ram:'RAM (GB)',cpu:'CPU (vCPU)',days:'Validity (days)'})[k]}<input className={input} required type="number" min="1" max={k==='days'?3650:24} value={form[k]} onChange={e=>change(k,e.target.value)}/></label>)}
     <label className="space-y-1 text-xs font-medium">Operating system<select className={input} value={form.os} onChange={e=>change('os',e.target.value)}>{systems.map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></label>
     <label className="space-y-1 text-xs font-medium">Region<select className={input} value={form.region} onChange={e=>change('region',e.target.value)}>{regions.map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></label>
    </div>
    <label className="block space-y-1 text-xs">Initial root password<input required type="password" autoComplete="new-password" className={input} value={form.rootPassword} onChange={e=>change('rootPassword',e.target.value)}/></label>
    <label className="block space-y-1 text-xs">Confirm admin password<input required type="password" autoComplete="off" className={input} value={form.adminPassword} onChange={e=>change('adminPassword',e.target.value)}/></label>
    <button className={primary} disabled={busy||!selected?.id||!selected.emailVerified||!!selected.accountDisabledAt} type="submit">{busy?'Submitting…':'Create VPS without payment'}</button>
   </form>
  </section>}
  {manage&&<form onSubmit={apply} className="space-y-3 rounded-xl border border-border p-4">
   <h3 className="font-semibold">{manage.action==='delete'?'Permanently delete VPS':'Change VPS validity'}</h3><p className="break-all text-xs">VPS: {manage.v.vpsId||manage.v.id}</p>
   {manage.action==='delete'?<p className="text-sm text-red-600 dark:text-red-300">This permanently deletes provider resources and ephemeral files. Payment records remain; no automatic refund.</p>:<><p className="text-xs text-muted-foreground">Current expiry: {formatDate(manage.v.validUntil)}. Choose an earlier or later date. Times use your device time zone.</p><input aria-label="New expiry date and time" required type="datetime-local" className={input} value={until} onChange={e=>setUntil(e.target.value)}/>{manage.v.status==='expired'&&<label className="flex gap-2 text-xs"><input required type="checkbox" checked={resume} onChange={e=>setResume(e.target.checked)}/>I authorize redeployment of this expired VPS; ephemeral data may be lost.</label>}</>}
   <label className="block space-y-1 break-all text-xs">Type exactly: <strong>{expected}</strong><input className={input} required value={phrase} onChange={e=>setPhrase(e.target.value)}/></label>
   <label className="block space-y-1 text-xs">Admin password<input required type="password" autoComplete="off" className={input} value={password} onChange={e=>setPassword(e.target.value)}/></label>
   <div className="flex gap-2"><button type="submit" disabled={busy||phrase!==expected||!password} className={manage.action==='delete'?button+' text-red-600':primary}>{busy?'Processing…':'Confirm'}</button><button type="button" className={button} disabled={busy} onClick={close}>Cancel</button></div>
  </form>}
  <div className="space-y-2">{instances.filter(v=>v.status!=='draft').map(v=><article key={v.id} className="space-y-2 rounded-xl border border-border p-3 text-sm">
   <div className="flex flex-wrap justify-between gap-2"><strong>{v.ram} GB RAM · {v.cpu} vCPU · {v.os} · {v.region}</strong><span className="rounded-full bg-muted px-2 py-1 text-xs">{v.status}</span></div>
   <div className="break-all text-xs text-muted-foreground">VPS ID: <strong>{v.vpsId||'Not assigned yet'}</strong> {v.vpsId&&<button type="button" className="underline" onClick={()=>copy(v.vpsId)}>Copy</button>}</div>
   <div className="break-all text-xs">Record ID: {v.id} <button type="button" className="underline" onClick={()=>copy(v.id)}>Copy</button></div>
   <div className="break-all text-xs">User ID: {v.userId}</div>
   <div className="break-all text-xs">Provider service: {v.serviceId||'Pending'}</div>
   <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs"><span>Source: {v.adminGrant?'Admin grant · free':v.paymentStatus||'—'}</span><span>Billing: {v.billingStatus||'—'}</span><span>Expires: {formatDate(v.validUntil)}</span></div>
   {['running','paused','stopped','expired'].includes(v.status)&&<div className="flex flex-wrap gap-2"><button type="button" className={button} disabled={busy} onClick={()=>start(v,'validity')}>Change validity</button><button type="button" className={button+' text-red-600'} disabled={busy} onClick={()=>start(v,'delete')}>Delete VPS</button></div>}
  </article>)}{!instances.some(v=>v.status!=='draft')&&<p className="text-sm text-muted-foreground">No VPS records found.</p>}</div>
 </div>
}
