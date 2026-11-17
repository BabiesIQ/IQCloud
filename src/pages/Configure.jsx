import { useState } from 'react';
import {useLocale} from '@/i18n/LocaleProvider';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { REGIONS, SYSTEMS, formatMoney, quoteServer } from '@/components/cloud/CloudUI';
import ApperIcon from '@/components/ApperIcon';
import { isRecommended } from '@/config/plans';
import SharedInfrastructure from '@/components/cloud/SharedInfrastructure';

export const route = { path: '/configure', layout: 'public', access: 'authenticated' };

export default function Configure() {
  const {formatMonthly}=useLocale();
  const [name, setName] = useState('my-cloud-server');
  const [region, setRegion] = useState('ap-southeast');
  const [os, setOs] = useState('ubuntu-24');
  const [cpu, setCpu] = useState(2);
  const [ram, setRam] = useState(4);
  const amount = quoteServer({ cpu, ram });
  const ready = name.trim().length >= 3 && /^[a-z0-9-]+$/.test(name.trim());
  const query = new URLSearchParams({ name, region, os, cpu, ram, estimate: amount }).toString();

  return (
    <div className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-13 md:px-8">
        <div className="mb-10">
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-primary">01 / Configure instance</p>
          <h1 className="mt-3 font-heading text-3xl font-bold md:text-4xl">Create your cloud server.</h1>
          <p className="mt-3 text-sm text-muted-foreground">Choose RAM and CPU. This public review is a preview; actual server drafts are created from your dashboard.</p>
        </div>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-md border border-border bg-card p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-md bg-primary/10 font-heading text-sm font-semibold text-primary">01</span>
                <div><h2 className="font-heading text-lg font-bold">Name your server</h2><p className="mt-1 text-xs text-muted-foreground">An easy label for the console.</p></div>
              </div>
              <Label htmlFor="server-name">Server hostname</Label>
              <Input id="server-name" value={name} onChange={(event) => setName(event.target.value.toLowerCase())} placeholder="my-cloud-server" maxLength={40} className="mt-2 max-w-md" />
              {!ready && <p className="mt-2 text-xs text-destructive">Use at least 3 lowercase letters, digits or hyphens.</p>}
            </section>
            <section className="rounded-md border border-border bg-card p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-md bg-primary/10 font-heading text-sm font-semibold text-primary">02</span><h2 className="font-heading text-lg font-bold">Choose a region</h2></div>
              <div className="grid gap-3 sm:grid-cols-2">
                {REGIONS.map((item) => (
                  <button key={item.code} type="button" onClick={() => setRegion(item.code)}
                    className={'flex items-center gap-4 rounded-md border p-4 text-left transition ' + (region===item.code ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent')}>
                    <span className="text-2xl">{item.flag}</span>
                    <span className="flex-1"><span className="block text-sm font-semibold">{item.city}</span><span className="mt-1 block text-xs text-muted-foreground">{item.subtitle}</span></span>
                    {region===item.code && <ApperIcon name="CheckCircle2" size={17} className="text-primary" />}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Region choices are illustrative; BabiesIQ Cloud location availability may change.</p>
            </section>
            <section className="rounded-md border border-border bg-card p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-md bg-primary/10 font-heading text-sm font-semibold text-primary">03</span><h2 className="font-heading text-lg font-bold">Operating system</h2></div>
              <div className="grid gap-3 sm:grid-cols-3">
                {SYSTEMS.map((item) => (
                  <button key={item.id} type="button" onClick={() => setOs(item.id)} className={'rounded-md border p-4 text-left transition ' + (os===item.id ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent')}>
                    <div className="mb-4 flex items-center justify-between text-xl">{item.icon}{os===item.id && <ApperIcon name="CheckCircle2" size={15} className="text-primary" />}</div>
                    <div className="text-sm font-semibold">{item.name}</div>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">OS selection represents container images, not independently virtualized kernels.</p>
            </section>
            <section className="rounded-md border border-border bg-card p-6 md:p-8">
              <div className="mb-7 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-md bg-primary/10 font-heading text-sm font-semibold text-primary">04</span><h2 className="font-heading text-lg font-bold">Hardware specifications</h2></div>
              {[
                { name: 'vCPU', subtitle: 'Requested compute', value: cpu, change: setCpu, min: 1, max: 8, suffix: ' cores', icon: 'Cpu' },
                { name: 'Memory', subtitle: 'Requested RAM', value: ram, change: setRam, min: 1, max: 8, suffix: ' GB', icon: 'MemoryStick' },
              ].map((control) => (
                <div key={control.name} className="mb-8 last:mb-0">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3"><ApperIcon name={control.icon} size={20} className="text-primary" /><div><div className="text-sm font-semibold">{control.name}</div><div className="text-xs text-muted-foreground">{control.subtitle}</div></div></div>
                    <span className="font-heading text-base font-semibold">{control.value}{control.suffix}</span>
                  </div>
                  <Slider value={[control.value]} min={control.min} max={control.max} step={control.step??1} onValueChange={(values) => control.change(values[0])} />
                  <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>{control.min}{control.suffix}</span><span>{control.max}{control.suffix}</span></div>
                </div>
              ))}
              <p className="rounded-md bg-muted p-3 text-xs leading-6 text-muted-foreground">
                RAM and CPU are the only billable resources. Shared host disk has no guaranteed per-customer quota.
              </p>
              <button type="button" className="mt-3 w-full rounded-md border border-primary/40 bg-primary/10 p-3 text-left text-sm" onClick={()=>{setRam(8);setCpu(4)}}><strong>★ Recommended · 8 GB RAM + 4 vCPU · {formatMonthly(350)}/month</strong></button>
              <SharedInfrastructure className="mt-5"/>
            </section>
          </div>
          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-md border border-primary/40 bg-card">
              <div className="border-b border-border bg-primary/10 px-6 py-5"><p className="font-heading text-[11px] uppercase tracking-wider text-primary">Your configuration</p><h2 className="mt-2 font-heading text-xl font-bold">Order summary</h2></div>
              <div className="space-y-5 p-6">
                {[
                  ['Hostname', name || '—'],
                  ['Location', REGIONS.find((x)=>x.code===region)?.city],
                  ['Image', SYSTEMS.find((x)=>x.id===os)?.name],
                  ['vCPU', cpu + ' cores'],
                  ['Memory', ram + ' GB'],
                ].map(([label,value]) => <div key={label} className="flex items-center justify-between gap-3 text-sm"><span className="text-muted-foreground">{label}</span><span className="text-right font-semibold">{value}</span></div>)}
                <div className="border-t border-border pt-5">
                  <p className="text-xs text-muted-foreground">Monthly compute price {isRecommended(ram,cpu)?'· Recommended':''}</p>
                  <div className="mt-1 font-heading text-4xl font-bold">{formatMonthly(amount)}<span className="ml-1 text-sm font-normal text-muted-foreground">/mo</span></div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">Monthly RAM/CPU estimate. Shared storage is ephemeral. Network throughput varies with source server limits, routing, traffic and available bandwidth.</p>
                </div>
                <Button asChild disabled={!ready} size="lg" className="w-full">
                  <Link to={ready ? '/checkout?'+query : '#'}>Continue to review <ApperIcon name="ArrowRight" size={17} /></Link>
                </Button>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><ApperIcon name="ShieldCheck" size={15} /> No payment is collected in the demo</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
