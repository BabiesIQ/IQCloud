import { Link } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { sdk } from '@/services/sdk';
import { StatsSkeleton, ListSkeleton } from '@/components/PageSkeleton';
import { Button } from '@/components/ui/button';
import ApperIcon from '@/components/ApperIcon';
import { SectionHead, Metric, Status, formatMoney, REGIONS } from '@/components/cloud/CloudUI';

export const route = { path: '/dashboard', layout: 'owner', access: 'authenticated' };
export const nav = { icon: 'LayoutDashboard', label: 'Overview', section: 'Workspace', order: 10, profiles: null };

export default function Dashboard() {
  const { data, loading, error, run } = useFetch(async () => {
    const requests = await Promise.all([
      sdk.table('instances_c').select(['Id','Name','region_c','status_c','price_c','cpu_c','ram_c','CreatedOn']).orderByDesc('CreatedOn').page(1,100).fetch(),
      sdk.table('domains_c').select(['Id','Name','status_c']).page(1,100).fetch(),
      sdk.table('invoices_c').select(['Id','Name','amount_c','status_c']).page(1,100).fetch(),
      sdk.table('tickets_c').select(['Id','Name','status_c','priority_c']).page(1,100).fetch(),
    ]);
    for (const result of requests) if (!result.success) throw new Error(result.message);
    return {
      instances: requests[0].data,
      domains: requests[1].data,
      invoices: requests[2].data,
      tickets: requests[3].data,
    };
  }, []);
  const instances = data?.instances ?? [];
  const domains = data?.domains ?? [];
  const invoices = data?.invoices ?? [];
  const tickets = data?.tickets ?? [];
  const active = instances.filter(row => row.status_c==='Running').length;
  const pendingDomains = domains.filter(row => row.status_c!=='Verified').length;
  const openTickets = tickets.filter(row => row.status_c==='Open').length;
  const unpaid = invoices.filter(row => row.status_c!=='Paid').reduce((sum,row)=>sum+Number(row.amount_c||0),0);

  return (
    <div>
      <div className="mb-9 flex flex-wrap items-center justify-between gap-4">
        <div><p className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Friday / Cloud workspace</p><h1 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-4xl">Control center<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">An overview of your example infrastructure, account and next actions.</p></div>
        <Button asChild><Link to="/configure">Configure server <ApperIcon name="Plus" size={17} /></Link></Button>
      </div>
      <div className="mb-4 rounded-md border border-warning-border bg-warning-muted px-5 py-3 text-xs leading-6 text-warning">Preview mode — figures and statuses below represent sample data, not running VPS services or outstanding charges.</div>
      {loading && data===undefined ? <StatsSkeleton count={4}/> : error ? (
        <div className="rounded-md border border-destructive p-6 text-sm text-destructive">{error.message ?? String(error)} <Button variant="outline" onClick={run}>Retry</Button></div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Running (sample)" value={active} icon="Server" hint={instances.length+' example instances'}/>
            <Metric label="DNS needs review" value={pendingDomains} icon="Globe2" hint="Not live-verified"/>
            <Metric label="Open support tickets" value={openTickets} icon="LifeBuoy" hint="Demo support queue"/>
            <Metric label="Unpaid sample totals" value={formatMoney(unpaid)} icon="Wallet" hint="No real balance due"/>
          </div>
          <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
            <div className="space-y-6">
              <div className="rounded-md border border-border bg-card">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-5">
                  <div><h2 className="font-heading text-base font-bold">Recent instances</h2><p className="mt-1 text-xs text-muted-foreground">Your example cloud fleet</p></div>
                  <Link to="/instances" className="flex items-center gap-1 text-xs font-semibold text-primary">View all <ApperIcon name="ArrowUpRight" size={15}/></Link>
                </div>
                <div className="divide-y divide-border">
                  {instances.slice(0,5).map(row=>(
                    <Link key={row.Id} to={'/instances/'+row.Id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-accent/40">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-muted text-primary"><ApperIcon name="Server" size={18}/></span>
                        <div className="min-w-0"><p className="truncate text-sm font-semibold">{row.Name}</p><p className="mt-1 text-xs text-muted-foreground">{REGIONS.find(r=>r.code===row.region_c)?.city??row.region_c} · {row.cpu_c} vCPU / {row.ram_c} GB</p></div>
                      </div>
                      <Status value={row.status_c}/>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link to="/domains" className="rounded-md border border-border bg-card p-6 hover:border-primary/50"><ApperIcon name="Globe2" size={21} className="text-primary"/><h3 className="mt-4 font-heading text-sm font-bold">Connect a domain</h3><p className="mt-2 text-xs leading-6 text-muted-foreground">Manage CNAME records for your websites and verify ownership.</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">Open DNS manager <ApperIcon name="ArrowRight" size={14}/></span></Link>
                <Link to="/tickets" className="rounded-md border border-border bg-card p-6 hover:border-primary/50"><ApperIcon name="LifeBuoy" size={21} className="text-primary"/><h3 className="mt-4 font-heading text-sm font-bold">Need a hand?</h3><p className="mt-2 text-xs leading-6 text-muted-foreground">Ask about deploys, SSH, storage or the billing experience.</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">Open support <ApperIcon name="ArrowRight" size={14}/></span></Link>
              </div>
            </div>
            <aside className="rounded-md border border-border bg-card p-6">
              <div className="flex items-center justify-between"><div><p className="font-heading text-[11px] uppercase tracking-widest text-primary">Your day</p><h2 className="mt-2 font-heading text-lg font-bold">Action timeline</h2></div><ApperIcon name="Activity" size={19} className="text-primary"/></div>
              <div className="mt-9 space-y-1 border-l border-border pl-6">
                {[
                  {label:'Review domain records',detail:pendingDomains+' DNS entries need verification',icon:'Globe2',to:'/domains'},
                  {label:'Check instance requests',detail:instances.filter(x=>x.status_c==='Pending'||x.status_c==='Provisioning').length+' awaiting allocation',icon:'Server',to:'/instances'},
                  {label:'Resolve support queries',detail:openTickets+' open sample tickets',icon:'LifeBuoy',to:'/tickets'},
                  {label:'Review billing history',detail:invoices.length+' sample invoices available',icon:'ReceiptText',to:'/invoices'},
                ].map((item,i)=>(
                  <Link key={item.label} to={item.to} className="relative block pb-10 last:pb-0 hover:text-primary">
                    <span className={'absolute -left-[31px] top-0 grid size-4 place-items-center rounded-full '+(i===0?'bg-highlight':'border-2 border-border bg-card')}/>
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="mt-2 text-xs leading-6 text-muted-foreground">{item.detail}</div>
                    <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-primary">Review <ApperIcon name="ArrowUpRight" size={12}/></div>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
