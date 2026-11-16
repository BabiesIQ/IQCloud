import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, KeyRound, MailCheck, ShieldAlert, ShieldCheck } from 'lucide-react';
import { apiRequest } from '@/services/apiClient';

export default function InstancePasswordReset(){
 const {id}=useParams();
 const navigate=useNavigate();
 const [step,setStep]=useState('start');
 const [accountPassword,setAccountPassword]=useState('');
 const [code,setCode]=useState('');
 const [newPassword,setNewPassword]=useState('');
 const [confirmPassword,setConfirmPassword]=useState('');
 const [show,setShow]=useState(false);
 const [agree,setAgree]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 async function sendCode(){
  setBusy(true);setError('');setMessage('');
  try{
   const data=await apiRequest('/api/v1/instances/'+encodeURIComponent(id)+'/credentials/reset/start',{method:'POST',body:{accountPassword}});
   setAccountPassword('');
   setStep('verify');
   setMessage(data.message||'Verification code sent to your registered email.');
  }catch(e){setError(e.message||'Could not send verification code')}finally{setBusy(false)}
 }
 async function reset(){
  setBusy(true);setError('');setMessage('');
  try{
   const data=await apiRequest('/api/v1/instances/'+encodeURIComponent(id)+'/credentials/reset/confirm',
    {method:'POST',body:{code,newPassword,confirmPassword,acceptDataLoss:agree}});
   setStep('done');setCode('');setNewPassword('');setConfirmPassword('');
   setMessage(data.message||'Reset request accepted by BabiesIQ Cloud. Check Dashboard for service readiness.');
  }catch(e){setError(e.message||'Password reset could not be confirmed. Do not retry without checking instance status.')}finally{setBusy(false)}
 }
 const ready=/^[a-f0-9]{32}$/.test(id||'');
 return <main className="mx-auto max-w-xl px-5 py-10 pb-24">
  <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16}/> Back to instances</Link>
  <div className="mt-8 flex items-center gap-3"><div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500"><KeyRound size={24}/></div><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-500">Instance security</p><h1 className="mt-1 text-3xl font-semibold">Reset root password</h1></div></div>
  <p className="mt-4 text-sm leading-6 text-muted-foreground">Forgot the root password or changed it using the <code>passwd</code> command? Verify your BabiesIQ account and email, then set a new root password for this instance. Your old root password is not needed and is not recoverable.</p>
  <div className="mt-6 flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm"><ShieldAlert className="mt-0.5 shrink-0 text-amber-500" size={20}/><div><p className="font-semibold text-amber-600">Important: VPS redeployment required</p><p className="mt-2 leading-6 text-muted-foreground">The BabiesIQ Cloud system will redeploy this SAME container service to apply the new root password. Its shared root filesystem is ephemeral; files may be permanently lost. Back up files before resetting. Main API restarts alone do not trigger this action.</p></div></div>
  {!ready?<p role="alert" className="mt-5 text-red-500">Invalid instance link.</p>:
   step==='start'?<form className="mt-7 rounded-2xl border bg-card p-6" onSubmit={e=>{e.preventDefault();sendCode()}}>
    <h2 className="flex items-center gap-2 font-semibold"><ShieldCheck size={19}/> Step 1 · Verify your account</h2>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">Enter your <strong>BabiesIQ Cloud account password</strong>, not the VPS root password. Accounts using Google-only sign-in can leave it blank. A one-time code will be sent to your verified account email.</p>
    <label className="mt-5 block text-sm font-medium">Cloud account password<input type="password" autoComplete="current-password" value={accountPassword} onChange={e=>setAccountPassword(e.target.value)} placeholder="Cloud login password (if set)" className="mt-2 w-full rounded-xl border bg-background p-3"/></label>
    <button disabled={busy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary p-3 font-semibold text-primary-foreground disabled:opacity-50"><MailCheck size={18}/>{busy?'Sending verification…':'Send email verification code'}</button>
   </form>:
   step==='verify'?<form className="mt-7 space-y-5 rounded-2xl border bg-card p-6" onSubmit={e=>{e.preventDefault();reset()}}>
    <h2 className="flex items-center gap-2 font-semibold"><MailCheck size={19}/> Step 2 · Confirm & set password</h2>
    <p className="text-sm text-muted-foreground">The email code is valid for 10 minutes and can only be used once.</p>
    <label className="block text-sm font-medium">Six-digit email code<input value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" required placeholder="000000" className="mt-2 w-full rounded-xl border bg-background p-3 tracking-widest"/></label>
    <label className="block text-sm font-medium">New VPS root password<input type={show?'text':'password'} autoComplete="new-password" minLength={16} maxLength={128} value={newPassword} onChange={e=>setNewPassword(e.target.value)} required className="mt-2 w-full rounded-xl border bg-background p-3"/></label>
    <label className="block text-sm font-medium">Confirm new password<input type={show?'text':'password'} autoComplete="new-password" minLength={16} maxLength={128} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required className="mt-2 w-full rounded-xl border bg-background p-3"/></label>
    <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={show} onChange={e=>setShow(e.target.checked)}/> Show passwords</label>
    <p className="text-xs text-muted-foreground">Use 16–128 characters and at least three types among uppercase, lowercase, numbers and symbols.</p>
    <label className="flex items-start gap-3 rounded-xl border border-amber-500/40 p-4 text-sm"><input type="checkbox" className="mt-1" checked={agree} onChange={e=>setAgree(e.target.checked)} required/><span>I understand that this password reset redeploys my BabiesIQ Cloud VPS and may erase ephemeral files. I have backed up important data.</span></label>
    <button type="submit" disabled={busy||!agree||code.length!==6||newPassword.length<16||newPassword!==confirmPassword} className="w-full rounded-xl bg-primary p-3 font-semibold text-primary-foreground disabled:opacity-50">{busy?'Sending secure reset…':'Verify code & reset password'}</button>
   </form>:
   <div className="mt-7 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6"><h2 className="flex items-center gap-2 font-semibold"><ShieldCheck size={20}/> Password change requested</h2><p className="mt-2 text-sm leading-6">{message}</p><button type="button" className="mt-5 rounded-xl border px-4 py-2 text-sm font-semibold" onClick={()=>navigate('/dashboard')}>Back to Dashboard</button></div>}
  {message&&step!=='done'&&<p role="status" className="mt-5 rounded-xl border border-emerald-500/30 p-4 text-sm">{message}</p>}
  {error&&<p role="alert" className="mt-5 rounded-xl border border-amber-500/40 p-4 text-sm text-amber-600">{error}</p>}
 </main>;
}
