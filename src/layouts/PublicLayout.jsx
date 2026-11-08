import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import SingleThemeToggle from '@/components/cloud/SingleThemeToggle';
import ApperIcon from '@/components/ApperIcon';
import { useAuth } from '@/layouts/RootLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const nav = [
  { to: '/pricing', label: 'Pricing' },
  { to: '/configure', label: 'Create server' },
  { to: '/docs', label: 'Docs' },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const loggedIn = Boolean(isAuthenticated && user);
  const initials = (user?.firstName?.[0] || user?.emailAddress?.[0] || 'U').toUpperCase();

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link to="/" onClick={() => setOpen(false)} className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
              <ApperIcon name="ServerCog" size={23} strokeWidth={2.2} />
            </span>
            <span className="whitespace-nowrap text-[17px] font-bold tracking-tight sm:text-xl">
              BabiesIQ <span className="text-primary">Cloud</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            {nav.map(item => <Link key={item.to} to={item.to} className="hover:text-foreground">{item.label}</Link>)}
          </nav>

          <div className="flex items-center gap-2">
            <SingleThemeToggle />
            {loggedIn ? (
              <>
                <Link to="/dashboard" aria-label="Dashboard" title="Dashboard" className="grid size-10 place-items-center rounded-xl text-muted-foreground hover:bg-accent"><ApperIcon name="LayoutDashboard" size={20}/></Link>
                <Link to="/dashboard" aria-label="My profile" title="My profile" className="grid size-10 place-items-center overflow-hidden rounded-full border border-border bg-primary/10 text-sm font-semibold text-primary">{user?.avatarUrl ? <img src={user.avatarUrl} alt="Profile" className="size-full object-cover"/> : initials}</Link>
              </>
            ) : (
              <button type="button" onClick={() => setLoginOpen(true)} title="Log in" aria-label="Log in" className="grid size-10 place-items-center rounded-xl text-muted-foreground hover:bg-accent"><ApperIcon name="LockKeyhole" size={20}/></button>
            )}
            <Link to="/configure" className="hidden rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-80 lg:inline-flex">
              Get started
            </Link>
            <button type="button" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} className="grid size-10 place-items-center rounded-xl border border-border text-muted-foreground hover:bg-accent md:hidden">
              <ApperIcon name={open ? 'X' : 'Menu'} size={22} />
            </button>
          </div>
        </div>
        {open && (
          <nav className="space-y-1 border-t border-border bg-background px-4 py-3 md:hidden">
            {nav.map(item => <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-accent">{item.label}</Link>)}
            {loggedIn ? <Link to="/dashboard" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-accent">Dashboard</Link> : <button onClick={() => {setOpen(false);setLoginOpen(true);}} className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium hover:bg-accent">Log in</button>}
          </nav>
        )}
      </header>
      <Outlet />
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader><DialogTitle>Welcome to BabiesIQ Cloud</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Sign in to manage your cloud account.</p>
          <Link to="/login" onClick={() => setLoginOpen(false)} className="mt-3 rounded-xl bg-foreground px-5 py-3 text-center text-sm font-semibold text-background">Log in</Link>
          <Link to="/signup" onClick={() => setLoginOpen(false)} className="rounded-xl border border-border px-5 py-3 text-center text-sm font-medium">Create account</Link>
        </DialogContent>
      </Dialog>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="font-semibold">BabiesIQ <span className="text-primary">Cloud</span></div>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">Cloud hosting made simple. Preview only — no live servers or payments.</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-muted-foreground">
            <Link to="/pricing">Pricing</Link>
            <Link to="/docs">Docs</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/refund-policy">Refunds</Link>
          </div>
        </div>
        <div className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} BabiesIQ Cloud · Demo
        </div>
      </footer>
    </div>
  );
}
