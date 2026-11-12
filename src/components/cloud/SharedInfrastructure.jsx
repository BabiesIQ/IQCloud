import { Gauge, HardDrive } from 'lucide-react';
export default function SharedInfrastructure({className=''}) {
 return <div className={`grid gap-3 sm:grid-cols-2 ${className}`}>
  <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-5">
   <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400"><Gauge size={19}/> Network speed target</div>
   <p className="mt-3 text-xl font-semibold">Up to 3–5 Gbps</p>
   <p className="mt-2 text-xs leading-5 text-muted-foreground">Best-effort target only; not independently verified or guaranteed. Real transfer speed depends on region, provider limits and congestion.</p>
  </div>
  <div className="rounded-2xl border bg-card p-5">
   <div className="flex items-center gap-2 text-sm font-semibold"><HardDrive size={19} className="text-emerald-500"/> Shared host storage</div>
   <p className="mt-3 text-xl font-semibold">2–30 TB <span className="text-xs font-normal text-muted-foreground">host capacity target</span></p>
   <p className="mt-2 text-xs leading-5 text-muted-foreground">Not a per-VPS SSD allocation or usable disk quota. Host capacity varies (about 2.9 TB observed on one Railway host; 30 TB unverified). Root filesystem is ephemeral; data may be lost during redeploy.</p>
  </div>
 </div>;
}