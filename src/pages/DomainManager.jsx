import {useEffect,useState} from 'react';
import {Link,useNavigate,useParams} from 'react-router-dom';
import {ArrowLeft,ArrowUpRight,CheckCircle2,Check,ChevronRight,ClipboardCopy,Globe2,RefreshCw,ShieldCheck,TriangleAlert,Server,PlugZap,Clock3} from 'lucide-react';
import {apiRequest} from '@/services/apiClient';

export const route={path:'/domains/:instanceId',layout:'owner',access:'authenticated'};
const hostPattern=/^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
function goodHost(value){const host=value.trim().toLowerCase();return hostPattern.test(host)&&!host.endsWith('.babiesiq.tech')&&host!=='babiesiq.tech'&&!host.endsWith('.railway.app')&&!host.endsWith('.proxy.rlwy.net')}
function validPort(value){const n=Number(value);return Number.isInteger(n)&&n>=1&&n<=65535&&n!==22}
const getPath=id=>'/api/v1/instances/'+encodeURIComponent(id)+'/domains';
function Record({record,onCopy}){
 const good=record.status==='VALID';
 return <div className="space-y-2 rounded-xl border bg-background p-4 text-sm">
  <div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-md bg-muted px-2 py-1 font-mono text-xs font-semibold">{record.type}</span><span className={'inline-flex items-center gap-1 text-xs font-semibold '+(good?'text-emerald-500':'text-amber-500')}>{good?<CheckCircle2 size={14}/>:<Clock3 size={14}/>} {good?'Matched':record.status==='INVALID'?'Mismatch':'Waiting for DNS'}</span></div>
  <p className="text-xs text-muted-foreground">{record.purpose}</p>
  <div className="grid gap-3 sm:grid-cols-2">
   <div><p className="text-xs text-muted-foreground">DNS Name / Host</p><div className="mt-1 flex items-start gap-2"><code className="min-w-0 flex-1 break-all font-mono text-xs">{record.name||'@'}</code><button title="Copy DNS host" aria-label="Copy DNS host" onClick={()=>onCopy(record.name)}><ClipboardCopy size={16}/></button></div></div>
   <div><p className="text-xs text-muted-foreground">Required value / Target</p><div className="mt-1 flex items-start gap-2"><code className="min-w-0 flex-1 break-all font-mono text-xs">{record.value||'Waiting for Railway…'}</code><button title="Copy DNS target" aria-label="Copy DNS target" onClick={()=>onCopy(record.value)}><ClipboardCopy size={16}/></button></div></div>
  </div>
  {record.currentValue&&record.status!=='VALID'&&<p className="text-xs text-amber-600">Current DNS: <code className="break-all">{record.currentValue}</code></p>}
 </div>;
}
export default function DomainManager(){
 const {instanceId}=useParams();const navigate=useNavigate();
 const [server,setServer]=useState(null);const [number,setNumber]=useState(null);
 const [list,setList]=useState([]);const [selection,setSelection]=useState('');
 const [domain,setDomain]=useState('');const [port,setPort]=useState('3000');const [risk,setRisk]=useState(false);
 const [loading,setLoading]=useState(true);const [working,setWorking]=useState(false);const [checking,setChecking]=useState(false);
 const [details,setDetails]=useState(null);const [error,setError]=useState('');const [message,setMessage]=useState('');const [conflictLink,setConflictLink]=useState('');
 const root=getPath(instanceId);
 const normalized=domain.trim().toLowerCase();
 const canConnect=goodHost(normalized)&&validPort(port)&&risk&&!working&&!checking&&Boolean(server);
 async function load(){
  setLoading(true);setError('');
  try{
   const [inventory,record]=await Promise.all([apiRequest('/api/v1/instances'),apiRequest(root)]);
   const rows=(inventory.items||[]).filter(i=>i.status!=='draft'&&i.status!=='deleted').slice().sort((a,b)=>new Date(a.createdAt||0)-new Date(b.createdAt||0));
   const index=rows.findIndex(i=>i._id===instanceId);const found=rows[index];
   if(!found||found.status!=='running'){setError('This VPS must be running before custom domains can be managed.');setServer(null)}else{setServer(found);setNumber(index+1)}
   setList(record.items||[]);
  }catch(e){if(/unauthorized|session|401/i.test(e.message)){navigate('/login',{replace:true});return}setError(e.message||'Could not load this VPS')}
  finally{setLoading(false)}
 }
 async function inspect(host=selection){
  if(!host||checking)return;
  setChecking(true);setError('');setMessage('');setConflictLink('');
  try{
   const result=await apiRequest(root+'/'+encodeURIComponent(host));
   setDetails(result.domain);setSelection(host);
  }catch(e){setError(e.message||'Could not verify domain');setConflictLink(e.details?.freeDomainUrl||'')}
  finally{setChecking(false)}
 }
 async function connect(){
  if(!canConnect)return;
  setWorking(true);setError('');setMessage('');setConflictLink('');
  try{
   const result=await apiRequest(root,{method:'POST',body:{domain:normalized,port:Number(port),acceptRisk:true}});
   setMessage(result.message||'Railway accepted the custom domain. Configure the DNS records below.');
   const inventory=await apiRequest(root);setList(inventory.items||[]);
   setSelection(normalized);setDetails(result.domain);setDomain('');setRisk(false);
  }catch(e){setError(e.message||'Could not connect domain');setConflictLink(e.details?.freeDomainUrl||'')}
  finally{setWorking(false)}
 }
 async function copy(value){
  if(!value)return;
  try{await navigator.clipboard.writeText(value);setMessage('DNS value copied.')}catch{setMessage('Copy not supported by this browser. Long press the text to copy.')}
 }
 useEffect(()=>{load()},[instanceId]);

 const refresh=async()=>{await inspect(selection)};
 return <main className="mx-auto max-w-4xl pb-24">
  <Link to="/domains" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16}/> All VPS domains</Link>
  <div className="mt-6 flex items-start gap-3"><div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-500"><Globe2 size={24}/></div><div><p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">Domain management</p><h1 className="mt-1 text-3xl font-semibold">Instance {number??'…'} Domains</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Connect a website on your VPS to your own hostname with Railway HTTPS and DNS verification.</p></div></div>
  {server&&<div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 text-sm"><Server size={18}/><strong>{server.os?.replace('-',' ')}</strong><span className="text-muted-foreground">{server.ram} GB RAM · {server.cpu} vCPU</span><span className="ml-auto inline-flex items-center gap-1 text-emerald-500"><CheckCircle2 size={15}/> Running</span></div>}
  {loading&&<p className="mt-6 text-sm text-muted-foreground">Loading instance domains…</p>}
  {error&&<div role="alert" className="mt-5 rounded-xl border border-red-500/40 p-4 text-sm text-red-500"><div className="flex gap-2"><TriangleAlert size={18} className="shrink-0"/>{error}</div>{conflictLink&&<a href={conflictLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 font-semibold underline">Open Railway to free the domain <ArrowUpRight size={14}/></a>}</div>}
  {message&&<p role="status" className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">{message}</p>}
  <section className="mt-7 rounded-2xl border bg-card p-5 sm:p-7">
   <div className="flex items-center gap-2 font-semibold"><PlugZap size={19} className="text-emerald-500"/> Connect website domain</div>
   <p className="mt-2 text-sm text-muted-foreground">Start your web app inside the VPS on <code>0.0.0.0:PORT</code>. SSH port 22 is reserved. The domain routes HTTPS directly to the selected HTTP port.</p>
   <div className="mt-5 grid gap-4 sm:grid-cols-2">
    <label className="text-sm font-medium">Website port<input type="number" min="1" max="65535" value={port} onChange={e=>setPort(e.target.value)} placeholder="3000" className="mt-2 w-full rounded-xl border bg-background px-4 py-3" /></label>
    <label className="text-sm font-medium">Your custom domain<input type="text" inputMode="url" autoCapitalize="none" autoCorrect="off" value={domain} onChange={e=>setDomain(e.target.value)} placeholder="app.example.com" className="mt-2 w-full rounded-xl border bg-background px-4 py-3" /></label>
   </div>
   {domain&&!goodHost(normalized)&&<p className="mt-2 text-xs text-red-500">Invalid hostname. Enter a public domain, not a URL or port.</p>}
   {port&&!validPort(port)&&<p className="mt-2 text-xs text-red-500">Port must be 1–65535, excluding SSH port 22.</p>}
   <label className="mt-5 flex items-start gap-3 rounded-xl border border-amber-500/30 p-3 text-xs leading-5 text-muted-foreground"><input type="checkbox" checked={risk} onChange={e=>setRisk(e.target.checked)} className="mt-1"/><span>I control this domain and have backed up VPS data. Railway network/domain changes might interrupt this ephemeral container; this action does not promise zero downtime or permanent storage.</span></label>
   <button type="button" disabled={!canConnect} onClick={connect} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-40 sm:w-auto"><Globe2 size={17}/>{working?'Connecting to Railway…':'Connect domain'}</button>
   <p className="mt-3 text-xs text-muted-foreground">Up to 2 custom domains per Railway Hobby VPS. You do not need a personal Railway account unless releasing a domain from another Railway project.</p>
  </section>
  <section className="mt-6 rounded-2xl border bg-card p-5 sm:p-7">
   <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">Connected & pending domains</h2><button disabled={loading} type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs"><RefreshCw size={14}/> Refresh list</button></div>
   {!list.length&&<p className="mt-4 text-sm text-muted-foreground">No custom domain configured for this VPS yet.</p>}
   <div className="mt-4 space-y-2">{list.map(item=><button key={item.domain} type="button" onClick={()=>{setDetails(null);inspect(item.domain)}} className={'flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm '+(selection===item.domain?'border-emerald-500':'hover:bg-muted/40')}><Globe2 size={17}/><div className="min-w-0 flex-1"><p className="break-all font-semibold">{item.domain}</p><p className="text-xs text-muted-foreground">HTTP port {item.port} · {item.state?.replaceAll('_',' ')}</p></div><ChevronRight size={17}/></button>)}</div>
  </section>
  {details&&<section className="mt-6 space-y-5 rounded-2xl border bg-card p-5 sm:p-7">
   <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-widest text-muted-foreground">Live Railway verification</p><h2 className="mt-1 break-all text-xl font-semibold">{details.domain}</h2><p className="mt-1 text-xs text-muted-foreground">Target port {details.port} · Checked {details.checkedAt?new Date(details.checkedAt).toLocaleString():'just now'}</p></div>
   <button type="button" onClick={refresh} disabled={checking} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-40"><RefreshCw size={16}/>{checking?'Checking…':'Refresh status'}</button></div>
   {details.connected?<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4"><span className="flex items-center gap-2 font-semibold text-emerald-500"><ShieldCheck size={20}/> Domain connected · HTTPS ready</span><a href={details.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white">Open website <ArrowUpRight size={16}/></a></div>:
   <div className="rounded-xl border border-amber-500/30 p-4"><p className="inline-flex items-center gap-2 font-semibold text-amber-500"><Clock3 size={18}/> Waiting for DNS / SSL</p><p className="mt-2 text-xs text-muted-foreground">Add every required DNS record, then tap Refresh status. DNS propagation can take time.</p></div>}
   <div><h3 className="font-semibold">DNS records to add</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Copy these records into your DNS provider. If your domain is at the root (@), use DNS provider CNAME flattening / ALIAS. Turn Cloudflare proxy off while verifying.</p><div className="mt-4 space-y-3">{(details.dns||[]).map((record,i)=><Record key={record.type+record.name+i} record={record} onCopy={copy}/>)}</div></div>
   <div className="rounded-xl border p-4"><div className="flex items-center gap-2 font-semibold"><ShieldCheck size={17}/> SSL certificate <span className={details.certificateStatus==='ISSUED'||details.certificateStatus==='VALID'?'text-emerald-500':'text-amber-500'}>{details.certificateStatus||'PENDING'}</span></div><p className="mt-2 text-xs text-muted-foreground">A domain is only marked connected when the provider DNS records, TXT ownership check and HTTPS certificate all pass.</p></div>
   {!!details.problems?.length&&<div className="rounded-xl border border-amber-500/30 p-4"><p className="font-semibold">Problems to fix</p><ul className="mt-2 list-disc space-y-2 pl-5 text-xs leading-5 text-muted-foreground">{details.problems.map((problem,i)=><li key={i}>{problem}</li>)}</ul></div>}
   <a href={details.dnsHelpUrl||'https://docs.railway.com/networking/domains/working-with-domains#custom-domains'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-emerald-500 underline">Railway DNS setup guide <ArrowUpRight size={15}/></a>
   <p className="text-xs text-muted-foreground">DNS + TLS verification does not prove the website process is listening; ensure your web application is running on port {details.port}.</p>
  </section>}
 </main>;
}
