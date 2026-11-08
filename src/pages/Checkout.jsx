import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { REGIONS, SYSTEMS, quoteServer, formatMoney } from '@/components/cloud/CloudUI';
import ApperIcon from '@/components/ApperIcon';

export const route = { path: '/checkout', layout: 'public', access: 'public' };

export default function Checkout() {
  const [search] = useSearchParams();
  const name = search.get('name') || 'my-cloud-server';
  const region = search.get('region') || 'ap-southeast';
  const os = search.get('os') || 'ubuntu-24';
  const cpu = Math.min(8, Math.max(1, Number(search.get('cpu')) || 2));
  const ram = Math.min(16, Math.max(1, Number(search.get('ram')) || 4));
  const storage = Math.min(200, Math.max(10, Number(search.get('storage')) || 50));
  const term = search.get('term') === 'yearly' ? 'yearly' : 'monthly';
  const amount = quoteServer({cpu,ram,storage,region,term});
  const regionLabel = REGIONS.find(x => x.code === region)?.city || region;
  const imageLabel = SYSTEMS.find(x => x.id === os)?.name || os;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link className="mb-9 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" to="/configure"><ApperIcon name="ArrowLeft" size={16} /> Back to configuration</Link>
      <div className="mb-9"><p className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-primary">02 / Review request</p><h1 className="mt-3 font-heading text-3xl font-bold">Review your configuration</h1><p className="mt-3 text-sm text-muted-foreground">This is a demo request flow. No real server or invoice is created here.</p></div>
      <div className="rounded-md border border-border bg-card p-7">
        <div className="flex items-center gap-3 border-b border-border pb-6">
          <span className="grid size-11 place-items-center rounded-md bg-primary/10 text-primary"><ApperIcon name="Server" size={22}/></span>
          <div><p className="font-heading text-lg font-bold">{name}</p><p className="text-xs text-muted-foreground">Custom compute configuration</p></div>
        </div>
        <div className="grid gap-x-8 gap-y-6 py-8 sm:grid-cols-2">
          {[
            ['Location',regionLabel],['Operating system',imageLabel],['Compute',cpu+' vCPU'],
            ['RAM',ram+' GB'],['Persistent storage request',storage+' GB'],['Billing',term==='yearly'?'Annual':'Monthly'],
          ].map(([label,value])=><div key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-sm font-semibold">{value}</p></div>)}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-md bg-muted px-5 py-5">
          <div><p className="text-xs text-muted-foreground">Estimated monthly equivalent</p><p className="mt-2 font-heading text-3xl font-bold">{formatMoney(amount)}</p></div>
          <div className="text-right text-xs text-muted-foreground">DEMO QUOTE<br/>Not a payment obligation</div>
        </div>
        <div className="mt-7 rounded-md border border-warning-border bg-warning-muted p-4 text-sm leading-6 text-warning">
          Demo only: clicking below opens your console. A production checkout would require verified pricing, available capacity, real payments, merchant policies and secure provisioning.
        </div>
        <Button asChild className="mt-7 w-full" size="lg"><Link to="/login?redirect=%2Fdashboard">Open demo console <ApperIcon name="ArrowRight" size={17} /></Link></Button>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">By using this preview, you can read our <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.</p>
    </div>
  );
}
