import { Gauge, HardDrive, Globe2 } from 'lucide-react';
export default function SharedInfrastructure({className=''}) {
 return <div className={`grid gap-3 sm:grid-cols-2 ${className}`}>
  <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-5">
   <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400"><Gauge size={19}/> Network performance</div>
   <p className="mt-3 text-xl font-semibold">Variable throughput</p>
   <p className="mt-2 text-xs leading-5 text-muted-foreground">Actual transfer speed depends on the sending and receiving servers, available bandwidth, routing, traffic and congestion. No fixed Mbps or Gbps rate is guaranteed.</p>
  </div>
  <div className="rounded-2xl border bg-card p-5">
   <div className="flex items-center gap-2 text-sm font-semibold"><HardDrive size={19} className="text-emerald-500"/> Shared host storage</div>
   <p className="mt-3 text-xl font-semibold">2–30 TB <span className="text-xs font-normal text-muted-foreground">host capacity target</span></p>
   <p className="mt-2 text-xs leading-5 text-muted-foreground">Not a per-VPS SSD allocation or usable disk quota. Host capacity varies; no specific per-customer storage capacity or persistence is guaranteed. Root filesystem is ephemeral; data may be lost during redeploy.</p>
  </div>
  <div className="rounded-2xl border border-border bg-card p-5 sm:col-span-2">
   <div className="flex items-center gap-2 text-sm font-semibold"><Globe2 size={19} className="text-emerald-500"/> IPv4 / IPv6 supported</div>
   <p className="mt-2 text-lg font-semibold">IPv4 + IPv6 access</p>
   <p className="mt-2 text-xs leading-5 text-muted-foreground">IPv4 and IPv6 connectivity is available. For SSH, use the assigned hostname and port shown in your dashboard. Public IP assignments and inbound routes depend on instance configuration; a dedicated static address is provided only when explicitly assigned.</p>
  </div>
 </div>;
}