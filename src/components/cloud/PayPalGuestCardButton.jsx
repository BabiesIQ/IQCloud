import {useEffect,useRef,useState} from 'react';
import {apiRequest} from '@/services/apiClient';
import {PAYPAL_PRESENTMENT_CURRENCIES} from '@/i18n/config';
import {useLocale} from '@/i18n/LocaleProvider';



let scriptPromise;
function loadPayPalV6(mode){
 if(window.paypal?.createInstance)return Promise.resolve(window.paypal);
 if(scriptPromise)return scriptPromise;
 scriptPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src=mode==='sandbox'?'https://www.sandbox.paypal.com/web-sdk/v6/core':'https://www.paypal.com/web-sdk/v6/core';
  script.async=true;
  script.onload=()=>window.paypal?.createInstance?resolve(window.paypal):reject(Error('PayPal card service unavailable'));
  script.onerror=()=>reject(Error('PayPal secure card checkout could not load'));
  document.head.appendChild(script);
 }).catch(error=>{scriptPromise=null;throw error});
 return scriptPromise;
}

export default function PayPalGuestCardButton({
 enabled,clientId,mode,country,currency,draftId,billingMonths,kind,
 totalINRPaise,disabled,onOrder,onCapture,onFailure
}){
 const {t}=useLocale();
 const [state,setState]=useState('checking');
 const host=useRef(null),sessionRef=useRef(null),pendingRef=useRef(false),orderRef=useRef('');
 const props=useRef(null);
 props.current={country,currency,draftId,billingMonths,kind,totalINRPaise,disabled,onOrder,onCapture,onFailure};
 useEffect(()=>{
  if(!enabled||!clientId){setState('unavailable');return}
  let active=true;
  setState('checking');
  (async()=>{
   try{
    const paypal=await loadPayPalV6(mode);
    const sdk=await paypal.createInstance({clientId,components:['paypal-guest-payments'],pageType:'checkout'});
    const eligible=await sdk.findEligibleMethods({currencyCode:currency});
    if(!active)return;
    if(!eligible?.isEligible?.('card')){setState('unavailable');return}
    const session=await sdk.createPayPalGuestOneTimePaymentSession({
     onApprove:async ({orderId})=>{
      if(!active)return;
      const expected=orderRef.current;
      if(!expected||orderId!==expected){
       pendingRef.current=true;props.current.onFailure('PayPal returned an unexpected order. No additional charge should be started; contact support.');return;
      }
      try{
       const outcome=await apiRequest('/api/v1/payments/paypal/orders/'+encodeURIComponent(orderId)+'/capture',{method:'POST',body:{}});
       if(outcome.status!=='captured_verified')throw Error('Captured payment still needs verification.');
       props.current.onCapture(outcome);
      }catch(e){
       pendingRef.current=true;
       props.current.onFailure('A card payment may have succeeded. Do not pay twice. Check your Dashboard and the PayPal payment reference. '+(e.message||''));
       throw e;
      }
     },
     onComplete:()=>{pendingRef.current=false},
     onCancel:()=>{
      pendingRef.current=false;
      if(active)setState('eligible');
     },
     onError:()=>{
      if(active){
       pendingRef.current=true;
       props.current.onFailure('Card payment status is uncertain. Check your Dashboard and card statement before trying again.');
      }
     },
     onWarn:()=>{if(active)setState('eligible')},
    });
    if(!active)return;
    sessionRef.current=session;
    setState('eligible');
   }catch{
    if(active){sessionRef.current=null;setState('unavailable')}
   }
  })();
  return()=>{active=false;sessionRef.current=null};
 },[enabled,clientId,mode,currency]);
 useEffect(()=>{
  const button=host.current;
  if(state!=='eligible'||!button)return;
  const click=async()=>{
   if(pendingRef.current||props.current.disabled||!sessionRef.current)return;
   pendingRef.current=true;
   const request=async()=>{
    const current=props.current;
    const result=await apiRequest('/api/v1/payments/paypal/orders',{method:'POST',body:{
     draftId:current.draftId,billingMonths:current.billingMonths,country:current.country,
     kind:current.kind,paymentMethod:'guest_card',
    }});
    if(!result.orderId||result.paymentMethod!=='guest_card'||result.currency!==current.currency||
       !PAYPAL_PRESENTMENT_CURRENCIES.has(result.currency)||result.inrBaseTotalPaise!==current.totalINRPaise){
     throw Error('PayPal card order does not match your VPS quote. No card payment was submitted.');
    }
    orderRef.current=result.orderId;
    current.onOrder(result);
    return {orderId:result.orderId};
   };
   try{
    
    await sessionRef.current.start({presentationMode:'auto',targetElement:button},request());
   }catch(e){
    pendingRef.current=true; 
    props.current.onFailure('Card checkout could not finish. Check the existing order before paying again. '+(e.message||''));
   }
  };
  button.addEventListener('click',click);
  return()=>button.removeEventListener('click',click);
 },[state]);
 
 
 const available=enabled&&state==='eligible';
 return <section aria-label={t('Pay using card')} className={`rounded-2xl border p-4 transition-colors sm:p-5 ${available?'border-emerald-500/35 bg-emerald-500/[0.035]':'border-border bg-muted/20'}`}>
  <div className="flex flex-wrap items-start justify-between gap-3">
   <div className="min-w-0 flex-1">
    <h3 className="text-base font-bold tracking-tight sm:text-lg">{t('Pay using card')}</h3>
    <p className="mt-1 text-sm text-muted-foreground">{t('Pay securely with a debit or credit card.')}</p>
   </div>
   {available&&<div className="flex shrink-0 items-center gap-2" aria-label="Visa and Mastercard">
    <span className="flex h-10 w-[70px] items-center justify-center rounded-lg border border-slate-200 bg-white px-2 shadow-sm">
     <img src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Visa_Inc._logo_%282021%E2%80%93present%29.svg" alt="Visa" width="53" height="18" className="h-[19px] w-[54px] object-contain" loading="lazy"/>
    </span>
    <span className="flex h-10 w-[60px] items-center justify-center rounded-lg border border-slate-200 bg-white px-2 shadow-sm">
     <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="Mastercard" width="39" height="25" className="h-[26px] w-[42px] object-contain" loading="lazy"/>
    </span>
   </div>}
  </div>
  {available?<div className="mt-4 space-y-3">
   <paypal-basic-card-container>
    <paypal-basic-card-button ref={host} aria-label={t('Pay securely by card without a PayPal account')} style={{display:'block',width:'100%',minHeight:'52px',opacity:disabled?0.55:1,pointerEvents:disabled?'none':'auto'}}/>
   </paypal-basic-card-container>
   <p className="text-xs leading-relaxed text-muted-foreground">{t('No PayPal account required. Card details are entered directly in PayPal’s secure form.')}</p>
  </div>:<p className="mt-3 text-xs leading-relaxed text-muted-foreground" role="status">{t(!enabled||state==='unavailable'?'Card payment without a PayPal account is not available for this country or merchant. You can still use PayPal checkout.':'Checking secure debit and credit card availability…')}</p>}
 </section>;
}
