import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiRequest } from '@/services/apiClient';
import PasswordField from '@/components/PasswordField';

function strength(password) {
  if (!password) return { label: 'Enter a password', level: 0, color: 'bg-muted' };
  const score = Number(password.length >= 12) + Number(password.length >= 16) + Number(/[a-z]/.test(password) && /[A-Z]/.test(password)) + Number(/\d/.test(password)) + Number(/[^\w]/.test(password));
  if (score < 3) return { label: 'Weak', level: 1, color: 'bg-red-500' };
  if (score < 5) return { label: 'Normal', level: 2, color: 'bg-amber-500' };
  return { label: 'Strong', level: 3, color: 'bg-emerald-500' };
}
export default function PasswordRecovery({ reset = false }) {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const validFormat = /^[a-f0-9]{64}$/.test(token);
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [confirm,setConfirm] = useState('');
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [success,setSuccess] = useState(false);
  const quality = strength(password);
  async function submit(e) {
    e.preventDefault();setError('');
    if(reset && (!validFormat || password.length < 12 || new TextEncoder().encode(password).length > 72 || password !== confirm)) {
      setError(!validFormat ? 'This reset link is invalid. Request a new one.' : 'Use matching passwords of 12–72 bytes.');return;
    }
    setBusy(true);
    try {
      await apiRequest(reset ? '/api/v1/auth/reset-password' : '/api/v1/auth/forgot-password', {
        method:'POST',body:reset ? {token,password} : {email}
      });
      setSuccess(true);setPassword('');setConfirm('');
      if(reset) window.history.replaceState({},'', '/reset-password');
    } catch(err) {setError(err.message || 'Please try again.');}
    finally {setBusy(false);}
  }
  return <main className="mx-auto max-w-md px-5 py-14 sm:py-20">
    <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">← Back to sign in</Link>
    <div className="mt-8 rounded-2xl border bg-card p-6 sm:p-8 shadow-sm">
      <div className="mb-5 inline-flex rounded-xl bg-emerald-500/10 p-3 text-emerald-500" aria-hidden="true">✦</div>
      <h1 className="text-3xl font-semibold tracking-tight">{reset ? 'Set a new password' : 'Forgot your password?'}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{reset ? 'Choose a strong password to secure your account.' : 'Enter your account email. We’ll send a secure link that expires in 10 minutes.'}</p>
      {success ? <div role="status" className="mt-7 space-y-4"><p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">{reset ? 'Password updated. All previous sessions have been signed out.' : 'If your account exists, a reset link has been sent. Check your inbox and spam folder.'}</p><Link className="inline-block rounded-xl bg-primary px-5 py-3 text-primary-foreground" to="/login">Back to sign in</Link></div> :
      <form onSubmit={submit} className="mt-7 space-y-5">
        {!reset ? <label className="block text-sm font-medium">Email address<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border bg-background px-4 py-3 outline-offset-2" placeholder="you@example.com"/></label> :
        <>
          {!validFormat && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500">Invalid reset link. Request a new one.</p>}
          <PasswordField label="New password" autoComplete="new-password" minLength={12} value={password} onChange={e=>setPassword(e.target.value)}/>
          <div aria-live="polite"><div className="grid grid-cols-3 gap-1.5">{[1,2,3].map(n=><div key={n} className={`h-1.5 rounded-full ${quality.level>=n ? quality.color : 'bg-muted'}`}/>)}</div><p className="mt-2 text-xs text-muted-foreground">{quality.label} · Use at least 12 characters and a unique password.</p></div>
          <PasswordField label="Confirm new password" autoComplete="new-password" minLength={12} value={confirm} onChange={e=>setConfirm(e.target.value)}/>
        </>}
        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={busy||(reset&&!validFormat)} className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-black disabled:opacity-50">{busy?'Please wait…':reset?'Update password':'Send reset link'}</button>
      </form>}
    </div>
    <p className="mt-6 text-center text-xs text-muted-foreground">BabiesIQ Cloud · Secure account recovery</p>
  </main>;
}
