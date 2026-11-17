import { Link } from 'react-router-dom';
import {useLocale} from '@/i18n/LocaleProvider';
import BrandLogo from '@/components/BrandLogo';
import NavIcon from '@/components/NavIcon';
import MusicEcosystem from '@/components/MusicEcosystem';
import '@/cloud-motion.css';
import ApperIcon from '@/components/ApperIcon';
import SharedInfrastructure from '@/components/cloud/SharedInfrastructure';


export const route = { path: '/', layout: 'public', access: 'public' };

const features = [
  { icon: 'SlidersHorizontal', title: 'Choose your resources', description: 'Set CPU and RAM. Clear, compute-only monthly pricing.' },
  { icon: 'Globe2', title: 'Connect your domain', description: 'Add your website domain and follow simple DNS steps.' },
  { icon: 'LayoutDashboard', title: 'Manage everything', description: 'Keep servers, domains and billing in one place.' },
];

export default function Home() {
 const {isInternational,currency,t}=useLocale();
  return (
    <main>
      <section className="mx-auto max-w-5xl px-5 pb-20 pt-24 text-center sm:pt-32">
        <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
          <BrandLogo size={24} className="h-6 w-6" />
          BabiesIQ Cloud
        </div>
        <h1 className="mx-auto max-w-4xl text-4xl font-semibold leading-[1.13] tracking-[-0.055em] sm:text-6xl md:text-7xl">
          Your cloud. <span className="text-primary">Made simple.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
          Create a server your way. Pick a region, choose your resources, and manage it all in one simple dashboard.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link to="/dashboard/instances/new" className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition hover:opacity-85">
            Create a server <ApperIcon name="ArrowUpRight" size={17} />
          </Link>
          <Link to="/pricing" className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium hover:bg-accent">
            View pricing <ApperIcon name="ArrowRight" size={16} />
          </Link>
        </div>
        <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-border bg-card/80 px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <ApperIcon name="ShieldCheck" size={15} className="text-primary" />{t('Secure checkout')}
            </span>
            <span aria-hidden="true" className="hidden h-4 w-px bg-border sm:block" />
            <span className="rounded-lg border bg-background px-2.5 py-1 text-xs font-extrabold italic tracking-tight text-[#17418b] dark:text-[#9cbcff]" aria-label="Visa cards">VISA</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-2.5 py-1 text-xs font-semibold" aria-label="Mastercard cards">
              <span aria-hidden="true" className="inline-flex"><span className="size-3.5 rounded-full bg-[#eb001b]" /><span className="-ml-1.5 size-3.5 rounded-full bg-[#f79e1b] opacity-90" /></span>
              Mastercard
            </span>
            <span className="rounded-lg border bg-background px-2.5 py-1 text-xs font-semibold">UPI <span className="text-[10px] font-normal text-muted-foreground">India</span></span>
            <span className="rounded-lg border bg-background px-2.5 py-1 text-xs font-semibold text-[#0070ba] dark:text-[#77b9f6]">PayPal <span className="text-[10px] font-normal text-muted-foreground">International</span></span>
          </div>
          <p className="mt-2 text-center text-[11px] leading-4 text-muted-foreground">{t('Payment method availability is confirmed at checkout and depends on your country and gateway activation.')}</p>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">{isInternational?t('International compute plans use 2× the India price.')+' '+currency+' '+t('figures are estimates. PayPal availability, currency and final amount are confirmed during secure checkout.'):t('Browse plans without paying. Razorpay availability and the final INR payable are confirmed during secure checkout; there is no automatic subscription debit.')}</p>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16"><h2 className="mb-5 text-xl font-semibold">Network & storage details</h2><SharedInfrastructure/></section>
      <section className="border-t border-border bg-card/40 px-5 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">Everything in one place.</h2>
          <p className="mt-3 text-center text-sm text-muted-foreground">Simple tools to get your ideas online.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map(item => (
              <div key={item.title} className="rounded-2xl border border-border bg-card p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-muted text-foreground"><NavIcon name={item.icon==='Globe2'?'domains':item.icon==='LayoutDashboard'?'dashboard':'preferences'} size={30}/></span>
                <h3 className="mt-6 text-base font-semibold">{t(item.title)}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{t(item.description)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-20">
        <div className="relative isolate overflow-hidden rounded-3xl border border-border bg-card p-7 sm:p-11">
          <div className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-2">
            <div>
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">Cloud hosting preview</span>
              <h2 className="mt-6 text-3xl font-semibold tracking-tight">More ways to host.</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">Linux containers today, Windows RDP planned. Choose compute and region from one dashboard.</p>
              <p className="mt-3 text-xs text-muted-foreground">IPv4 and IPv6 networking is supported, with a 2–10 Gbps advertised network range. Actual transfer speeds depend on the source and destination servers, routing, traffic and available bandwidth. Shared host capacity target 2–30 TB is not a per-user SSD or persistence promise. Windows RDP coming later.</p>
              <Link to="/dashboard/instances/new" className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background">Explore servers <ApperIcon name="ArrowUpRight" size={16}/></Link>
            </div>
            <div className="relative min-h-[260px] [perspective:900px]">
              <div className="absolute inset-5 rounded-3xl bg-primary/10 blur-2xl" />
              <div className="cloud-float-a absolute left-[5%] top-4 w-[70%] rounded-2xl border border-border bg-background p-5 shadow-xl">
                <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><ApperIcon name="Server" size={21}/></span><div><div className="text-sm font-semibold">Linux VPS</div><div className="text-xs text-muted-foreground">Cloud compute</div></div></div>
                <div className="mt-5 flex gap-2 text-xs"><span className="rounded-full bg-muted px-3 py-1">Ubuntu</span><span className="rounded-full bg-muted px-3 py-1">Shared storage</span></div>
              </div>
              <div className="cloud-float-b absolute bottom-3 right-0 w-[67%] rounded-2xl border border-border bg-background p-5 shadow-xl">
                <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><ApperIcon name="Monitor" size={21}/></span><div><div className="text-sm font-semibold">Windows RDP</div><div className="text-xs text-muted-foreground">Coming later</div></div></div>
                <div className="mt-5 text-xs"><span className="rounded-full bg-muted px-3 py-1">Multiple regions</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MusicEcosystem/>
    </main>
  );
}
