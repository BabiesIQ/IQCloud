import { useState } from 'react';
import { Copy, Eye, EyeOff, ShieldCheck, Terminal, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '@/services/apiClient';

export const maskedHost = (host) => host ? host.slice(0,3) + 'xxxxxx' : 'Not assigned';
export default function ServerCredentials({item}){
 const [copied,setCopied]=useState('');
 const [revealBusy,setRevealBusy]=useState(false);
 const [password,setPassword]=useState(null);
 const [error,setError]=useState('');
 const [show,setShow]=useState(false);
 const gateway=item?.sshGateway?.status==='ready'?item.sshGateway:null;
 const host=typeof (gateway?.host||item?.sshHost)==='string'?(gateway?.host||item?.sshHost):'';
 const port=Number(gateway?.port||item?.sshPort)||0;
 const username=gateway?.username||'root';
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
   <div><p className="text-xs text-muted-foreground">SSH Host</p><div className="mt-1 flex items-center gap-2"><code className="break-all font-mono">{gateway?host:maskedHost(host)}</code><button type="button" disabled={!host} className="rounded border p-2 disabled:opacity-40" aria-label="Copy actual SSH hostname" onClick={()=>copy(host,'host')}><Copy size={14}/></button></div></div>
   <div><p className="text-xs text-muted-foreground">Port</p><div className="mt-1 flex items-center gap-2"><strong className="font-mono">{port||'Pending'}</strong><button type="button" disabled={!port} className="rounded border p-2 disabled:opacity-40" aria-label="Copy SSH port" onClick={()=>copy(port,'port')}><Copy size={14}/></button></div></div>
   <div><p className="text-xs text-muted-foreground">Username</p><div className="mt-1 flex items-center gap-2"><strong className="font-mono">{username}</strong><button type="button" className="rounded border p-2" aria-label="Copy SSH username" onClick={()=>copy(username,'username')}><Copy size={14}/></button></div></div>
   <div><p className="text-xs text-muted-foreground">Root password (from configuration)</p>
    {password===null?<button type="button" onClick={reveal} disabled={revealBusy||!port} className="mt-1 inline-flex items-center gap-2 rounded border px-3 py-2 text-xs font-semibold disabled:opacity-40"><Eye size={14}/>{revealBusy?'Opening securely…':'Show once'}</button>:
     <div className="mt-1 flex items-center gap-2"><code className="min-w-0 break-all">{show?password:'••••••••••'}</code><button type="button" aria-label="Show or hide password" onClick={()=>setShow(x=>!x)} className="rounded border p-2">{show?<EyeOff size={14}/>:<Eye size={14}/>}</button><button type="button" aria-label="Copy root password" onClick={()=>copy(password,'password')} className="rounded border p-2"><Copy size={14}/></button></div>}
   </div>
  </div>
  {host&&port>0&&<button type="button" onClick={()=>copy(`ssh -p ${port} ${username}@${host}`,'ssh command')} className="mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium"><Copy size={14}/> Copy SSH command</button>}
  {gateway?.hostKeyFingerprint&&<div className="mt-3 rounded-lg border p-3"><p className="text-xs font-semibold">Gateway SSH fingerprint</p><div className="mt-2 flex items-center gap-2"><code className="min-w-0 flex-1 break-all text-xs">{gateway.hostKeyFingerprint}</code><button type="button" className="rounded border p-2" aria-label="Copy gateway SSH fingerprint" onClick={()=>copy(gateway.hostKeyFingerprint,'SSH fingerprint')}><Copy size={14}/></button></div><p className="mt-1 text-xs text-muted-foreground">Verify this fingerprint when your SSH app asks you to trust the gateway.</p></div>}
  {gateway?<p className="mt-3 text-xs text-emerald-600">BabiesIQ SSH Gateway is ready. Use your existing root password.</p>:item?.sshGatewayStatus==='pending'?<p className="mt-3 text-xs text-amber-600">Preparing your secure SSH gateway port. Connection details will appear automatically after verification.</p>:<p className="mt-3 text-xs text-muted-foreground">Direct SSH connection is available until your gateway migration is complete.</p>}
  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
   <span className="text-xs text-muted-foreground">Forgot root password or changed it using passwd?</span>
   <Link to={'/dashboard/instances/'+encodeURIComponent(item._id)+'/reset-password'} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"><KeyRound size={14}/> Reset password</Link>
  </div>
  {copied&&<p role="status" className="mt-2 text-xs text-emerald-600">{copied==='Copy blocked by browser'?copied:'Copied '+copied}</p>}
  {error&&<p role="alert" className="mt-2 text-xs text-amber-600">{error}</p>}
  <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><ShieldCheck size={14} className="mt-0.5 shrink-0"/> Gateway access uses an SSH relay and its own host key. Always verify the SSH host fingerprint on first login. Keep your root password private; gateway traffic is re-encrypted to the customer VPS. Direct SSH remains the fallback when gateway access is unavailable.</p>
 </section>;
}