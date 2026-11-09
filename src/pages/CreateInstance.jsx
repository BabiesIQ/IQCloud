import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Cpu, HardDrive, LockKeyhole, MapPin, MemoryStick, Server } from 'lucide-react';
import { apiRequest } from '@/services/apiClient';

const matrix=[[49,65,85,105,125,145,165,185],[65,99,115,135,155,175,195,215],[85,120,150,170,190,210,230,250],[110,185,200,220,240,260,280,300],[130,195,215,240,260,280,300,320],[150,220,240,270,290,310,330,350],[175,245,270,300,325,350,375,400],[200,275,300,350,375,400,450,500]];
const storageCaps=[[200,200,200,200,200,200,200,200],[200,300,300,300,300,300,300,300],[200,300,450,450,450,450,450,450],[200,500,500,500,500,500,500,500],[200,350,450,450,500,500,500,500],[200,350,450,550,600,600,600,600],[200,350,450,600,650,700,700,700],[200,350,500,700,750,800,900,1000]];
const regions=[['us-west','US West'],['us-east','US East'],['eu-west','Europe West'],['ap-southeast','Asia Pacific']];
function ResourceSlider({title,icon:Icon,value,onChange,min=1,max=8,unit='GB',soon='Higher capacity coming soon'}){
 return <div className="rounded-2xl border bg-card p-5"><div className="flex items-center justify-between"><span className="flex items-center gap-2 font-medium"><Icon size={18} className="text-emerald-500"/>{title}</span><strong>{value} {unit}</strong></div><input type="range" min={min} max={max} step={1} value={value} onChange={e=>onChange(Number(e.target.value))} className="mt-5 w-full accent-emerald-500" aria-label={title}/><div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{min} {unit}</span><span>{max} {unit}</span></div><div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole size={13}/>{soon}</div></div>
}
export default function CreateInstance(){
 const navigate=useNavigate();
 const [type,setType]=useState('linux');
 const [os,setOs]=useState('ubuntu-24');
 const [ram,setRam]=useState(2);
 const [cpu,setCpu]=useState(2);
 const [storage,setStorage]=useState(200);
 const [region,setRegion]=useState('ap-southeast');
 const maxStorage=storageCaps[ram-1][cpu-1];
 const selectedStorage=Math.min(storage,maxStorage);
 const [rootPassword,setRootPassword]=useState('');
 const [confirmRootPassword,setConfirmRootPassword]=useState('');
 const [showPassword,setShowPassword]=useState(false);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [readiness,setReadiness]=useState(null);
 const [dryRun,setDryRun]=useState(null);
 const [checking,setChecking]=useState(false);
 useEffect(()=>{setDryRun(null)},[ram,cpu,selectedStorage,region,os]);
 useEffect(()=>{let active=true;apiRequest('/api/v1/payments/readiness').then(data=>{if(active)setReadiness(data)}).catch(()=>{});return()=>{active=false}},[]);
 async function checkProvisioning(){
  setChecking(true);setDryRun(null);setMessage('');
  try{const result=await apiRequest('/api/v1/instances/provisioning/dry-run',{method:'POST',body:{ram,cpu,storage:selectedStorage,region,os}});setDryRun(result)}
  catch(e){setMessage(e.message||'Provisioning check unavailable')}
  finally{setChecking(false)}
 }
 async function request(){
  setBusy(true);setMessage('');
  try{
   if(rootPassword && (rootPassword.length<16||rootPassword.length>128||rootPassword!==confirmRootPassword)){setMessage('Root password must be 16–128 characters and both fields must match.');return}
   await apiRequest('/api/v1/instances/drafts',{method:'POST',body:{ram,cpu,storage:selectedStorage,region,os}});
   navigate('/dashboard');
  }catch(e){setMessage(e.message||'Server creation is not available yet.')}
  finally{setBusy(false)}
 }
 return <main className="mx-auto max-w-4xl px-5 py-10 pb-20">
  <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16}/> Dashboard</Link>
  <div className="mt-7"><p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">Cloud configuration</p><h1 className="mt-2 text-3xl font-semibold">Create instance</h1><p className="mt-2 text-sm text-muted-foreground">Configure your instance. Payment and provisioning will be enabled after provider capacity is verified. Network target: up to 1–3 Gbps, subject to provider verification and real-world throughput; not a guaranteed speed.</p></div>
  <div className="mt-8 grid grid-cols-2 gap-3">{[['linux','Linux Container'],['windows','Windows RDP']].map(([id,label])=><button key={id} type="button" onClick={()=>setType(id)} className={`rounded-2xl border p-5 text-left text-sm font-semibold ${type===id?'border-emerald-500 bg-emerald-500/5':'bg-card'}`}><Server size={20} className="mb-3 text-emerald-500"/>{label}{id==='windows'&&<span className="mt-2 block text-xs font-normal text-muted-foreground">🔒 Available soon</span>}</button>)}</div>
  {type==='windows'?<div className="mt-6 rounded-2xl border p-6 text-sm">Windows RDP is coming soon. Windows hosting is not available on this Railway container setup.</div>:<>
   <div className="mt-6 rounded-2xl border bg-card p-5"><label htmlFor="instance-os" className="text-sm font-medium">Operating system</label><select id="instance-os" value={os} onChange={e=>setOs(e.target.value)} className="mt-3 w-full rounded-xl border bg-background p-3"><option value="ubuntu-24">Ubuntu 24.04 LTS</option><option value="debian-12">Debian 12</option></select><p className="mt-2 text-xs text-muted-foreground">Images require deployment-template verification before purchase.</p></div>
   <div className="mt-4 grid gap-4 sm:grid-cols-2"><ResourceSlider title="RAM" icon={MemoryStick} value={ram} onChange={setRam}/><ResourceSlider title="CPU" icon={Cpu} value={cpu} onChange={setCpu} unit="vCPU"/></div>
   <div className="mt-4 rounded-2xl border bg-card p-5"><div className="flex items-center justify-between"><span className="flex items-center gap-2 font-medium"><HardDrive size={18} className="text-emerald-500"/> SSD storage</span><strong>{selectedStorage===1000?'1 TB':selectedStorage+' GB'}</strong></div><input type="range" min={50} max={1000} step={50} value={selectedStorage} onChange={e=>setStorage(Math.min(Number(e.target.value),maxStorage))} className="mt-5 w-full accent-emerald-500" aria-label="SSD storage"/><div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>50 GB</span><span>1 TB</span></div><div className="mt-3 flex items-center justify-between gap-2 text-xs"><span className="font-medium text-emerald-500">Your plan allows up to {maxStorage===1000?"1 TB":maxStorage+" GB"}</span><span className="flex items-center gap-1 text-muted-foreground"><LockKeyhole size={13}/> {maxStorage<1000?`${1000-maxStorage} GB locked`:"Higher tiers locked"}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-label="Storage availability"><div className="h-full rounded-full bg-emerald-500" style={{width:`${maxStorage/10}%`}}/></div><p className="mt-3 text-xs text-muted-foreground">Increase RAM and CPU to unlock eligible storage. Beyond your plan limit is locked; up to 10 TB coming soon. Container filesystem is not guaranteed persistent SSD; a selectable allowance is not an enforced quota.</p></div>
   <div className="mt-4 rounded-2xl border bg-card p-5"><p className="mb-3 flex items-center gap-2 font-medium"><MapPin size={18} className="text-emerald-500"/> Region</p><div className="grid grid-cols-2 gap-2">{regions.map(([id,label])=><button key={id} type="button" onClick={()=>setRegion(id)} className={`rounded-xl border p-3 text-left text-sm ${region===id?'border-emerald-500 bg-emerald-500/5':'hover:bg-muted'}`}>{label}</button>)}</div><p className="mt-3 text-xs text-muted-foreground">Other regions: 🔒 Available soon. Selected region requires provider verification.</p></div>
   <div className="mt-4 rounded-2xl border bg-card p-5"><label htmlFor="root-password" className="text-sm font-semibold">VPS root password</label><p className="mt-2 text-xs text-muted-foreground">Choose a unique password of at least 16 characters. It will be used when your container is provisioned, not stored in a draft.</p><input id="root-password" autoComplete="new-password" type={showPassword?'text':'password'} minLength={16} maxLength={128} value={rootPassword} onChange={e=>setRootPassword(e.target.value)} className="mt-3 w-full rounded-xl border bg-background p-3" placeholder="Enter root password" /><input aria-label="Confirm root password" autoComplete="new-password" type={showPassword?'text':'password'} value={confirmRootPassword} onChange={e=>setConfirmRootPassword(e.target.value)} className="mt-3 w-full rounded-xl border bg-background p-3" placeholder="Confirm root password"/><label className="mt-3 flex items-center gap-2 text-xs"><input type="checkbox" checked={showPassword} onChange={e=>setShowPassword(e.target.checked)}/> Show password</label>{rootPassword&&rootPassword.length<16&&<p role="alert" className="mt-2 text-xs text-amber-600">Minimum 16 characters required.</p>}{confirmRootPassword&&rootPassword!==confirmRootPassword&&<p role="alert" className="mt-2 text-xs text-amber-600">Passwords do not match.</p>}</div>
   <div className="mt-6 rounded-2xl border bg-card p-6"><p className="text-sm text-muted-foreground">Estimated compute price</p><p className="mt-2 text-3xl font-semibold">₹{matrix[ram-1][cpu-1]}<span className="text-sm font-normal text-muted-foreground"> / month</span></p><p className="mt-2 text-xs text-muted-foreground">SSD and network charges not included. This is a planning quote, not a final payable price.</p>{readiness&&<div className="mt-4 rounded-xl border p-3 text-xs text-muted-foreground"><p className="font-semibold text-foreground">Backend integration status</p><p>Railway API credentials: {readiness.railwayTokenConfigured?"Configured":"Not configured"}</p><p>Razorpay credentials: {readiness.razorpayKeyConfigured?"Configured":"Not configured"}</p><p>Webhook secret: {readiness.razorpayWebhookConfigured?"Configured":"Not configured"}</p><p>Verified final pricing: {readiness.finalPlanPricingVerified?'Yes':'Pending'}</p><p>Persistent SSD capacity: {readiness.persistentStorageCapacityVerified?'Verified':'Not verified'}</p><p>Checkout and provisioning: Not enabled yet</p></div>}{dryRun&&<div role="status" className="mt-4 rounded-xl border p-3 text-xs"><p className="font-semibold">Provisioning preflight: {dryRun.canProvision?'Ready':'Not ready'}</p><p>Configuration: {dryRun.selectionValid?'Valid':'Invalid'}</p><p>Railway API authenticated: {dryRun.railwayAPIAuthenticated?'Yes':'Not verified'}</p><p>Region mapped: {dryRun.regionMappedToRailway?'Yes':'Pending'}</p><p>Provider capacity: {dryRun.providerCapacityVerified?'Verified':'Pending'}</p><p>CPU/RAM limits: {dryRun.cpuAndMemoryLimitsVerified?'Verified':'Pending'}</p><p>Persistent SSD: {dryRun.persistentStorageVerified?'Verified':'Pending'}</p><p>Network access: {dryRun.networkAccessVerified?'Verified':'Pending'}</p><p>Final price: {dryRun.priceVerified?'Verified':'Pending'}</p><p className="mt-2 text-muted-foreground">No charge and no server created.</p></div>}<button type="button" disabled={checking||busy} onClick={checkProvisioning} className="mt-4 w-full rounded-xl border p-3 text-sm font-semibold disabled:opacity-50">{checking?'Checking…':'Check provisioning readiness'}</button>{message&&<p role="alert" className="mt-4 rounded-xl border border-amber-500/30 p-3 text-sm">{message}</p>}<button type="button" disabled={busy} onClick={request} className="mt-5 w-full rounded-xl bg-primary p-3 font-semibold text-primary-foreground disabled:opacity-50">{busy?'Saving configuration…':'Save configuration'}</button><p className="mt-3 text-center text-xs text-muted-foreground">Your configuration is saved as a draft. The password is not saved or sent. You will set it again when provisioning is enabled.</p></div>
  </>}
 </main>;
}
