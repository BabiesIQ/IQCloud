import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { apiRequest } from '@/services/apiClient';

function quality(p) {
 const n=Number(p.length>=12)+Number(p.length>=16)+Number(/[a-z]/.test(p)&&/[A-Z]/.test(p))+Number(/[0-9]/.test(p))+Number(/[^a-zA-Z0-9]/.test(p));
 return n<3?{label:'Weak',width:'33%',color:'bg-red-500'}:n<5?{label:'Fair',width:'66%',color:'bg-amber-500'}:{label:'Strong',width:'100%',color:'bg-emerald-500'};
}
export default function PasswordSettings() {
 const [open,setOpen]=useState(false);
 const [current,setCurrent]=useState('');
 const [next,setNext]=useState('');
 const [confirm,setConfirm]=useState('');
 const [visible,setVisible]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [success,setSuccess]=useState('');
 const strength=quality(next);
 async function submit(e){
  e.preventDefault();setError('');setSuccess('');
  if(next!==confirm){setError('New passwords do not match.');return}
  if(next.length<12||new TextEncoder().encode(next).length>72){setError('Use a password of 12–72 bytes.');return}
  setBusy(true);
  try{
   const result=await apiRequest('/api/v1/auth/change-password',{method:'POST',body:{currentPassword:current,newPassword:next}});
   setSuccess(result.message||'Password changed successfully.');setCurrent('');setNext('');setConfirm('');setOpen(false);
  }catch(err){setError(err.message||'Unable to change password.')}
  finally{setBusy(false)}
 }
 return <section className="rounded-2xl border bg-card p-5 sm:p-6" aria-label="Password and security">
  <div className="flex items-start gap-3"><span className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500"><LockKeyhole size={20}/></span><div className="flex-1"><h2 className="font-semibold text-lg">Password & security</h2><p className="mt-1 text-sm text-muted-foreground">Manage your account password and protect your sign-in.</p></div></div>
  {success&&<p role="status" className="mt-4 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-600">{success}</p>}
  <button type="button" onClick={()=>{setOpen(!open);setError('')}} aria-expanded={open} className="mt-5 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium hover:bg-muted"><span>Change password</span><span aria-hidden="true">{open?'−':'+'}</span></button>
  {open&&<form onSubmit={submit} className="mt-5 space-y-4">
   <label className="block text-sm font-medium">Current password<input type={visible?'text':'password'} required autoComplete="current-password" value={current} onChange={e=>setCurrent(e.target.value)} className="mt-2 w-full rounded-xl border bg-background px-4 py-3"/></label>
   <label className="block text-sm font-medium">New password<input type={visible?'text':'password'} required minLength={12} autoComplete="new-password" value={next} onChange={e=>setNext(e.target.value)} className="mt-2 w-full rounded-xl border bg-background px-4 py-3"/></label>
   <div aria-live="polite"><div className="h-1.5 rounded-full bg-muted"><div className={`h-full rounded-full transition-all ${strength.color}`} style={{width:next?strength.width:'0%'}}/></div><p className="mt-2 text-xs text-muted-foreground">{next?strength.label:'Use 12+ characters, with a unique password.'}</p></div>
   <label className="block text-sm font-medium">Confirm new password<input type={visible?'text':'password'} required minLength={12} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="mt-2 w-full rounded-xl border bg-background px-4 py-3"/></label>
   <button type="button" onClick={()=>setVisible(!visible)} className="flex items-center gap-2 text-xs text-muted-foreground">{visible?<EyeOff size={15}/>:<Eye size={15}/>} {visible?'Hide':'Show'} passwords</button>
   {error&&<p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
   <button type="submit" disabled={busy} className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-50">{busy?'Updating…':'Update password'}</button>
  </form>}
  <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck size={16}/> Secure account recovery</div><Link to="/forgot-password" className="text-xs font-medium text-emerald-600 hover:underline">Forgot password?</Link></div>
 </section>;
}
