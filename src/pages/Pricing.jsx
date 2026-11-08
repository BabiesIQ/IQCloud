import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ApperIcon from '@/components/ApperIcon';
import { SectionHead, formatMoney, quoteServer } from '@/components/cloud/CloudUI';

export const route = { path: '/pricing', layout: 'public', access: 'public' };

const presets = [
  { name: 'Launch', tagline: 'Simple websites & experiments', cpu: 1, ram: 1, storage: 20, popular: false, features: ['1 vCPU', '1 GB RAM', '20 GB requested disk', 'Linux image selection'] },
  { name: 'Build', tagline: 'Apps, services & databases', cpu: 2, ram: 4, storage: 50, popular: true, features: ['2 vCPU', '4 GB RAM', '50 GB requested disk', 'Custom domain workflow'] },
  { name: 'Scale', tagline: 'Heavier apps & staging', cpu: 4, ram: 8, storage: 100, popular: false, features: ['4 vCPU', '8 GB RAM', '100 GB requested disk', 'Support ticket access'] },
];

export default function Pricing() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-17 md:px-8">
      <div className="mb-14 text-center">
        <p className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-primary">Straightforward cloud pricing</p>
        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight md:text-5xl">Only pay for what you configure.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
          Preview estimates in INR. Rates and capacity are illustrative and do not represent confirmed Railway allocations or live offers.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {presets.map((plan) => (
          <div key={plan.name} className={'relative rounded-md border bg-card p-8 ' + (plan.popular ? 'border-primary' : 'border-border')}>
            {plan.popular && <div className="absolute right-4 top-4 rounded bg-primary px-2 py-1 text-[10px] font-bold uppercase text-primary-foreground">Popular</div>}
            <div className="font-heading text-lg font-bold">{plan.name}</div>
            <p className="mt-2 text-sm text-muted-foreground">{plan.tagline}</p>
            <div className="mt-9 border-b border-border pb-7">
              <span className="font-heading text-4xl font-bold">{formatMoney(quoteServer({...plan, region:'us-west',term:'monthly'}))}</span>
              <span className="ml-2 text-sm text-muted-foreground">/ month*</span>
            </div>
            <div className="mt-7 space-y-4">
              {plan.features.map((feature) => <div key={feature} className="flex items-center gap-3 text-sm"><ApperIcon name="Check" size={16} className="text-success" />{feature}</div>)}
            </div>
            <Button asChild variant={plan.popular ? 'default' : 'outline'} className="mt-10 w-full">
              <Link to="/configure">Customize plan <ApperIcon name="ArrowUpRight" size={16} /></Link>
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-md border border-warning-border bg-warning-muted px-5 py-4 text-sm text-warning">
        * These are demo quotes, not billable plans. Storage, virtual CPU and memory are requested specs only. Full OS virtualization, public IPv4 assignment, and capacity cannot be guaranteed by a Railway container.
      </div>
      <div className="mt-20">
        <SectionHead eyebrow="Included in the experience" title="Plan flexibility without the guesswork" />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ['Globe', 'Four selectable regions', 'Choose a geographic region when requesting a deployment.'],
            ['HardDrive', 'Custom disk requests', 'Separate ephemeral and persistent-storage estimates transparently.'],
            ['ReceiptText', 'Billing overview', 'Track generated demo invoices and request statuses from your dashboard.'],
          ].map(([icon,title,desc])=>(
            <div key={title} className="rounded-md border border-border bg-card p-6">
              <ApperIcon name={icon} size={24} className="text-primary" />
              <h3 className="mt-5 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
