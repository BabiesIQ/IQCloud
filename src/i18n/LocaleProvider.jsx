import {createContext,useContext,useEffect,useLayoutEffect,useMemo,useState} from 'react';
import {getPreferences,updatePreferences} from '@/config/runtime.config';
import {RTL_LANGUAGES,currencyForCountry,priceLocale} from '@/i18n/config';
import {translateUI,isKnownTranslationOf,translationCompleteness} from '@/i18n/translations';
import {apiRequest} from '@/services/apiClient';

const Context=createContext(null);
const excluded=new Set(["SCRIPT","STYLE","TEXTAREA","INPUT","CODE","PRE","KBD"]);
const rawText=new WeakMap();
const rawAttrs=new WeakMap();
const knownTranslated=isKnownTranslationOf;

// Compare the actual visible text, not the JSX whitespace around it.
// DOM edits made by a previous locale must never become the new source language.
function isTranslatedVersion(source,current){
 const original=String(source||'').trim();
 const visible=String(current||'').trim();
 return original===visible||knownTranslated(original,visible);
}
function rememberSource(cache,key,current){
 let entry=cache.get(key);
 if(!entry){
  entry={source:current,applied:current};
  cache.set(key,entry);
 }else if(current!==entry.applied&&!isTranslatedVersion(entry.source,current)){
  // React rendered genuinely new text, e.g. an updated price, server state, or label.
  entry.source=current;
 }
 return entry;
}
// All translations are bundled inside the frontend. Never send user content,
// account details, passwords or rendered DOM text to a third-party service.
function installDOMLanguage(language){
 const translate=source=>translateUI(source,language);
 const root=document.getElementById("root");if(!root)return ()=>{};
 function visit(rootNode){
  if(!rootNode)return;
  function text(node){
   const parent=node.parentElement;
   if(!parent||excluded.has(parent.tagName)||parent.closest("[data-no-translate]"))return;
   const current=node.nodeValue||"";
   const record=rememberSource(rawText,node,current);
   const source=record.source;
   const trimmed=source.trim();
   if(trimmed.length<1||trimmed.length>1800){record.applied=current;return}
   const translated=translate(trimmed);
   const expected=translated===trimmed?source:source.replace(trimmed,translated);
   record.applied=expected;
   if(expected!==current)node.nodeValue=expected;
  }
  const walker=document.createTreeWalker(rootNode,NodeFilter.SHOW_TEXT);
  while(walker.nextNode())text(walker.currentNode);
  if(rootNode instanceof Element){
   for(const el of [rootNode,...rootNode.querySelectorAll("[placeholder],[title],[aria-label]")]){
    if((excluded.has(el.tagName)&&el.tagName!=="INPUT"&&el.tagName!=="TEXTAREA")||el.closest("[data-no-translate]"))continue;
    let originals=rawAttrs.get(el);if(!originals){originals={};rawAttrs.set(el,originals)}
    for(const key of ["placeholder","title","aria-label"]){
     const value=el.getAttribute(key);if(value==null)continue;
     let record=originals[key];
     if(!record){record={source:value,applied:value};originals[key]=record}
     else if(value!==record.applied&&!isTranslatedVersion(record.source,value))record.source=value;
     const target=translate(record.source);
     record.applied=target;
     if(target!==value)el.setAttribute(key,target);
    }
   }
  }
 }
 visit(root);
 let scheduled=false;
 let disposed=false;
 let frame=0;
 const observer=new MutationObserver(()=>{
  if(disposed||scheduled)return;
  scheduled=true;
  frame=requestAnimationFrame(()=>{
   scheduled=false;
   if(!disposed)visit(root);
  });
 });
 observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["placeholder","title","aria-label"]});
 return ()=>{
  disposed=true;
  observer.disconnect();
  if(frame)cancelAnimationFrame(frame);
 };
}
export function LocaleProvider({children}){
 const [preferences,setPreferences]=useState(getPreferences);
 const [fx,setFX]=useState(null);
 useEffect(()=>{
  // The current-tab custom event already contains the updated preferences.
  // Reading localStorage again could return stale values or fail in restricted browsers.
  const sync=event=>setPreferences(event?.type==="iqcloud:preferences"&&event.detail?event.detail:getPreferences());
  addEventListener("iqcloud:preferences",sync);addEventListener("storage",sync);
  return()=>{removeEventListener("iqcloud:preferences",sync);removeEventListener("storage",sync)};
 },[]);
 useLayoutEffect(()=>{
  document.documentElement.lang=preferences.language;
  document.documentElement.dir=RTL_LANGUAGES.has(preferences.language)?"rtl":"ltr";
  return installDOMLanguage(preferences.language);
 },[preferences.language]);
 useEffect(()=>{
  let active=true;
  setFX(null);
  if(preferences.country==="IN"){setFX({rate:1,currency:"INR",status:"native"});return()=>{active=false}};
  const path="/api/v1/pricing/international?country="+encodeURIComponent(preferences.country)+"&ram=1&cpu=1&months=1";
  apiRequest(path).then(reply=>{if(active)setFX({country:preferences.country,rate:Number(reply.fxRate)||0,currency:reply.currency,status:reply.fxStatus,at:reply.fxUpdatedAt})}).catch(()=>{if(active)setFX({country:preferences.country,rate:0,currency:currencyForCountry(preferences.country),status:"unavailable"})});
  return()=>{active=false};
 },[preferences.country]);
 const values=useMemo(()=>{
  const country=preferences.country,language=preferences.language;
  // A pending request for the previous country must not keep its currency or rate on screen.
  const currentFX=fx?.country===country?fx:null;
  const currency=country==="IN"?"INR":currentFX?.currency||currencyForCountry(country);
  const formatINR=paise=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format((Number(paise)||0)/100);
  const formatPaise=paise=>{
   if(country==="IN")return formatINR(paise);
   if(!currentFX?.rate)return currency+" · FX pending ("+formatINR((Number(paise)||0)*2)+" base)";
   try{return "≈"+new Intl.NumberFormat(priceLocale(language,country),{style:"currency",currency,maximumFractionDigits:2}).format((Number(paise)||0)/100*2*currentFX.rate)}
   catch{return currency+" · FX unavailable ("+formatINR((Number(paise)||0)*2)+" base)"}
  };
  return {...preferences,language,country,currency,isInternational:country!=="IN",catalogStatus:translationCompleteness(language),
   fxStatus:country==="IN"?"native":currentFX?.status||"loading",fxUpdatedAt:currentFX?.at,
   t:english=>translateUI(english,language),formatPaise,formatINR,
   formatMonthly:rupees=>formatPaise((Number(rupees)||0)*100),
   setLanguage:value=>{const next=updatePreferences({language:value});setPreferences(next);return next},
   setCountry:value=>{const next=updatePreferences({country:value});setPreferences(next);return next},
  };
 },[preferences,fx]);
 return <Context.Provider value={values}>{children}</Context.Provider>;
}
export function useLocale(){
 const context=useContext(Context);
 if(!context)throw Error("LocaleProvider is missing");
 return context;
}
