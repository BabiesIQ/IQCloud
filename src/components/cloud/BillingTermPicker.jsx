import { BILLING_TERMS, priceINR, termQuote } from '@/config/plans';
import {useLocale} from '@/i18n/LocaleProvider';

// An accessible, responsive term chooser. All amounts are previews;
// backend recalculates the authoritative amount before Razorpay checkout.
export default function BillingTermPicker({months,onChange,ram,cpu,disabled=false,className=''}) {
 const {formatPaise,t}=useLocale();
 return <div className={className}>
  <div className="mb-3 flex items-center justify-between gap-2">
   <h3 className="font-semibold">Choose your validity</h3>
   <span className="text-xs text-muted-foreground">Save up to 30%</span>
  </div>
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
   {BILLING_TERMS.map(term=>{
    const quote=termQuote(ram,cpu,term.months);
    const selected=Number(months)===term.months;
    return <button key={term.months} type="button" aria-pressed={selected}
      disabled={disabled} onClick={()=>onChange(term.months)}
      className={`relative rounded-xl border p-3 text-left transition disabled:opacity-50 ${selected?'border-emerald-500 bg-emerald-500/10 shadow-sm':'border-border bg-card hover:border-emerald-400'}`}>
      {term.discountPercent>0&&<span className="absolute -top-2 right-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-black">{term.discountPercent}% {t("off")}</span>}
      <span className="block text-sm font-semibold">{t(term.label)}</span>
      <span className="mt-2 block text-sm font-bold">{formatPaise(quote.totalPaise)}</span>
      <span className="mt-1 block text-[11px] text-muted-foreground">{term.discountPercent?formatPaise(quote.discountPaise)+' '+t('saved'):t('No discount')}</span>
    </button>;
   })}
  </div>
 </div>;
}
