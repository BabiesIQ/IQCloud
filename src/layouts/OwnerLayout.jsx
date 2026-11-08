import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useOwnerLayoutData } from '@/hooks/useOwnerLayoutData';
import { cn } from '@/lib/utils';
import ApperIcon from '@/components/ApperIcon';
import UserMenu from '@/components/UserMenu';
import SingleThemeToggle from '@/components/cloud/SingleThemeToggle';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function OwnerLayout() {
  const { user, logout, homeRoute, navItems, navGroups, initials, displayName, counts } = useOwnerLayoutData();
  const grouped = navGroups.length ? navGroups : [{ label: null, items: navItems }];
  const [navOpen, setNavOpen] = useState(false);

  const navigation = grouped.map((group, index) => (
    <div key={group.label ?? index} className="space-y-1">
      {group.label && (
        <div className="px-3 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground/45">
          {group.label}
        </div>
      )}
      {group.items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setNavOpen(false)}
          className={({ isActive }) => cn(
            'flex min-h-10 items-center gap-3 rounded-md px-3 py-2.5 text-sm transition',
            isActive ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
          )}
        >
          <ApperIcon name={item.icon ?? 'Circle'} size={17} />
          <span>{item.label}</span>
          {counts[item.to] != null && <span className="ml-auto text-xs opacity-60">{counts[item.to]}</span>}
        </NavLink>
      ))}
    </div>
  ));

  return (
    <div className="min-h-svh bg-background text-foreground lg:flex">
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 border-r border-sidebar-border bg-sidebar px-4 py-6 text-sidebar-foreground lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col',
        navOpen ? 'block' : 'hidden lg:flex',
      )}>
        <Link to={homeRoute} className="mb-10 flex items-center gap-3 px-2 font-heading text-sm font-bold">
          <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
            <ApperIcon name="Cloud" size={21} />
          </span>
          <span>BabiesIQ <span className="text-primary">Cloud</span></span>
        </Link>
        <div className="mb-6 rounded-md border border-sidebar-border bg-sidebar-accent/40 p-3 text-xs">
          <div className="flex items-center gap-2 font-semibold text-sidebar-foreground">
            <span className="size-1.5 rounded-full bg-highlight" />
            Control center
          </div>
          <p className="mt-1.5 leading-relaxed text-sidebar-foreground/55">Demo infrastructure environment</p>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto">{navigation}</nav>
        <Link to="/" className="mt-5 flex items-center gap-2 rounded-md border border-sidebar-border p-3 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent">
          <ApperIcon name="ArrowUpRight" size={15} /> Return to website
        </Link>
      </aside>
      {navOpen && (
        <button className="fixed inset-0 z-40 bg-foreground/40 lg:hidden" aria-label="Close navigation" onClick={() => setNavOpen(false)} />
      )}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-17 items-center gap-3 border-b border-border bg-card/95 px-5 backdrop-blur md:px-8">
          <button className="lg:hidden" aria-label="Open menu" onClick={() => setNavOpen(true)}>
            <ApperIcon name="Menu" size={21} />
          </button>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            BabiesIQ / <span className="text-foreground">Cloud Console</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <SingleThemeToggle />
            <UserMenu user={user} initials={initials} displayName={displayName} logout={logout} />
          </div>
        </header>
        <main className="mx-auto max-w-[1530px] px-5 py-7 md:px-9 md:py-10">
          <ErrorBoundary><Outlet /></ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
