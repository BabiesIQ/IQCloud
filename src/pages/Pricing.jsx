import { useEffect, useState } from 'react';
import {useLocale} from '@/i18n/LocaleProvider';
import { Link } from 'react-router-dom';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { computePrice, computeInternationalPrice, isRecommended, termQuoteFromMonthlyPrice, MAX_COMPUTE_RAM, MAX_COMPUTE_CPU } from '@/config/plans';
import BillingTermPicker from '@/components/cloud/BillingTermPicker';
import SharedInfrastructure from '@/components/cloud/SharedInfrastructure';
import { apiRequest } from '@/services/apiClient';
export default function Pricing(){
 const {formatPaise,formatMonthly,isInternational,currency,country,fxStatus,t}=useLocale();
 const [ram,setRam]=useState(8),[cpu,setCpu]=useState(4),[months,setMonths]=useState(1);
 const [cpuPage,setCpuPage]=useState(0);
 const visibleCPUs=Array.from({length:8},(_,i)=>cpuPage*8+i+1).filter(n=>n<=MAX_COMPUTE_CPU);
 const previewMonthly=(r,v)=>isInternational?computeInternationalPrice(r,v):computePrice(r,v);
 const proTier=ram>8||cpu>8;
 const [proMonthly,setProMonthly]=useState(null);
 useEffect(()=>{
  if(!proTier){setProMonthly(null);return}
  let active=true;
  setProMonthly(null);
  apiRequest('/api/v1/instances/quote',{method:'POST',body:{ram,cpu,billingMonths:months,region:'ap-southeast',os:'ubuntu-24'}})
   .then(result=>{if(active&&!isInternational&&Number.isInteger(result?.quote?.monthlyPriceINR))setProMonthly(result.quote.monthlyPriceINR)})
   .catch(()=>{if(active)setProMonthly(null)});
  return()=>{active=false};
 },[proTier,ram,cpu,months,isInternational]);
 const referencePrice=isInternational?computeInternationalPrice(ram,cpu):computePrice(ram,cpu);
 const price=proTier&&!isInternational?(proMonthly??referencePrice):referencePrice;
 const quote=termQuoteFromMonthlyPrice(price,months);
 return <main className="mx-auto max-w-5xl px-5 py-12 pb-24">
  <div className="text-center"><p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">BabiesIQ Cloud pricing</p><h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Choose RAM and CPU. See your price.</h1><p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">64 standard priced combinations, plus configurable Pro capacity up to 24 GB RAM and 24 vCPU per container. Pro combinations require verified capacity and a confirmed price. No dedicated SSD quota is sold.</p></div>
  <button type="button" onClick={()=>{setRam(8);setCpu(4)}} className="mt-8 flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/50 bg-emerald-500/5 p-5 text-left">
   <div><span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">★ Recommended</span><p className="mt-3 font-semibold">8 GB RAM + 4 vCPU</p></div><div className="text-2xl font-semibold">{formatMonthly(350)}<span className="text-sm font-normal text-muted-foreground"> /{t("month")}</span></div>
  </button>
  {isInternational&&<p className="mt-5 rounded-xl border border-amber-500/40 p-3 text-sm text-muted-foreground">{t('International pricing uses the original international catalog, without India-only discounts, with the same billing terms.')} {t('Displayed local-currency amounts are estimates.')} {currency} ({t('Rate status:')} {t(fxStatus)}). {t('PayPal confirms the actual payment currency and total before you approve.')}</p>}
  <div className="mt-6 grid gap-4 sm:grid-cols-2">{[['RAM',ram,setRam,'GB'],['CPU',cpu,setCpu,'vCPU']].map(([name,value,change,unit])=><div key={name} className="rounded-2xl border bg-card p-5"><div className="flex items-center justify-between"><label htmlFor={'pricing-'+name} className="font-medium">{name}</label><strong>{value} {unit}</strong></div><input id={'pricing-'+name} type="range" min="1" max="24" step="1" value={value} onChange={e=>change(Number(e.target.value))} className="mt-5 w-full accent-emerald-500"/><div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>1 {unit}</span><span>24 {unit}</span></div><p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground"><LockKeyhole size={12}/> Pro tiers above 8 require provider verification and an approved price</p></div>)}</div>
  <BillingTermPicker className="mt-6" months={months} onChange={setMonths} ram={ram} cpu={cpu} monthlyPriceINR={price} disabled={false}/>
  <SharedInfrastructure className="mt-5"/>
  <div className="mt-5 rounded-2xl border bg-card p-6"><p className="text-sm text-muted-foreground">Monthly compute price</p><p className="mt-2 text-4xl font-semibold">{quote?formatMonthly(price):'Price unavailable'}<span className="text-sm font-normal text-muted-foreground"> / {t("month")}</span></p>
   {quote?<div className="mt-5 space-y-3 rounded-xl bg-muted/50 p-4 text-sm"><div className="flex justify-between"><span>{t("Base")} ({months} {t(months===1?"month":"months")})</span><span>{formatPaise(quote.subtotalPaise)}</span></div><div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400"><span>{t("Discount")} ({quote.discountPercent}%)</span><span>- {formatPaise(quote.discountPaise)}</span></div><div className="flex justify-between border-t pt-3 text-lg font-bold"><span>Total payable</span><span>{formatPaise(quote.totalPaise)}</span></div></div>:<p className="mt-5 rounded-xl border border-amber-500/40 p-4 text-sm text-muted-foreground">This Pro resource combination has no approved checkout price yet. You can review its configuration, but payments stay disabled until capacity and pricing are verified.</p>}<p className="mt-2 text-sm">{ram} GB RAM · {cpu} vCPU {isRecommended(ram,cpu)&&<span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Recommended</span>}</p><p className="mt-3 text-xs leading-5 text-muted-foreground">Compute-only price. Shared host capacity is not customer storage allocation. Container data is ephemeral. Validity starts once your server is SSH-ready; a warning is sent 3 days before expiry and the service stops when billing ends. Renewal requires a new verified payment; prices are not recurring auto-debits.</p><Link to={`/dashboard/instances/new?ram=${ram}&cpu=${cpu}&billingMonths=${months}`} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Configure instance <ArrowRight size={16}/></Link></div>
  <section className="mt-12">
   <div className="flex flex-wrap items-end justify-between gap-3">
    <div>
     <h2 className="text-xl font-semibold">Complete RAM × CPU price list (1–24)</h2>
     <p className="mt-2 text-sm text-muted-foreground">{t("Base monthly compute prices in")} {isInternational?currency+" "+t("(estimated conversion of unchanged international prices)"):"INR"}, {t("before multi-month discounts. Choose a price to update the calculator above.")}</p>
    </div>
    <p className="text-xs text-muted-foreground">{MAX_COMPUTE_RAM} GB RAM × {MAX_COMPUTE_CPU} vCPU · 576 plans</p>
   </div>
   <div role="group" aria-label="Choose CPU column range" className="mt-5 grid grid-cols-3 gap-2">
    {[0,1,2].map(page=><button key={page} type="button" aria-pressed={cpuPage===page} onClick={()=>setCpuPage(page)} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${cpuPage===page?'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400':'bg-card hover:bg-muted'}`}>{page*8+1}–{Math.min((page+1)*8,MAX_COMPUTE_CPU)} vCPU</button>)}
   </div>
   <p className="mt-3 text-xs text-muted-foreground">RAM 1–24 GB is shown vertically. Select the CPU range above or scroll the table sideways on mobile.</p>
   <div className="mt-3 overflow-x-auto rounded-2xl border">
    <table className="w-full min-w-[700px] border-separate border-spacing-0 text-sm">
     <thead><tr>
      <th scope="col" className="sticky left-0 z-20 border-b bg-muted p-3 text-left whitespace-nowrap shadow-[2px_0_0_0_hsl(var(--border))]">RAM / CPU</th>
      {visibleCPUs.map(v=><th scope="col" key={v} className={`border-b bg-muted p-3 text-right whitespace-nowrap ${cpu===v?'text-emerald-600 dark:text-emerald-400':''}`}>{v}C</th>)}
     </tr></thead>
     <tbody>{Array.from({length:MAX_COMPUTE_RAM},(_,i)=>i+1).map(r=><tr key={r}>
      <th scope="row" className={`sticky left-0 z-10 border-b bg-card p-3 text-left font-semibold whitespace-nowrap shadow-[2px_0_0_0_hsl(var(--border))] ${ram===r?'text-emerald-600 dark:text-emerald-400':''}`}>{r} GB</th>
      {visibleCPUs.map(v=>{
       const selected=ram===r&&cpu===v,recommended=isRecommended(r,v);
       return <td key={v} className={`border-b p-0 text-right tabular-nums ${selected?'bg-emerald-500/15':recommended?'bg-emerald-500/5':''}`}>
        <button type="button" onClick={()=>{setRam(r);setCpu(v)}} aria-pressed={selected} aria-label={r+' GB RAM, '+v+' vCPU, '+formatMonthly(previewMonthly(r,v))+' per month'} className={`w-full min-h-12 px-3 py-3 text-right whitespace-nowrap hover:bg-emerald-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 ${selected?'font-bold text-emerald-600 dark:text-emerald-400':recommended?'font-semibold':''}`}>{recommended?'★ ':''}{formatMonthly(previewMonthly(r,v))}</button>
       </td>
      })}
     </tr>)}</tbody>
    </table>
   </div>
   <p className="mt-3 text-xs text-muted-foreground">★ Recommended · Highlighted cell = selected configuration. Prices are monthly before 3/6/12-month discounts. Capacity eligibility is checked separately before payment.</p>
  </section>
  <p className="mt-6 text-xs text-muted-foreground">Windows RDP is planned. Higher Linux capacity is configurable up to 24 GB/24 vCPU, but only explicitly priced and provider-verified combinations can be purchased. Railway Pro does not provide a guaranteed 64 GB/64-core single container.</p>
 </main>;
}
