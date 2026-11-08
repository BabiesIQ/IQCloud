import { Link } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';

export const REGIONS = [
  { code: 'us-west', city: 'US West', subtitle: 'California, USA', flag: '🇺🇸', latency: 'Americas' },
  { code: 'us-east', city: 'US East', subtitle: 'Virginia, USA', flag: '🇺🇸', latency: 'Americas' },
  { code: 'eu-west', city: 'Europe West', subtitle: 'Amsterdam, Netherlands', flag: '🇳🇱', latency: 'Europe' },
  { code: 'ap-southeast', city: 'Asia Pacific', subtitle: 'Singapore', flag: '🇸🇬', latency: 'Asia' },
];

export const SYSTEMS = [
  { id: 'ubuntu-24', name: 'Ubuntu 24.04 LTS', icon: '🐧' },
  { id: 'debian-12', name: 'Debian 12', icon: '🌀' },
  { id: 'alpine', name: 'Alpine Linux', icon: '⛰️' },
];

export function quoteServer({ cpu, ram, storage, region, term }) {
  const base = 149 + cpu * 110 + ram * 95 + storage * 3.5;
  const regionMultiplier = region === 'ap-southeast' ? 1.12 : region === 'eu-west' ? 1.08 : 1;
  const discount = term === 'yearly' ? 0.85 : 1;
  return Math.round(base * regionMultiplier * discount);
}

export function SectionHead({ eyebrow, title, description, right }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div>
        {eyebrow && (
          <div className="mb-3 font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</div>
        )}
        <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
        {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {right}
    </div>
  );
}

export function Status({ value }) {
  const good = ['Running', 'Active', 'Verified', 'Paid', 'Resolved'];
  const waiting = ['Pending', 'Unverified', 'Open', 'Provisioning', 'Draft'];
  return (
    <span className={'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ' +
      (good.includes(value)
        ? 'border-success-border bg-success-muted text-success'
        : waiting.includes(value)
          ? 'border-warning-border bg-warning-muted text-warning'
          : 'border-border bg-muted text-muted-foreground')}>
      <span className="size-1.5 rounded-full bg-current" />
      {value}
    </span>
  );
}

export function Metric({ label, value, icon, hint }) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
        <ApperIcon name={icon} size={18} />
      </div>
      <div className="mt-4 font-heading text-3xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function BackLink({ to, label }) {
  return (
    <Link className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground" to={to}>
      <ApperIcon name="ArrowLeft" size={16} /> {label}
    </Link>
  );
}

export const formatMoney = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(value) || 0);
