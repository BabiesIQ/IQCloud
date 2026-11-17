import { useEffect, useRef, useState } from 'react';
import {useLocale} from '@/i18n/LocaleProvider';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, CreditCard, AlertTriangle } from 'lucide-react';
import { apiRequest } from '@/services/apiClient';
import { billingTerm, termQuote, priceINR } from '@/config/plans';
import {paypalCurrencyForCountry,currencyForCountry,formatPayPalMinorAmount,PAYPAL_PRESENTMENT_CURRENCIES} from '@/i18n/config';
import BillingTermPicker from '@/components/cloud/BillingTermPicker';
import PayPalGuestCardButton from '@/components/cloud/PayPalGuestCardButton';

export const route={path:'/dashboard/checkout',layout:'owner',access:'authenticated'};
export default function ServerCheckout(){
 const {formatPaise,formatINR,isInternational,currency,country,fxStatus,t}=useLocale();
 const [params]=useSearchParams();
 const draftId=params.get('draftId')||'';
 const renewInstanceId=params.get('renewInstanceId')||'';
 const isRenewal=Boolean(renewInstanceId);
 const instanceId=isRenewal?renewInstanceId:draftId;
 const navigate=useNavigate();
 const [draft,setDraft]=useState(null);
 const [months,setMonths]=useState(1);
 const [loading,setLoading]=useState(true);
 const [paying,setPaying]=useState(false);
 const [error,setError]=useState('');
 const [order,setOrder]=useState(null);
 const [paymentUncertain,setPaymentUncertain]=useState(false);
 const [riskAcknowledged,setRiskAcknowledged]=useState(false);
 const [paypalStatus,setPayPalStatus]=useState({ready:false,loading:false,reason:'',guestCardEnabled:false,clientId:'',mode:'live'});
 const suggestedPayPalCurrency=paypalCurrencyForCountry(country);
 const actualPayPalCurrency=order?.gateway==="paypal"?order.currency:suggestedPayPalCurrency;
 const localCurrency=currencyForCountry(country);
 const legacyUSDPaymentOrder=order?.gateway==="paypal"&&order.currency==="USD"&&suggestedPayPalCurrency!=="USD";
 const paypalCurrencyFallback=isInternational&&localCurrency!==actualPayPalCurrency&&!legacyUSDPaymentOrder;
 const [paypalReturnProcessing,setPayPalReturnProcessing]=useState(false);
 const paypalReturnClaimed=useRef(false);
 const busy=useRef(false);
 const quote=draft?termQuote(draft.ram,draft.cpu,months):null;
 const displayedQuote=order?.quote||quote;
 useEffect(()=>{
  let active=true;
  if(!/^[a-f0-9]{32}$/.test(instanceId)){
   setLoading(false);setError('Invalid instance configuration');return;
  }
  apiRequest('/api/v1/instances').then(data=>{
   if(!active)return;
   const found=(data.items||[]).find(x=>x._id===instanceId);
   const allowed=isRenewal?['running','expired','resuming','resume_pending'].includes(found?.status)&&!!found?.validUntil:found?.status==='draft';
   if(!allowed)throw Error(isRenewal?'This instance cannot be renewed yet. Open Dashboard for its current status.':'This draft is no longer payable. Check your dashboard before creating another payment.');
   setDraft(found);
   setMonths(isRenewal?1:billingTerm(found.billingMonths).months);
  }).catch(e=>{if(active)setError(e.message||'Instance unavailable')}).finally(()=>{if(active)setLoading(false)});
  return()=>{active=false};
 },[instanceId,isRenewal]);
 useEffect(()=>{
  let live=true;
  if(!isInternational){setPayPalStatus({ready:false,loading:false,reason:''});return()=>{live=false}};
  setPayPalStatus({ready:false,loading:true,reason:''});
  apiRequest('/api/v1/payments/paypal/readiness').then(status=>{
   if(!live)return;
   setPayPalStatus({ready:status.checkoutEnabled===true,loading:false,
    clientId:status.checkoutEnabled&&typeof status.clientId==='string'?status.clientId:'',
    mode:status.mode==='sandbox'?'sandbox':'live',
    guestCardEnabled:status.checkoutEnabled===true&&status.guestCardEnabled===true,
    reason:status.checkoutEnabled?'':'PayPal merchant verification or live gateway activation is still pending. No payment will be taken.'});
  }).catch(()=>{if(live)setPayPalStatus({ready:false,loading:false,reason:'PayPal readiness could not be verified. Checkout is disabled.'})});
  return()=>{live=false};
 },[isInternational]);
 useEffect(()=>{
  if(!isInternational||!draft||loading||paypalReturnClaimed.current)return;
  const returned=params.get('paypalReturn');
  const token=params.get('token')||'';
  const cancelled=params.get('paypalCancelled');
  if(cancelled){paypalReturnClaimed.current=true;setError('PayPal approval was cancelled. No capture was requested. If a charge appears, check your PayPal account before trying again.');return}
  if(returned!=='1')return;
  paypalReturnClaimed.current=true;
  if(!/^[A-Za-z0-9]{10,40}$/.test(token)){
   setError('PayPal returned without a valid order. Check payment status before paying again.');return;
  }
  setPayPalReturnProcessing(true);setPaymentUncertain(true);
  (async()=>{
   try{
    const outcome=await apiRequest('/api/v1/payments/paypal/orders/'+encodeURIComponent(token)+'/capture',{method:'POST',body:{}});
    if(outcome.status==='captured_verified'){navigate('/dashboard',{replace:true});return}
    setError(outcome.message||'PayPal payment status is being verified. Do not pay again.');
   }catch(e){
    setError('Your payment might have succeeded. Do not pay twice. Check this order in PayPal or contact support. '+(e.message||''));
   }finally{setPayPalReturnProcessing(false)}
  })();
 },[isInternational,draft,loading,instanceId]);
 async function payWithPayPal(){
  if(!paypalStatus.ready||!draft||!quote){setError(paypalStatus.reason||'PayPal checkout is not ready.');return}
  if(isRenewal&&draft.status==='expired'&&!riskAcknowledged){
   setError('Please acknowledge that expired VPS containers may lose temporary files before renewing.');return;
  }
  busy.current=true;setPaying(true);setError('');
  try{
   const result=await apiRequest('/api/v1/payments/paypal/orders',{method:'POST',
    body:{draftId:instanceId,billingMonths:months,country,kind:isRenewal?'renewal':'new',paymentMethod:'paypal'}});
   if(!result.orderId||!PAYPAL_PRESENTMENT_CURRENCIES.has(result.currency)||!Number.isInteger(result.amount)||result.amount<1){
    throw Error('PayPal did not confirm a valid supported payment currency and amount. No checkout was opened.');
   }
   if(result.currency!==suggestedPayPalCurrency&&result.currency!=='USD'){
    throw Error('PayPal returned an unexpected currency for your billing country. Check order status before paying.');
   }
   if(result.inrBaseTotalPaise!==quote.totalPaise){
    setOrder(result);
    throw Error('The backend price differs from your preview. Do not approve payment. Verify the total with support.');
   }
   const link=new URL(result.approvalUrl);
   if(link.protocol!=='https:'||!['www.paypal.com','www.sandbox.paypal.com','sandbox.paypal.com'].includes(link.hostname)){
    throw Error('PayPal provided an untrusted checkout URL. No payment was opened.');
   }
   setOrder(result);setPaymentUncertain(true);
   window.location.assign(link.toString());
  }catch(e){setError(e.message||'PayPal checkout unavailable');busy.current=false;setPaying(false)}
 }
 async function pay(){
  if(busy.current||!draft||!quote||paymentUncertain)return;
  if(isInternational){await payWithPayPal();return;}
  if(isRenewal&&draft.status==='expired'&&!riskAcknowledged){
   setError('Please confirm that you understand ephemeral data can be lost when a stopped instance is redeployed.');return;
  }
  busy.current=true;setPaying(true);setError('');
  let modalOpened=false;
  try{
   let checkoutOrder=order;
   if(!checkoutOrder){
    checkoutOrder=isRenewal?
      await apiRequest('/api/v1/instances/'+encodeURIComponent(instanceId)+'/renewal/orders',{method:'POST',body:{billingMonths:months}}):
      await apiRequest('/api/v1/payments/test/orders',{method:'POST',body:{draftId:instanceId,billingMonths:months}});
    setOrder(checkoutOrder);
    if(checkoutOrder.amount!==quote.totalPaise||checkoutOrder.quote?.months!==months){
     setError('The backend price differs from your preview. Review the final gateway total below before continuing.');
     return;
    }
   }
   if(!checkoutOrder.keyId||!checkoutOrder.orderId)throw Error('Payment checkout is not ready');
   if(!window.Razorpay){
    await new Promise((resolve,reject)=>{
     const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';
     script.onload=resolve;script.onerror=()=>reject(Error('Could not load Razorpay checkout'));document.head.appendChild(script);
    });
   }
   const razorpay=new window.Razorpay({
    key:checkoutOrder.keyId,amount:checkoutOrder.amount,currency:checkoutOrder.currency,order_id:checkoutOrder.orderId,
    name:'BabiesIQ Cloud',description:(isRenewal?'Renewal · ':'Instance · ')+months+' month billing',
    handler:async response=>{
     setPaymentUncertain(true);
     try{
      await apiRequest('/api/v1/payments/test/verify',{method:'POST',body:response});
      navigate('/dashboard',{replace:true});
     }catch(e){
      setError('Payment may already have succeeded. Do NOT pay again. Check Dashboard for this order: '+checkoutOrder.orderId+'. '+(e.message||'Verification pending'));
     }finally{busy.current=false;setPaying(false)}
    },
    modal:{ondismiss:()=>{busy.current=false;setPaying(false);setError('If you completed payment, check your Dashboard. Do not pay again without checking order status.');}},
    theme:{color:'#10b981'}
   });
   razorpay.on('payment.failed',response=>{
    setError(response.error?.description||'Payment failed; check Razorpay status before retrying.');
    busy.current=false;setPaying(false);
   });
   razorpay.open();
   modalOpened=true;
  }catch(e){setError(e.message||'Checkout unavailable')}
  finally{if(!modalOpened){busy.current=false;setPaying(false)}}
 }
 return <main className="mx-auto max-w-3xl px-5 py-8 pb-24">
  <Link to={isRenewal?'/dashboard':'/dashboard/instances/new'} className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16}/> Back</Link>
  <p className="mt-7 text-xs font-bold uppercase tracking-widest text-emerald-500">Secure checkout</p>
  <h1 className="mt-2 text-3xl font-semibold">{t(isRenewal?'Renew your instance':'Review and checkout')}</h1>
  <p className="mt-3 text-sm text-muted-foreground">{t(isRenewal?'Renew the SAME VPS without creating a second service. Your existing validity is extended only after captured payment verification.':'Your root password is already encrypted with your draft; it is not required again after checkout.')}</p>
  {loading?<p className="mt-7">Loading your configuration…</p>:draft&&quote?<div className="mt-7 space-y-5">
   <div className="rounded-2xl border bg-card p-6">
    <div className="grid gap-4 sm:grid-cols-2">
     {[['Operating system',draft.os==='debian-12'?'Debian 12':draft.os==='ubuntu-22'?'Ubuntu 22.04 LTS':draft.os==='ubuntu-26'?'Ubuntu 26.04 LTS':'Ubuntu 24.04 LTS'],['RAM',draft.ram+' GB'],['CPU',draft.cpu+' vCPU'],['Region',draft.region],['SSH login','root'],['Storage','Shared ephemeral, no dedicated SSD']].map(([label,value])=><div key={label}><p className="text-xs text-muted-foreground">{t(label)}</p><p className="mt-1 font-semibold">{t(value)}</p></div>)}
    </div>
    {isRenewal&&draft.validUntil&&<p className="mt-4 rounded-xl bg-muted p-3 text-sm">{t('Current validity ends:')} <strong>{new Date(draft.validUntil).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</strong>{t('. Renewals extend from the later of now or the current expiry.')}</p>}
   </div>
   <div className="rounded-2xl border bg-card p-6">
    <BillingTermPicker months={months} onChange={value=>{setMonths(value);setError('')}} ram={draft.ram} cpu={draft.cpu} disabled={Boolean(order)||paying}/>
    {order&&<p className="mt-2 text-xs text-muted-foreground">{t('Your secure order is locked to this billing term. Do not create another order to change validity.')} ({order.gateway==='paypal'?'PayPal':'Razorpay'})</p>}
    <div className="mt-6 space-y-3 rounded-xl bg-muted/50 p-5 text-sm">
     <div className="flex justify-between"><span>{t('Monthly price')} × {displayedQuote.months} {t(displayedQuote.months===1?'month':'months')}</span><span>{(order?formatINR:formatPaise)(displayedQuote.subtotalPaise)}</span></div>
     <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400"><span>{t('Discount')} ({displayedQuote.discountPercent}%)</span><span>- {(order?formatINR:formatPaise)(displayedQuote.discountPaise)}</span></div>
     <div className="flex justify-between border-t pt-3 text-lg font-bold"><span>Total payable</span><span>{(order?formatINR:formatPaise)(displayedQuote.totalPaise)}</span></div>
    </div>
    {isInternational&&<div className="mt-4 rounded-xl border border-amber-500/40 p-4 text-sm text-muted-foreground">
      {t('International compute prices are 2× the India rate with the same discount.')} {currency} {t('prices above are estimates')} ({t('Rate status:')} {t(fxStatus)}).
      <p className="mt-2 font-semibold">{t('PayPal checkout currency')}: {actualPayPalCurrency}{paypalCurrencyFallback?' ('+t('Local currency unavailable; USD fallback')+')':''}.</p>
      {legacyUSDPaymentOrder&&<p className="mt-2 text-amber-600">An existing unpaid order was created in USD before the currency update. Its price and currency are locked. Please check that order before approving or starting another payment; do not pay twice.</p>}
      {order?.gateway==='paypal'&&<p className="mt-2 font-semibold">{t('Final PayPal total:')} {formatPayPalMinorAmount(order.amount,order.currency)} ({order.currency})</p>}
      <p className="mt-2">{paypalStatus.loading?'Checking PayPal availability…':paypalStatus.ready?'PayPal international checkout is available for eligible foreign buyers. Payment will be captured only after your approval.':paypalStatus.reason||'PayPal international checkout is not ready.'}</p>
     </div>}
    <p className="mt-4 text-xs leading-5 text-muted-foreground">Validity starts after SSH-ready for a new VPS. You will receive a warning 3 days before expiry. At expiry, the managed VPS service is stopped. Renewal requires another verified payment; there is no automatic card debit.</p>
    <div className="mt-4 flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-5 text-muted-foreground"><AlertTriangle size={17} className="shrink-0 text-amber-500"/> BabiesIQ Cloud root storage is ephemeral. Expiry followed by redeployment may erase data. Back up important files and renew before expiry.</div>
    {isRenewal&&draft.status==='expired'&&<label className="mt-4 flex items-start gap-2 text-sm"><input className="mt-1" type="checkbox" checked={riskAcknowledged} onChange={e=>setRiskAcknowledged(e.target.checked)}/><span>I understand restarting an expired BabiesIQ Cloud container may lose its files.</span></label>}
    <p className="mt-4 text-xs text-muted-foreground">IPv4 and IPv6 networking is supported. Connect using the assigned SSH hostname and port. Public IP assignments depend on the instance configuration.</p>
    {isInternational?<div className="mt-6 space-y-4">
      <div>
       <h2 className="text-lg font-bold tracking-tight">{t('Choose a payment method')}</h2>
       <p className="mt-1 text-sm text-muted-foreground">{t('Choose the way you would like to pay securely.')}</p>
      </div>
      {paypalStatus.ready&&<PayPalGuestCardButton
       enabled={paypalStatus.guestCardEnabled}
       clientId={paypalStatus.clientId}
       mode={paypalStatus.mode}
       country={country} currency={suggestedPayPalCurrency}
       draftId={instanceId} billingMonths={months} kind={isRenewal?'renewal':'new'}
       totalINRPaise={quote.totalPaise}
       disabled={paying||paymentUncertain||paypalReturnProcessing||loading||(isRenewal&&draft.status==='expired'&&!riskAcknowledged)}
       onOrder={result=>setOrder(result)}
       onCapture={()=>navigate('/dashboard',{replace:true})}
       onFailure={message=>{setPaymentUncertain(true);setError(message)}}
      />}
      <div className="flex items-center gap-3 py-0.5" aria-hidden="true"><span className="h-px flex-1 bg-border"/><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('or')}</span><span className="h-px flex-1 bg-border"/></div>
      <section aria-label={t('Pay with PayPal')} className="rounded-2xl border bg-card p-4 sm:p-5">
       <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
         <h3 className="text-base font-bold tracking-tight sm:text-lg">{t('Pay with PayPal')}</h3>
         <p className="mt-1 text-sm text-muted-foreground">{t('Use your PayPal account or a linked payment method.')}</p>
        </div>
        <span className="inline-flex items-center rounded-lg bg-[#e6f2ff] px-3 py-1.5 text-lg font-black italic tracking-tight text-[#003087]" aria-label="PayPal">PayPal</span>
       </div>
       <button type="button" disabled={paying||paymentUncertain||!paypalStatus.ready||paypalReturnProcessing} onClick={pay} className="mt-4 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#0070ba] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#005c99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0070ba] disabled:cursor-not-allowed disabled:opacity-50">
        {paying?t('Opening PayPal…'):paypalStatus.ready?t('Continue with PayPal')+' · '+actualPayPalCurrency:t('PayPal checkout not yet active')}
       </button>
      </section>
     </div>:<button type="button" disabled={paying||paymentUncertain||paypalReturnProcessing} onClick={pay} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary p-4 font-semibold text-primary-foreground disabled:opacity-50">
      <CreditCard size={18}/>{paying?t('Opening payment…'):paymentUncertain?t('Verify payment in Dashboard'):t('Pay')+' '+(order?formatINR:formatPaise)(displayedQuote.totalPaise)}
     </button>}
    <p className="mt-3 text-center text-xs text-muted-foreground"><ShieldCheck size={13} className="mr-1 inline"/> The backend verifies the exact amount and gateway capture. Never pay twice for the same order.</p>
   </div>
  </div>:null}
  {error&&<p role="alert" className="mt-5 rounded-xl border border-amber-500/40 p-4 text-sm">{error}</p>}
 </main>;
}
