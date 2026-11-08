import { Link } from 'react-router-dom';
import '@/cloud-motion.css';
import ApperIcon from '@/components/ApperIcon';
import { quoteServer, formatMoney } from '@/components/cloud/CloudUI';

export const route = { path: '/', layout: 'public', access: 'public' };

const features = [
  { icon: 'SlidersHorizontal', title: 'Choose your resources', description: 'Set your CPU, RAM and storage. See the price as you go.' },
  { icon: 'Globe2', title: 'Connect your domain', description: 'Add your website domain and follow simple DNS steps.' },
  { icon: 'LayoutDashboard', title: 'Manage everything', description: 'Keep servers, domains and billing in one place.' },
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto max-w-5xl px-5 pb-20 pt-24 text-center sm:pt-32">
        <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-primary" />
          BabiesIQ Cloud · Preview
        </div>
        <h1 className="mx-auto max-w-4xl text-4xl font-semibold leading-[1.13] tracking-[-0.055em] sm:text-6xl md:text-7xl">
          Your cloud. <span className="text-primary">Made simple.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
          Create a server your way. Pick a region, choose your resources, and manage it all in one simple dashboard.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link to="/configure" className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition hover:opacity-85">
            Create a server <ApperIcon name="ArrowUpRight" size={17} />
          </Link>
          <Link to="/pricing" className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium hover:bg-accent">
            View pricing <ApperIcon name="ArrowRight" size={16} />
          </Link>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">No payment required to explore the demo.</p>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-24">
        <div className="overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center justify-between border-b border-border pb-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><ApperIcon name="Server" size={20} /></span>
              <div className="text-left"><div className="text-sm font-semibold">Your server</div><div className="text-xs text-muted-foreground">A simple setup, in one place</div></div>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary">Preview</span>
          </div>
          <div className="grid gap-3 text-left sm:grid-cols-4">
            {[
              { label: 'Region', value: 'Singapore', icon: 'MapPin' },
              { label: 'System', value: 'Ubuntu 24.04', icon: 'Terminal' },
              { label: 'CPU', value: '2 vCPU', icon: 'Cpu' },
              { label: 'Memory', value: '4 GB', icon: 'MemoryStick' },
            ].map(item => (
              <div key={item.label} className="rounded-2xl border border-border bg-background p-5">
                <ApperIcon name={item.icon} size={19} className="text-primary" />
                <div className="mt-5 text-xs text-muted-foreground">{item.label}</div>
                <div className="mt-1 text-sm font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
            <div><div className="text-xs text-muted-foreground">Estimated monthly price</div><div className="mt-1 text-2xl font-semibold">{formatMoney(quoteServer({cpu:2,ram:4,storage:50,region:'ap-southeast',term:'monthly'}))}<span className="ml-2 text-sm font-normal text-muted-foreground">/ month</span></div></div>
            <Link to="/configure" className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium hover:bg-accent">Customize <ApperIcon name="ArrowRight" size={16}/></Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card/40 px-5 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">Everything in one place.</h2>
          <p className="mt-3 text-center text-sm text-muted-foreground">Simple tools to get your ideas online.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map(item => (
              <div key={item.title} className="rounded-2xl border border-border bg-card p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-muted text-foreground"><ApperIcon name={item.icon} size={20}/></span>
                <h3 className="mt-6 text-base font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
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
              <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">Linux VPS, Windows RDP and multiple regions. Flexible compute and storage, all from one dashboard.</p>
              <p className="mt-3 text-xs text-muted-foreground">1–3 TB SSD options and Windows RDP are planned, not currently available.</p>
              <Link to="/configure" className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background">Explore servers <ApperIcon name="ArrowUpRight" size={16}/></Link>
            </div>
            <div className="relative min-h-[260px] [perspective:900px]">
              <div className="absolute inset-5 rounded-3xl bg-primary/10 blur-2xl" />
              <div className="cloud-float-a absolute left-[5%] top-4 w-[70%] rounded-2xl border border-border bg-background p-5 shadow-xl">
                <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><ApperIcon name="Server" size={21}/></span><div><div className="text-sm font-semibold">Linux VPS</div><div className="text-xs text-muted-foreground">Cloud compute</div></div></div>
                <div className="mt-5 flex gap-2 text-xs"><span className="rounded-full bg-muted px-3 py-1">Ubuntu</span><span className="rounded-full bg-muted px-3 py-1">SSD</span></div>
              </div>
              <div className="cloud-float-b absolute bottom-3 right-0 w-[67%] rounded-2xl border border-border bg-background p-5 shadow-xl">
                <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><ApperIcon name="Monitor" size={21}/></span><div><div className="text-sm font-semibold">Windows RDP</div><div className="text-xs text-muted-foreground">Coming later</div></div></div>
                <div className="mt-5 text-xs"><span className="rounded-full bg-muted px-3 py-1">Multiple regions</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border px-5 py-20 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Ready to get started?</h2>
        <p className="mt-3 text-sm text-muted-foreground">Set up your first server in a few simple steps.</p>
        <Link to="/configure" className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background">Build your server <ApperIcon name="ArrowUpRight" size={17}/></Link>
      </section>
    </main>
  );
}
