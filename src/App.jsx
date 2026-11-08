import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Bell } from 'lucide-react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { getPreferences, updatePreferences } from '@/config/runtime.config';
import { apiRequest } from '@/services/apiClient';
import CloudPreferences from '@/components/CloudPreferences';
import PasswordSettings from '@/components/PasswordSettings';
import PasswordField from '@/components/PasswordField';
import Home from '@/pages/Home';
import PasswordRecovery from '@/pages/auth/PasswordRecovery';
import SecurityCenter from '@/pages/SecurityCenter';
import Notifications from '@/pages/Notifications';

function Header() {
  const [account, setAccount] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState(getPreferences().theme);
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    const refresh = () => apiRequest('/api/v1/auth/me')
      .then(user => { if (active) setAccount(user); })
      .catch(() => { if (active) setAccount(null); });
    refresh();
    window.addEventListener('iqcloud:auth-changed', refresh);
    return () => { active = false; window.removeEventListener('iqcloud:auth-changed', refresh); };
  }, []);
  useEffect(() => {
    let active = true;
    const refresh = () => {
      if (!account) { setUnreadCount(0); return; }
      apiRequest('/api/v1/notifications')
        .then(data => { if (active) setUnreadCount(Math.max(0, Number(data.unreadCount) || 0)); })
        .catch(() => { if (active) setUnreadCount(0); });
    };
    refresh();
    window.addEventListener('iqcloud:notifications-changed', refresh);
    return () => { active = false; window.removeEventListener('iqcloud:notifications-changed', refresh); };
  }, [account]);
  useEffect(() => {
    const sync = () => setTheme(getPreferences().theme);
    window.addEventListener('iqcloud:preferences', sync);
    return () => window.removeEventListener('iqcloud:preferences', sync);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = event => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    updatePreferences({ theme: next });
    setTheme(next);
  };
  async function signOut() {
    setLoggingOut(true);
    try {
      await apiRequest('/api/v1/auth/logout', { method: 'POST' });
      setAccount(null);
      setMenuOpen(false);
      window.dispatchEvent(new Event('iqcloud:auth-changed'));
      navigate('/login', { replace: true });
    } catch (error) {
      alert(error.message || 'Could not sign out. Please retry.');
    } finally { setLoggingOut(false); }
  }
  const menuItems = [
    { to: '/', label: 'Home', icon: '⌂' },
    ...(account ? [{ to: '/dashboard', label: 'Dashboard', icon: '▦' }, { to: '/security', label: 'Security Center', icon: '♢' }] : []),
    { to: '/pricing', label: 'Pricing', icon: '◇' },
    ...(account ? [{ to: '/settings', label: 'Preferences', icon: '⚙' }] : []),
    { to: '/docs', label: 'Documentation', icon: '◫' }
  ];
  return <>
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open navigation menu" aria-expanded={menuOpen} aria-controls="cloud-navigation" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" >
            <span className="flex flex-col gap-1"><span className="block h-0.5 w-5 rounded bg-current"/><span className="block h-0.5 w-5 rounded bg-current"/><span className="block h-0.5 w-5 rounded bg-current"/></span>
          </button>
          <Link className="truncate text-base font-semibold tracking-tight sm:text-lg" to="/">☁ BabiesIQ Cloud</Link>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-sm">
          {account && <Link to="/notifications" aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'} title="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-xl border hover:bg-muted">
            <Bell size={19} aria-hidden="true" />
            {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-black">{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </Link>}
          <button type="button" onClick={toggleTheme} aria-label="Toggle dark mode" className="flex h-10 w-10 items-center justify-center rounded-xl border">{theme === 'dark' ? '☀' : '☾'}</button>
          {!account && <Link to="/login" className="rounded-xl border px-3 py-2">Log in</Link>}
        </div>
      </nav>
    </header>
    {menuOpen && <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 h-full w-full bg-black/60" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} />
      <aside id="cloud-navigation" role="dialog" aria-modal="true" aria-label="Navigation" className="absolute inset-y-0 left-0 flex w-[min(86vw,340px)] flex-col border-r bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-5">
          <div><p className="font-semibold">☁ BabiesIQ Cloud</p><p className="mt-1 text-xs text-muted-foreground">{account ? (account.email || 'My account') : 'Cloud hosting platform'}</p></div>
          <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu" className="rounded-lg border px-3 py-2">✕</button>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-3">
          {menuItems.map(item => <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-muted focus-visible:bg-muted"><span aria-hidden="true" className="w-6 text-center text-lg">{item.icon}</span>{item.label}</Link>)}
        </div>
        <div className="border-t p-3">
          {account ? <button type="button" onClick={signOut} disabled={loggingOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-50"><span aria-hidden="true" className="w-6 text-center">⇥</span>{loggingOut ? 'Logging out…' : 'Log out'}</button> :
          <Link to="/login" onClick={() => setMenuOpen(false)} className="block rounded-xl bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground">Log in</Link>}
        </div>
      </aside>
    </div>}
  </>;
}
function Auth({ signup = false }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [code, setCode] = useState('');
  const googleError = new URLSearchParams(window.location.search).get('google_error');
  const googleMessages = { unavailable: 'Google sign-in is not configured yet.', account_exists: 'This email already belongs to an account.', link_verification_required: 'For non-Gmail addresses, additional verification is required before linking an existing account.', account_conflict: 'This account is already connected to another Google identity. Contact support.', expired_state: 'Google sign-in expired. Please try again.', invalid_request: 'Google sign-in could not be verified. Please retry.', unverified_email: 'Google did not confirm a verified email.', authorization_failed: 'Google authorization failed.' };
  const startGoogle = () => { window.location.assign(getPreferences().apiBaseUrl + '/api/v1/auth/google/start'); };
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
      await apiRequest('/api/v1/auth/login', { method: 'POST', body: { email: form.email, password: form.password } });
      window.dispatchEvent(new Event('iqcloud:auth-changed'));
      navigate('/dashboard');
    } catch (e) { setError(e.message || 'Request failed'); } finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-md px-5 py-20">
    <button onClick={() => navigate(-1)} className="mb-8 text-sm text-muted-foreground">← Back</button>
    <h1 className="text-3xl font-semibold">{signup ? 'Create your cloud account' : 'Welcome back'}</h1>
    <p className="mt-2 text-muted-foreground">BabiesIQ Cloud account security</p>
    <form onSubmit={submit} className="mt-8 space-y-4">
      {signup && verificationPending && <p className="rounded-xl border p-3 text-sm">Enter the 6-digit verification code sent to your email. It expires in 5 minutes.</p>}
      {verificationPending && <label className="block text-sm">Verification code<input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required className="mt-1 w-full rounded-xl border bg-background p-3" value={code} onChange={e=>setCode(e.target.value.replace(/\\D/g,''))}/></label>}
      {(!signup || !verificationPending) && <>
      {signup && <div className="grid grid-cols-2 gap-3">{['firstName','lastName'].map(k=><label key={k} className="text-sm">{k === 'firstName' ? 'First name' : 'Last name'}<input className="mt-1 w-full rounded-xl border bg-background p-3" required value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}</div>}
      <label className="block text-sm">Email<input type="email" required autoComplete="email" className="mt-1 w-full rounded-xl border bg-background p-3" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <PasswordField label="Password" minLength={signup ? 12 : undefined} autoComplete={signup ? 'new-password' : 'current-password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
      </>}
      {error && <p role="alert" className="text-sm text-amber-600">{error}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-primary p-3 font-medium text-primary-foreground">{signup ? (verificationPending ? 'Verify email' : 'Send verification code') : 'Sign in'}</button>
    </form>
    <div className="mt-5">
      <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border"/><span>or continue with</span><span className="h-px flex-1 bg-border"/></div>
      <button type="button" onClick={startGoogle} className="flex w-full items-center justify-center gap-3 rounded-xl border bg-background px-4 py-3 text-sm font-medium hover:bg-muted" aria-label="Continue with Google"><span className="font-bold text-lg text-blue-500">G</span> Continue with Google</button>
      {googleError && <p role="alert" className="mt-3 text-sm text-amber-600">{googleMessages[googleError] || 'Google sign-in failed. Please retry.'}</p>}
    </div>
    <div className="mt-5 flex justify-between text-sm"><Link to={signup?'/login':'/signup'}>{signup?'Sign in instead':'Create account'}</Link><Link to="/forgot-password">Forgot password?</Link></div>
    <p className="mt-8 text-xs text-muted-foreground">Your account is protected by email verification and secure sessions.</p>
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
    <Route path="/login" element={<Auth key="login"/>}/>
    <Route path="/signup" element={<Auth key="signup" signup/>}/>
    <Route path="/forgot-password" element={<PasswordRecovery/>}/>
    <Route path="/reset-password" element={<PasswordRecovery reset/>}/>
    <Route path="/verify-email" element={<StatusPage title="Verify email"/>}/>
    <Route path="/security" element={<SecurityCenter/>}/>
    <Route path="/notifications" element={<Notifications/>}/>
    <Route path="/settings" element={<main className="mx-auto max-w-xl space-y-5 px-5 py-12"><div><p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">Account settings</p><h1 className="mt-2 text-3xl font-semibold">Preferences</h1><p className="mt-2 text-sm text-muted-foreground">Customize your experience and manage account security.</p></div><CloudPreferences/><PasswordSettings/></main>}/>
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
