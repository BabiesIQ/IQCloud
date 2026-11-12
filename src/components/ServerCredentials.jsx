import { useState } from 'react';
import { Copy, Eye, EyeOff, ShieldCheck, Terminal } from 'lucide-react';
import { apiRequest } from '@/services/apiClient';

export const maskedHost = (host) => host ? host.slice(0,3) + 'xxxxxx' : 'Not assigned';
export default function ServerCredentials({item}){
 const [copied,setCopied]=useState('');
 const [revealBusy,setRevealBusy]=useState(false);
 const [password,setPassword]=useState(null);
 const [error,setError]=useState('');
 const [show,setShow]=useState(false);
 const host=typeof item?.sshHost==='string'?item.sshHost:'';
 const port=Number(item?.sshPort)||0;
 async function copy(value,label){
  if(!value)return;
  try{await navigator.clipboard.writeText(String(value));setCopied(label)}catch{setCopied('Copy blocked by browser')}
 }
 async function reveal(){
  if(revealBusy||password!==null)return;
  setRevealBusy(true);setError('');
  try{
   const data=await apiRequest('/api/v1/instances/'+encodeURIComponent(item._id)+'/credentials/reveal',{method:'POST'});
   setPassword(data.password);
   setShow(true);
  }catch(e){setError(e.message||'Password unavailable')}
  finally{setRevealBusy(false)}
 }
 return <section className="mt-4 rounded-xl border bg-muted/30 p-4 text-sm">
  <div className="mb-3 flex items-center gap-2 font-semibold"><Terminal size={16}/> SSH connection</div>
  <div className="grid gap-3 sm:grid-cols-2">
   <div><p className="text-xs text-muted-foreground">Host (masked)</p><div className="mt-1 flex items-center gap-2"><code className="break-all font-mono">{maskedHost(host)}</code><button type="button" disabled={!host} className="rounded border p-2 disabled:opacity-40" aria-label="Copy actual SSH hostname" onClick={()=>copy(host,'host')}><Copy size={14}/></button></div></div>
   <div><p className="text-xs text-muted-foreground">Port</p><div className="mt-1 flex items-center gap-2"><strong className="font-mono">{port||'Pending'}</strong><button type="button" disabled={!port} className="rounded border p-2 disabled:opacity-40" aria-label="Copy SSH port" onClick={()=>copy(port,'port')}><Copy size={14}/></button></div></div>
   <div><p className="text-xs text-muted-foreground">Username</p><div className="mt-1 flex items-center gap-2"><strong>root</strong><button type="button" className="rounded border p-2" aria-label="Copy username root" onClick={()=>copy('root','username')}><Copy size={14}/></button></div></div>
   <div><p className="text-xs text-muted-foreground">Root password (from configuration)</p>
    {password===null?<button type="button" onClick={reveal} disabled={revealBusy||!port} className="mt-1 inline-flex items-center gap-2 rounded border px-3 py-2 text-xs font-semibold disabled:opacity-40"><Eye size={14}/>{revealBusy?'Opening securely…':'Show once'}</button>:
     <div className="mt-1 flex items-center gap-2"><code className="min-w-0 break-all">{show?password:'••••••••••'}</code><button type="button" aria-label="Show or hide password" onClick={()=>setShow(x=>!x)} className="rounded border p-2">{show?<EyeOff size={14}/>:<Eye size={14}/>}</button><button type="button" aria-label="Copy root password" onClick={()=>copy(password,'password')} className="rounded border p-2"><Copy size={14}/></button></div>}
   </div>
  </div>
  {host&&port>0&&<button type="button" onClick={()=>copy(`ssh -p ${port} root@${host}`,'ssh command')} className="mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium"><Copy size={14}/> Copy SSH command</button>}
  {copied&&<p role="status" className="mt-2 text-xs text-emerald-600">{copied==='Copy blocked by browser'?copied:'Copied '+copied}</p>}
  {error&&<p role="alert" className="mt-2 text-xs text-amber-600">{error}</p>}
  <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><ShieldCheck size={14} className="mt-0.5 shrink-0"/> The public TCP proxy uses a hostname and port, not a dedicated IPv4/IPv6 address. IPv4/IPv6 availability depends on provider routing and DNS. Password is revealed only once after the server is ready; do not share or email it.</p>
 </section>;
}