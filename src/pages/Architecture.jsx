import { BackLink } from '@/components/cloud/CloudUI';
import ApperIcon from '@/components/ApperIcon';

export const route = { path: '/architecture', layout: 'owner', access: 'authenticated' };
export const nav = { icon: 'Network', label: 'API architecture', section: 'Workspace', order: 15, profiles: null };

const steps = [
  ['Frontend', 'React + TypeScript migration-ready UI', 'Customer config, account screens, quotes, tickets and DNS instructions.'],
  ['Go gateway', 'HTTP JSON API', 'Validates server specs, owns BabiesIQ Cloud API integration and runs order lifecycle. Demo implementation included in project backend-go/.'],
  ['Provisioning worker', 'Async jobs with idempotency', 'Create managed container services with approved quotas, set required variables and manage cleanup. Not connected yet.'],
  ['BabiesIQ Cloud provisioning control plane', 'Service / volume / domain APIs', 'Register customer web domains with actual targets and expose SSH only through supported proxies.'],
  ['PostgreSQL + audit', 'Durable data and event ledger', 'Authoritative tenant state, payments, idempotency keys, server assignments and incident logs. Production pending.'],
];

export default function Architecture() {
  return (
    <div>
      <BackLink to="/dashboard" label="Back to dashboard"/>
      <p className="font-heading text-[11px] font-bold uppercase tracking-widest text-primary">Platform / Engineering</p>
      <h1 className="mt-3 font-heading text-3xl font-bold">Provisioning architecture</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">A safe separation between the customer website, Go backend, billing provider and BabiesIQ Cloud resources.</p>
      <div className="mt-8 space-y-4">
        {steps.map(([name,tech,description],i)=>(
          <div key={name} className="flex gap-5 rounded-md border border-border bg-card p-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-md bg-primary/10 font-heading text-sm font-bold text-primary">{String(i+1).padStart(2,'0')}</span>
            <div><div className="font-heading text-base font-bold">{name}</div><div className="mt-1 text-xs font-semibold text-primary">{tech}</div><p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p></div>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-md border border-warning-border bg-warning-muted p-5 text-xs leading-6 text-warning">
        Go endpoints are independent source code only; frontend and BabiesIQ Cloud are not wired to them in this preview. Public API access needs authentication, tenant authorization, persistent storage and abuse limits before production.
      </div>
      <div className="mt-8 rounded-md border border-border bg-card p-6">
        <div className="flex items-center gap-2 font-heading text-sm font-bold"><ApperIcon name="Terminal" size={18} className="text-primary"/> Example endpoints</div>
        <div className="mt-5 space-y-2 font-heading text-xs text-muted-foreground">
          <div>GET /health</div><div>GET /api/v1/meta</div><div>POST /api/v1/quote</div>
          <div>POST /api/v1/orders/demo</div><div>GET /api/v1/orders/demo/:id</div><div>POST /api/v1/domains/preview</div>
        </div>
      </div>
    </div>
  );
}
