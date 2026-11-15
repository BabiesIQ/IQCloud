import {useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowLeft,Globe2,ShieldAlert,Wallet,CheckCircle2} from 'lucide-react';
import {useLocale} from '@/i18n/LocaleProvider';
import {CURRENCY_BY_COUNTRY,COUNTRY_OPTIONS,countryName,paypalCurrencyForCountry} from '@/i18n/config';

export default function CurrencyPage(){
 const locale=useLocale();
 const {country,currency,language,formatMonthly,formatPaise,isInternational,fxStatus,fxUpdatedAt,setCountry,t}=locale;
 const [term,setTerm]=useState('1');
 const months=Number(term)||1;
 function showPrice(monthlyINR){return formatPaise(monthlyINR*months*100)}
 return <main className="mx-auto max-w-4xl px-5 pb-24 pt-10">
  <Link to="/pricing" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={17}/> {t('Back')}</Link>
  <div className="mt-6 flex items-center gap-3"><div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500"><Globe2 size={24}/></div><div><p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">International</p><h1 className="text-3xl font-bold">{t('Currency')}</h1><p className="mt-2 text-sm text-muted-foreground">Choose the country used to preview local prices. Your browser language and billing residence are separate settings.</p></div></div>
  <section className="mt-8 space-y-4 rounded-2xl border bg-card p-6">
   <label className="block text-sm font-semibold">{t('Billing country')}
    <select value={country} onChange={e=>setCountry(e.target.value)} className="mt-2 w-full rounded-xl border bg-background px-4 py-3">
     {COUNTRY_OPTIONS.map(code=><option key={code} value={code}>{countryName(code,language)} · {CURRENCY_BY_COUNTRY[code]}</option>)}
    </select>
   </label>
   <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><span>Display currency</span><strong className="text-lg">{currency}</strong></div>
   {isInternational&&<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><span>PayPal checkout currency</span><strong className="text-lg">{paypalCurrencyForCountry(country)}</strong></div>}
   {isInternational&&paypalCurrencyForCountry(country)!==currency&&<p className="text-sm text-amber-600">{t("PayPal does not support the selected display currency for this merchant.")} {currency}. {t("The checkout will clearly show its USD total before approval.")}</p>}
   <p className="text-sm text-muted-foreground">Exchange rates are indicative only. Source: ExchangeRate-API public exchange-rate feed. The final payment currency and total must be confirmed by the gateway.</p>
   <p className="text-sm">{t(isInternational?'International plans are priced at 2× the India compute rate. The existing 0%, 7%, 14% and 30% billing-period discounts remain unchanged.':'India plans use their standard INR compute prices.')}</p>
   <div className="flex items-start gap-2 rounded-xl border p-3 text-xs leading-5 text-muted-foreground"><ShieldAlert size={17} className="shrink-0 text-amber-500"/> {t("Browser language and country selectors do not verify your legal country of residence. PayPal requires eligible international payers and verified capture; you will see the final amount before approval.")}</div>
  </section>
  <section className="mt-6 rounded-2xl border bg-card p-6">
   <h2 className="text-lg font-semibold">Example compute prices</h2>
   <label className="mt-4 block text-sm">Billing duration
    <select value={term} onChange={e=>setTerm(e.target.value)} className="ml-3 rounded-lg border bg-background px-3 py-2">
     <option value="1">1 month</option><option value="3">3 months</option><option value="6">6 months</option><option value="12">12 months</option>
    </select>
   </label>
   <p className="mt-3 text-xs text-muted-foreground">{t("The examples below are before multi-month discounts;")} <Link to="/pricing" className="underline">{t("Pricing")}</Link> {t("shows the exact 7%, 14% and 30% term reductions.")}</p>
   <div className="mt-4 space-y-3">{[{ram:1,cpu:1,inr:49},{ram:2,cpu:2,inr:99},{ram:4,cpu:4,inr:220},{ram:8,cpu:4,inr:350}].map(x=><div key={x.ram} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-4"><span>{x.ram} GB RAM · {x.cpu} vCPU</span><strong>{showPrice(x.inr)}</strong></div>)}</div>
   <p className="mt-4 text-xs text-muted-foreground">{t("Rate status:")} {t(fxStatus)}{fxUpdatedAt?", "+t("published")+" "+new Date(fxUpdatedAt).toLocaleString(language):""}. {t("PayPal checkout availability is verified when you purchase; the final gateway amount is displayed before approval.")}</p>
   <Link to="/pricing" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-500">View all plans →</Link>
  </section>
 </main>;
}
