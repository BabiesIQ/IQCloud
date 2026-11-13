import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Globe2, LockKeyhole, Network, RefreshCcw, ShieldCheck, TerminalSquare } from 'lucide-react';
import { apiRequest } from '@/services/apiClient';

const modes=[
 {id:'inbound',label:'Inbound',detail:'Expose an HTTP app'},
 {id:'outbound',label:'Outbound',detail:'Egress connections'},
];
export default function CustomPorts(){
 const navigate=useNavigate();
 const [query]=useSearchParams();
 const [servers,setServers]=useState([]);
 const [selected,setSelected]=useState(query.get('instanceId')||'');
 const [mode,setMode]=useState(()=>query.get('tab')==='outbound'?'outbound':'inbound');
 const [bindings,setBindings]=useState(null);
 const [loading,setLoading]=useState(true);
 const [working,setWorking]=useState(false);
 const [port,setPort]=useState('3000');
 const [riskAccepted,setRiskAccepted]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 async function refreshInstances(){
  setError('');
  try{
   const data=await apiRequest('/api/v1/instances');
   const list=(data.items||[]).filter(s=>s.status==='running');
   setServers(list);
   setSelected(prev=>list.some(s=>s._id===prev)?prev:list[0]?._id||'');
  }catch(e){
   if(/unauthorized|401/i.test(e.message)){navigate('/login',{replace:true});return}
   setError(e.message||'Could not load your instances');
  }finally{setLoading(false)}
 }
 useEffect(()=>{refreshInstances()},[]);
 useEffect(()=>{
  let alive=true;
  if(!selected){setBindings(null);return}
  setWorking(true);setNotice('');setError('');
  apiRequest('/api/v1/instances/'+encodeURIComponent(selected)+'/ports')
   .then(data=>{if(alive)setBindings(data)})
   .catch(e=>{if(alive){setBindings(null);setError(e.message||'Port status unavailable')}})
   .finally(()=>{if(alive)setWorking(false)});
  return()=>{alive=false};
 },[selected]);
 const selectedServer=servers.find(x=>x._id===selected);
 async function createInbound(){
  const value=Number(port);
  if(!Number.isInteger(value)||value<1||value>65535||value===22){setError('Choose an internal application port 1–65535 other than SSH port 22');return}
  setWorking(true);setError('');setNotice('');
  try{
   const result=await apiRequest('/api/v1/instances/'+encodeURIComponent(selected)+'/ports/inbound',{method:'POST',body:{port:value,acceptRedeployRisk:riskAccepted}});
   setNotice(result.notice||'Railway HTTP endpoint created. Verify your app is listening on the selected port.');
   const data=await apiRequest('/api/v1/instances/'+encodeURIComponent(selected)+'/ports');
   setBindings(data);
  }catch(e){setError(e.message||'Railway could not create an inbound HTTP endpoint')}
  finally{setWorking(false)}
 }
 return <main className="mx-auto max-w-4xl px-5 py-10 pb-24">
  <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16}/> Dashboard</Link>
  <div className="mt-7 flex items-center gap-3"><div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-500"><Network size={23}/></div><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-500">Server networking</p><h1 className="mt-1 text-3xl font-semibold">Custom ports</h1></div></div>
  <p className="mt-4 text-sm leading-6 text-muted-foreground">Manage public HTTP application ports separately from your protected SSH connection. Outbound traffic has different provider-level limits.</p>
  <div className="mt-7 rounded-2xl border bg-card p-5">
   <div className="flex items-center justify-between gap-3"><label htmlFor="ports-instance" className="text-sm font-semibold">Select instance</label><button type="button" onClick={refreshInstances} aria-label="Refresh server list" className="rounded-lg border p-2"><RefreshCcw size={16}/></button></div>
   <select id="ports-instance" className="mt-3 w-full rounded-xl border bg-background p-3" value={selected} onChange={e=>setSelected(e.target.value)} disabled={loading||working}>
    {!servers.length&&<option value="">No running instance</option>}
    {servers.map((s,index)=><option key={s._id} value={s._id}>Instance {index+1} · {s.ram} GB RAM · {s.cpu} vCPU</option>)}
   </select>
  </div>
  <div className="mt-5 grid grid-cols-2 gap-3" role="group" aria-label="Connection direction">
   {modes.map(x=><button key={x.id} type="button" aria-pressed={mode===x.id} onClick={()=>setMode(x.id)} className={`rounded-2xl border p-4 text-left ${mode===x.id?'border-emerald-500 bg-emerald-500/10':'bg-card'}`}><strong className="block">{x.label}</strong><span className="mt-1 block text-xs text-muted-foreground">{x.detail}</span></button>)}
  </div>
  {mode==='inbound'?<section className="mt-5 space-y-5 rounded-2xl border bg-card p-5 sm:p-7">
   <div className="flex items-center gap-2 font-semibold"><Globe2 size={19} className="text-emerald-500"/> Inbound HTTP</div>
   <p className="text-sm leading-6 text-muted-foreground">Run your app inside the instance on a chosen TCP port (for example <code>0.0.0.0:3000</code>). Railway will assign a public HTTPS hostname that forwards traffic to that HTTP port. DNS/TLS and your app's response should be verified before sharing it.</p>
   <div className="flex items-start gap-2 rounded-xl border p-3 text-xs text-muted-foreground"><LockKeyhole size={16} className="shrink-0"/> SSH keeps its existing public TCP proxy and port. Railway allows only one public TCP proxy per service, so arbitrary additional inbound TCP/UDP ports are not supported by this control.</div>
   <label className="flex items-start gap-2 rounded-xl border border-amber-500/40 p-3 text-xs text-muted-foreground"><input type="checkbox" className="mt-0.5" checked={riskAccepted} onChange={e=>setRiskAccepted(e.target.checked)}/><span>I understand that provider networking changes may redeploy or interrupt a Railway container and its ephemeral files may be lost. I have backed up important data.</span></label>
   <div className="flex flex-wrap items-end gap-3">
    <label htmlFor="http-port" className="block flex-1 text-sm font-medium">Internal HTTP application port<input id="http-port" type="number" min="1" max="65535" value={port} onChange={e=>setPort(e.target.value)} className="mt-2 w-full rounded-xl border bg-background p-3" /></label>
    <button type="button" onClick={createInbound} disabled={!selectedServer||working||!riskAccepted} className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-50">{working?'Configuring…':'Expose HTTP port'}</button>
   </div>
   {bindings?.inbound?.length>0&&<div className="space-y-3"><h3 className="font-semibold">Provider endpoints</h3>{bindings.inbound.map(p=><div key={p.port} className="rounded-xl border p-4 text-sm"><div className="flex items-center justify-between"><strong>Internal port {p.port}</strong><span className="text-xs">{p.status}</span></div>{p.domain&&<a className="mt-2 inline-flex items-center gap-2 break-all text-emerald-500 underline" href={'https://'+p.domain} target="_blank" rel="noopener noreferrer">{p.domain}<ArrowUpRight size={14}/></a>}{p.status==='needs_review'&&<p className="mt-2 text-xs text-amber-600">Manual provider review required. Do not create the same port again.</p>}</div>)}</div>}
   <p className="text-xs text-muted-foreground">Provider endpoint creation does not install a web server, open local firewall rules, or prove your app is listening.</p>
  </section>:<section className="mt-5 space-y-4 rounded-2xl border bg-card p-5 sm:p-7">
   <div className="flex items-center gap-2 font-semibold"><TerminalSquare size={19} className="text-emerald-500"/> Outbound networking</div>
   <p className="text-sm leading-6 text-muted-foreground">Outgoing connections are normally permitted by Railway without opening a port in this panel. This tab does not list traffic history or add egress firewall rules.</p>
   <div className="rounded-xl border p-4 text-sm"><h3 className="font-semibold">Check outbound from your VPS terminal</h3><p className="mt-2 text-muted-foreground">Connect through SSH, then run:</p><code className="mt-2 block break-all rounded-lg bg-muted p-3 font-mono text-xs">curl -4 -I --max-time 10 https://example.com</code><p className="mt-2 text-xs text-muted-foreground">An HTTP response confirms this destination is reachable. A failure needs DNS, route, proxy, or destination troubleshooting; it does not mean an outbound rule is missing here.</p></div>
   <div className="rounded-xl border p-4 text-sm"><div className="flex items-center gap-2 font-semibold"><ShieldCheck size={17}/> Current configuration</div><p className="mt-2 text-muted-foreground">{bindings?.outbound?.message||'Outbound rules are controlled by Railway and the container; a customer-level port firewall API is not available.'}</p></div>
   <p className="text-sm text-muted-foreground">An arbitrary outbound allow/deny toggle would not actually change network permissions on Railway, so the interface does not show a misleading enabled switch.</p>
  </section>}
  {notice&&<div role="status" className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">{notice}</div>}
  {error&&<div role="alert" className="mt-5 rounded-xl border border-amber-500/40 p-4 text-sm text-amber-600">{error}</div>}
 </main>;
}
