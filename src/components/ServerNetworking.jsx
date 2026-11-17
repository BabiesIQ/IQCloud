import { useEffect, useState } from 'react';
import { Globe, MoreVertical, RefreshCw, ShieldCheck, Network, LockKeyhole } from 'lucide-react';
import { apiRequest } from '@/services/apiClient';


export default function ServerNetworking(){
 const [servers,setServers]=useState([]);
 const [open,setOpen]=useState(null);
 const [domain,setDomain]=useState('');
 const [port,setPort]=useState('');
 const [checking,setChecking]=useState(false);
 const [message,setMessage]=useState('');
 useEffect(()=>{let live=true;apiRequest('/api/v1/instances').then(d=>{if(live)setServers(Array.isArray(d.items)?d.items:[])}).catch(()=>{});return()=>{live=false}},[]);
 async function check(){
  if(!open)return;
  setChecking(true);setMessage('');
  try{
   const data=await apiRequest('/api/v1/instances/'+encodeURIComponent(open._id)+'/network/status');
   setMessage(data.message||'Provider network status received.');
  }catch(e){setMessage('Live DNS, port and SSL checks are not connected yet. No verification has been performed.')}
  finally{setChecking(false)}
 }
 return <section className="mt-5 rounded-2xl border bg-card p-5"><div className="flex items-center gap-2"><Network size={19} className="text-emerald-500"/><h3 className="font-semibold">Ports & custom domains</h3></div><p className="mt-2 text-xs text-muted-foreground">Open the three-dot menu on a provisioned server to manage its network configuration. Only provider-confirmed ports and DNS records can be published.</p>
 {servers.filter(s=>s.status==='running').length?servers.filter(s=>s.status==='running').map((s,index)=><div key={s._id} className="mt-4 rounded-xl border p-4"><div className="flex items-center justify-between"><div><p className="font-medium">{'Instance '+(index+1)}</p><p className="text-xs text-muted-foreground">Running</p></div><button type="button" onClick={()=>{setOpen(open?._id===s._id?null:s);setMessage('')}} aria-label={'Manage '+(s.name||'instance')+' network'} className="rounded-lg border p-2"><MoreVertical size={18}/></button></div>
 {open?._id===s._id&&<div className="mt-4 space-y-3 border-t pt-4"><div className="flex items-center gap-2 text-sm font-medium"><Globe size={16}/> Custom domain & port</div><label className="block text-xs">Your domain<input value={domain} onChange={e=>setDomain(e.target.value)} placeholder="app.example.com" className="mt-1 w-full rounded-lg border bg-background p-3 text-sm"/></label><label className="block text-xs">Application port<input type="number" min="1" max="65535" value={port} onChange={e=>setPort(e.target.value)} placeholder="e.g. 3000" className="mt-1 w-full rounded-lg border bg-background p-3 text-sm"/></label><p className="flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole size={13}/> Custom port and domain creation requires active BabiesIQ Cloud service configuration. Entering a port does not open it.</p><div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground"><strong>DNS instructions:</strong> Generated only after BabiesIQ Cloud returns the actual target and verification records. No DNS target has been assigned yet.</div><p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck size={14}/> SSL: not configured / not verified</p><button type="button" onClick={check} disabled={checking} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm disabled:opacity-50"><RefreshCw size={14}/>{checking?'Checking…':'Refresh connection status'}</button>{message&&<p role="status" className="text-xs text-amber-600">{message}</p>}</div>}
 </div>):<p className="mt-4 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">No running servers yet. Port management will appear here when a real instance is provisioned.</p>}
 </section>;
}
