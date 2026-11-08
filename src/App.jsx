import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { getPreferences, updatePreferences } from '@/config/runtime.config';
import { apiRequest } from '@/services/apiClient';
import CloudPreferences from '@/components/CloudPreferences';
import Home from '@/pages/Home';

function Header() {
  const [theme, setTheme] = useState(getPreferences().theme);
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    updatePreferences({ theme: next }); setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    // ThemeProvider also watches the storage key; reload is not needed.
  };
  return <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
    <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
      <Link className="font-semibold tracking-tight text-lg" to="/">☁ BabiesIQ Cloud</Link>
      <div className="flex items-center gap-3 text-sm">
        <button type="button" onClick={toggle} aria-label="Toggle dark mode" className="rounded-xl border px-3 py-2">{theme === 'dark' ? '☀' : '☾'}</button>
        <Link to="/pricing" className="hidden sm:block">Pricing</Link>
        <Link to="/login" className="rounded-xl border px-3 py-2">Log in</Link>
      </div>
    </nav>
  </header>;
}
function Auth({ signup = false }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [code, setCode] = useState('');
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      if (signup) {
        if (verificationPending) {
          const result = await apiRequest('/api/v1/auth/signup/verify', { method: 'POST', body: { email: form.email, code } });
          if (result.ok) { navigate('/login'); return; }
        } else {
          await apiRequest('/api/v1/auth/signup/start', { method: 'POST', body: form });
          setVerificationPending(true);
        }
        return;
      }
      setError('Secure sign-in is being configured. Please check back shortly.');
    } catch (e) { setError(e.message || 'Request failed'); } finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-md px-5 py-20">
    <button onClick={() => navigate(-1)} className="mb-8 text-sm text-muted-foreground">← Back</button>
    <h1 className="text-3xl font-semibold">{signup ? 'Create your cloud account' : 'Welcome back'}</h1>
    <p className="mt-2 text-muted-foreground">BabiesIQ Cloud account security</p>
    <form onSubmit={submit} className="mt-8 space-y-4">
      {verificationPending && <p className="rounded-xl border p-3 text-sm">Enter the 6-digit verification code sent to your email. It expires in 5 minutes.</p>}
      {verificationPending && <label className="block text-sm">Verification code<input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required className="mt-1 w-full rounded-xl border bg-background p-3" value={code} onChange={e=>setCode(e.target.value.replace(/\\D/g,''))}/></label>}
      {!verificationPending && <>
      {signup && <div className="grid grid-cols-2 gap-3">{['firstName','lastName'].map(k=><label key={k} className="text-sm">{k === 'firstName' ? 'First name' : 'Last name'}<input className="mt-1 w-full rounded-xl border bg-background p-3" required value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}</div>}
      <label className="block text-sm">Email<input type="email" required autoComplete="email" className="mt-1 w-full rounded-xl border bg-background p-3" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label className="block text-sm">Password<input type="password" minLength={12} required autoComplete={signup ? 'new-password' : 'current-password'} className="mt-1 w-full rounded-xl border bg-background p-3" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
      </>}
      {error && <p role="alert" className="text-sm text-amber-600">{error}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-primary p-3 font-medium text-primary-foreground">{signup ? (verificationPending ? 'Verify email' : 'Send verification code') : 'Sign in'}</button>
    </form>
    <div className="mt-5 flex justify-between text-sm"><Link to={signup?'/login':'/signup'}>{signup?'Sign in instead':'Create account'}</Link><Link to="/forgot-password">Forgot password?</Link></div>
    <p className="mt-8 text-xs text-muted-foreground">Google sign-in and email verification will be enabled after secure backend configuration.</p>
  </main>;
}
function StatusPage({ title }) {
  const [status,setStatus]=useState('Checking service…');
  useEffect(()=>{const controller=new AbortController();apiRequest('/health',{signal:controller.signal}).then(()=>setStatus('API online')).catch(()=>setStatus('Service is temporarily unavailable'));return ()=>controller.abort()},[]);
  return <main className="mx-auto max-w-4xl px-5 py-20"><h1 className="text-3xl font-semibold">{title}</h1><p className="mt-3 text-muted-foreground">{status}</p><p className="mt-5 text-sm">Account and server operations will become available when the secure backend integration is complete.</p></main>;
}
function Shell() {
  return <div className="min-h-screen bg-background text-foreground"><Header/><Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/login" element={<Auth/>}/>
    <Route path="/signup" element={<Auth signup/>}/>
    <Route path="/forgot-password" element={<StatusPage title="Password recovery"/>}/>
    <Route path="/reset-password" element={<StatusPage title="Reset password"/>}/>
    <Route path="/verify-email" element={<StatusPage title="Verify email"/>}/>
    <Route path="/settings" element={<main className="mx-auto max-w-xl px-5 py-12"><CloudPreferences/></main>}/>
    <Route path="/pricing" element={<StatusPage title="Pricing"/>}/>
    <Route path="/configure" element={<StatusPage title="Create server"/>}/>
    <Route path="/docs" element={<StatusPage title="Documentation"/>}/>
    <Route path="/dashboard" element={<StatusPage title="Cloud dashboard"/>}/>
    <Route path="*" element={<StatusPage title="Page not found"/>}/>
  </Routes><footer className="border-t px-5 py-8 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} BabiesIQ Cloud</footer><Toaster position="top-right" richColors/></div>;
}
export default function App() {
  return <ThemeProvider><BrowserRouter><Shell/></BrowserRouter></ThemeProvider>;
}
