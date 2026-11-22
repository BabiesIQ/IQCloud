import { useEffect, useState } from 'react';
import {useLocale} from '@/i18n/LocaleProvider';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Cpu, LockKeyhole, MapPin, MemoryStick, Server } from 'lucide-react';
import { apiRequest } from '@/services/apiClient';
import { computePrice, computeInternationalPrice, isRecommended, termQuoteFromMonthlyPrice, billingTerm } from '@/config/plans';
import BillingTermPicker from '@/components/cloud/BillingTermPicker';
import SharedInfrastructure from '@/components/cloud/SharedInfrastructure';

const regions=[['us-west','US West'],['us-east','US East'],['eu-west','Europe West'],['ap-southeast','Asia Pacific']];
function ResourceSlider({title,icon:Icon,value,onChange,min=1,max=24,unit='GB',soon='Up to 24 per resource, prices calculated through 24; higher tiers need verified Pro capacity for checkout'}){
 return <div className="rounded-2xl border bg-card p-5"><div className="flex items-center justify-between"><span className="flex items-center gap-2 font-medium"><Icon size={18} className="text-emerald-500"/>{title}</span><strong>{value} {unit}</strong></div><input type="range" min={min} max={max} step={1} value={value} onChange={e=>onChange(Number(e.target.value))} className="mt-5 w-full accent-emerald-500" aria-label={title}/><div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{min} {unit}</span><span>{max} {unit}</span></div><div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole size={13}/>{soon}</div></div>
}
export const route = { path: '/dashboard/instances/new', layout: 'owner', access: 'authenticated' };
export default function CreateInstance(){
 const {formatPaise,formatMonthly,isInternational,currency,fxStatus,t}=useLocale();
 const navigate=useNavigate();
 const [searchParams]=useSearchParams();
 const [type,setType]=useState('linux');
 const [os,setOs]=useState('ubuntu-24');
 const [ram,setRam]=useState(()=>{const n=Number(searchParams.get('ram'));return Number.isInteger(n)&&n>=1&&n<=24?n:2});
 const [cpu,setCpu]=useState(()=>{const n=Number(searchParams.get('cpu'));return Number.isInteger(n)&&n>=1&&n<=24?n:2});
 const [billingMonths,setBillingMonths]=useState(()=>billingTerm(searchParams.get('billingMonths')).months);
 const proTier=ram>8||cpu>8;
 const [proMonthly,setProMonthly]=useState(null);
 const [proPurchasable,setProPurchasable]=useState(false);
 const monthlyPrice=proTier?(isInternational?computeInternationalPrice(ram,cpu):(proMonthly??computePrice(ram,cpu))):computePrice(ram,cpu);
 const billing=termQuoteFromMonthlyPrice(monthlyPrice,billingMonths);
 const proOrderLocked=proTier&&!proPurchasable;
 const [region,setRegion]=useState('ap-southeast');
 const [rootPassword,setRootPassword]=useState('');
 const [confirmRootPassword,setConfirmRootPassword]=useState('');
 const [showPassword,setShowPassword]=useState(false);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [readiness,setReadiness]=useState(null);
 const [dryRun,setDryRun]=useState(null);
 const [checking,setChecking]=useState(false);
 useEffect(()=>{setDryRun(null)},[ram,cpu,region,os,billingMonths]);
 useEffect(()=>{
  if(!proTier){setProMonthly(null);setProPurchasable(false);return}
  let active=true;
  setProMonthly(null);setProPurchasable(false);
  apiRequest('/api/v1/instances/quote',{method:'POST',body:{ram,cpu,region,os,billingMonths}})
   .then(result=>{if(active){
    if(!isInternational&&Number.isInteger(result?.quote?.monthlyPriceINR)&&result.quote.monthlyPriceINR>0)setProMonthly(result.quote.monthlyPriceINR);
    setProPurchasable(result?.purchasable===true);
   }})
   .catch(()=>{if(active){setProMonthly(null);setProPurchasable(false)}});
  return()=>{active=false};
 },[proTier,ram,cpu,region,os,billingMonths,isInternational]);
 useEffect(()=>{let active=true;apiRequest('/api/v1/payments/readiness').then(data=>{if(active)setReadiness(data)}).catch(()=>{});return()=>{active=false}},[]);
 async function checkProvisioning(){
  setChecking(true);setDryRun(null);setMessage('');
  try{if(rootPassword||confirmRootPassword){await apiRequest('/api/v1/instances/provisioning/validate-password',{method:'POST',body:{password:rootPassword,confirm:confirmRootPassword}})}const result=await apiRequest('/api/v1/instances/provisioning/dry-run',{method:'POST',body:{ram,cpu,region,os}});setDryRun(result)}
  catch(e){setMessage(e.message||'Provisioning check unavailable')}
  finally{setChecking(false)}
 }
 async function request(mode='save'){
  setBusy(true);setMessage('');
  try{
   if(!billing){setMessage('Price is currently unavailable. No draft or payment was created.');return}
   if(proOrderLocked){setMessage('Pro prices are shown for planning. Checkout requires a verified Pro-capacity account; no payment was created.');return}
   if(!rootPassword || rootPassword.length<16 || rootPassword.length>128 || rootPassword!==confirmRootPassword){setMessage('Root password must be 16–128 characters and both fields must match.');return}
   const draft=await apiRequest('/api/v1/instances/drafts',{method:'POST',body:{ram,cpu,region,os,billingMonths,rootPassword,confirmRootPassword}});
   setRootPassword('');setConfirmRootPassword('');
   if(mode==='checkout')navigate('/dashboard/checkout?draftId='+encodeURIComponent(draft.id));
   else navigate('/dashboard');
  }catch(e){setMessage(e.message||'Server creation is not available yet.')}
  finally{setBusy(false)}
 }
 return <main className="mx-auto max-w-4xl px-5 py-10 pb-20">
  <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16}/> Dashboard</Link>
  <div className="mt-7"><p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">Cloud configuration</p><h1 className="mt-2 text-3xl font-semibold">Create instance</h1><p className="mt-2 text-sm text-muted-foreground">Choose RAM and CPU for your Linux container. IPv4 and IPv6 networking is available. No dedicated SSD size is sold; storage is ephemeral and transfer speed depends on the servers and network route.</p></div>
  <div className="mt-8 grid grid-cols-2 gap-3">{[['linux','Linux Container'],['windows','Windows RDP']].map(([id,label])=><button key={id} type="button" onClick={()=>setType(id)} className={`rounded-2xl border p-5 text-left text-sm font-semibold ${type===id?'border-emerald-500 bg-emerald-500/5':'bg-card'}`}><Server size={20} className="mb-3 text-emerald-500"/>{label}{id==='windows'&&<span className="mt-2 block text-xs font-normal text-muted-foreground">🔒 Available soon</span>}</button>)}</div>
  {type==='windows'?<div className="mt-6 rounded-2xl border p-6 text-sm">Windows RDP is coming soon. Windows hosting is not available on this BabiesIQ Cloud container setup.</div>:<>
   <div className="mt-6 rounded-2xl border bg-card p-5"><label htmlFor="instance-os" className="text-sm font-medium">Operating system</label><select id="instance-os" value={os} onChange={e=>setOs(e.target.value)} className="mt-3 w-full rounded-xl border bg-background p-3"><option value="ubuntu-22">Ubuntu 22.04 LTS</option><option value="ubuntu-24">Ubuntu 24.04 LTS</option><option value="ubuntu-26">Ubuntu 26.04 LTS</option><option value="debian-12">Debian 12</option></select><p className="mt-2 text-xs text-muted-foreground">Images require deployment-template verification before purchase.</p></div>
   <div className="mt-4 grid gap-4 sm:grid-cols-2"><ResourceSlider title="RAM" icon={MemoryStick} value={ram} onChange={setRam}/><ResourceSlider title="CPU" icon={Cpu} value={cpu} onChange={setCpu} unit="vCPU"/></div>
   <button type="button" onClick={()=>{setRam(8);setCpu(4)}} className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-emerald-500/50 bg-emerald-500/5 p-4 text-left text-sm"><span><span className="font-bold text-emerald-600 dark:text-emerald-400">★ Recommended</span><span className="mt-1 block">8 GB RAM · 4 vCPU</span></span><strong>{formatMonthly(350)} /month</strong></button>
   <BillingTermPicker className="mt-6" months={billingMonths} onChange={setBillingMonths} ram={ram} cpu={cpu} monthlyPriceINR={monthlyPrice} disabled={busy}/>
   <SharedInfrastructure className="mt-4"/>
   <div className="mt-4 rounded-2xl border bg-card p-5"><p className="mb-3 flex items-center gap-2 font-medium"><MapPin size={18} className="text-emerald-500"/> Region</p><div className="grid grid-cols-2 gap-2">{regions.map(([id,label])=><button key={id} type="button" onClick={()=>setRegion(id)} className={`rounded-xl border p-3 text-left text-sm ${region===id?'border-emerald-500 bg-emerald-500/5':'hover:bg-muted'}`}>{t(label)}</button>)}</div><p className="mt-3 text-xs text-muted-foreground">Other regions: 🔒 Available soon. Selected region requires provider verification.</p></div>
   <div className="mt-4 rounded-2xl border bg-card p-5"><label htmlFor="root-password" className="text-sm font-semibold">VPS root password</label><p className="mt-2 text-xs text-muted-foreground">Choose a unique password of at least 16 characters with at least three character types. It is securely encrypted with your draft and used automatically after a verified payment.</p><input id="root-password" autoComplete="new-password" type={showPassword?'text':'password'} minLength={16} maxLength={128} value={rootPassword} onChange={e=>setRootPassword(e.target.value)} className="mt-3 w-full rounded-xl border bg-background p-3" placeholder="Enter root password" /><input aria-label="Confirm root password" autoComplete="new-password" type={showPassword?'text':'password'} value={confirmRootPassword} onChange={e=>setConfirmRootPassword(e.target.value)} className="mt-3 w-full rounded-xl border bg-background p-3" placeholder="Confirm root password"/><label className="mt-3 flex items-center gap-2 text-xs"><input type="checkbox" checked={showPassword} onChange={e=>setShowPassword(e.target.checked)}/> Show password</label>{rootPassword&&rootPassword.length<16&&<p role="alert" className="mt-2 text-xs text-amber-600">Minimum 16 characters required.</p>}{confirmRootPassword&&rootPassword!==confirmRootPassword&&<p role="alert" className="mt-2 text-xs text-amber-600">Passwords do not match.</p>}</div>
   <div className="mt-6 rounded-2xl border bg-card p-6"><p className="text-sm text-muted-foreground">Monthly compute price</p><p className="mt-2 text-3xl font-semibold">{billing?formatMonthly(monthlyPrice):'Price unavailable'}<span className="text-sm font-normal text-muted-foreground"> / month</span></p>
    {billing?<div className="mt-4 space-y-2 rounded-xl bg-muted/50 p-4 text-sm">
     <div className="flex justify-between"><span>{formatMonthly(monthlyPrice)} × {billingMonths} {t(billingMonths===1?'month':'months')}</span><span>{formatPaise(billing.subtotalPaise)}</span></div>
     <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400"><span>{t('Discount')} ({billing.discountPercent}%)</span><span>- {formatPaise(billing.discountPaise)}</span></div>
     <div className="flex justify-between border-t pt-3 text-base font-bold"><span>Total payable</span><span>{formatPaise(billing.totalPaise)}</span></div>
    </div>:<p className="mt-4 rounded-xl border border-amber-500/40 p-4 text-sm text-muted-foreground">This Pro capacity option can be previewed, but checkout is locked until provider availability and the monthly price are confirmed. Select an available configuration to continue.</p>}{isRecommended(ram,cpu)&&<span className="mt-2 inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">★ Recommended price</span>}{isInternational&&<p className="mt-3 rounded-xl border border-amber-500/40 p-3 text-xs text-amber-600">{t("International compute prices use the original international rate; India-only discounts do not apply.")} {currency} {t("prices are estimates.")} ({t("Rate status:")} {t(fxStatus)}). {t("PayPal verifies the available currency and exact amount during secure checkout. You can save a draft without paying.")}</p>}<p className="mt-2 text-xs text-muted-foreground">Compute-only monthly price. Shared host filesystem is not an allocated disk quota; transfer speed depends on source and destination servers, routing and traffic. Checkout confirms final payment amount. Three days before expiry, we warn you to renew; the BabiesIQ Cloud deployment is stopped when validity ends. Renew before expiry to avoid restart and ephemeral data loss.</p>{readiness&&<div className="mt-4 rounded-xl border p-3 text-xs text-muted-foreground"><p className="font-semibold text-foreground">Backend integration status</p><p>BabiesIQ Cloud API credentials: {readiness.railwayTokenConfigured?"Configured":"Not configured"}</p><p>Razorpay credentials: {readiness.razorpayKeyConfigured?"Configured":"Not configured"}</p><p>Webhook secret: {readiness.razorpayWebhookConfigured?"Configured":"Not configured"}</p><p>Verified final pricing: {readiness.finalPlanPricingVerified?'Yes':'Pending'}</p><p>Checkout and provisioning: subject to provider and payment readiness</p></div>}{dryRun&&<div role="status" className="mt-4 rounded-xl border p-3 text-xs"><p className="font-semibold">Provisioning preflight: {dryRun.canProvision?'Ready':'Not ready'}</p><p>Configuration: {dryRun.selectionValid?'Valid':'Invalid'}</p><p>BabiesIQ Cloud API authenticated: {dryRun.railwayAPIAuthenticated?'Yes':'Not verified'}</p><p>Region mapped: {dryRun.regionMappedToRailway?'Yes':'Pending'}</p><p>Provider capacity: {dryRun.providerCapacityVerified?'Verified':'Pending'}</p><p>CPU/RAM limits: {dryRun.cpuAndMemoryLimitsVerified?'Verified':'Pending'}</p><p>Network access: {dryRun.networkAccessVerified?'Verified':'Pending'}</p><p>Final price: {dryRun.priceVerified?'Verified':'Pending'}</p><p className="mt-2 text-muted-foreground">No charge and no server created.</p></div>}<button type="button" disabled={checking||busy} onClick={checkProvisioning} className="mt-4 w-full rounded-xl border p-3 text-sm font-semibold disabled:opacity-50">{checking?'Checking…':'Check provisioning readiness'}</button>{message&&<p role="alert" className="mt-4 rounded-xl border border-amber-500/30 p-3 text-sm">{message}</p>}<div className="mt-5 grid grid-cols-2 gap-3"><button type="button" disabled={busy||!billing||proOrderLocked} onClick={()=>request('save')} className="rounded-xl border p-3 font-semibold disabled:opacity-50">{busy?'Processing…':'Save draft'}</button><button type="button" disabled={busy||!billing||proOrderLocked} onClick={()=>request('checkout')} className="rounded-xl bg-primary p-3 font-semibold text-primary-foreground disabled:opacity-50">{busy?'Processing…':'Checkout →'}</button></div><p className="mt-3 text-center text-xs text-muted-foreground">Checkout securely saves the configuration and chosen root password once; you will not enter it again after payment. You can reveal it once after deployment.</p></div>
  </>}
 </main>;
}
