import {createContext,useContext,useEffect,useMemo,useState} from 'react';
import {getPreferences,updatePreferences} from '@/config/runtime.config';
import {RTL_LANGUAGES,currencyForCountry,priceLocale} from '@/i18n/config';
import {translateUI,isKnownTranslationOf,translationCompleteness} from '@/i18n/translations';
import {apiRequest} from '@/services/apiClient';

const Context=createContext(null);
const excluded=new Set(["SCRIPT","STYLE","TEXTAREA","INPUT","CODE","PRE","KBD"]);
const rawText=new WeakMap();
const rawAttrs=new WeakMap();
const knownTranslated=isKnownTranslationOf;
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
   let source=rawText.get(node);
   if(source==null||current!==source&&!knownTranslated(source,current)){source=current;rawText.set(node,source)}
   const trimmed=source.trim();
   if(trimmed.length<1||trimmed.length>1800)return;
   const translated=translate(trimmed);
   const expected=translated===trimmed?source:source.replace(trimmed,translated);
   if(expected!==current)node.nodeValue=expected;
  }
  const walker=document.createTreeWalker(rootNode,NodeFilter.SHOW_TEXT);
  while(walker.nextNode())text(walker.currentNode);
  if(rootNode instanceof Element){
   for(const el of [rootNode,...rootNode.querySelectorAll("[placeholder],[title],[aria-label]")]){
    if((excluded.has(el.tagName)&&el.tagName!=="INPUT"&&el.tagName!=="TEXTAREA")||el.closest("[data-no-translate]"))continue;
    let original=rawAttrs.get(el);if(!original){original={};rawAttrs.set(el,original)}
    for(const key of ["placeholder","title","aria-label"]){
     const value=el.getAttribute(key);if(value==null)continue;
     const saved=original[key];
     if(saved==null||value!==saved&&!knownTranslated(saved,value))original[key]=value;
     const target=translate(original[key]);
     if(target!==value)el.setAttribute(key,target);
    }
   }
  }
 }
 visit(root);
 let scheduled=false;
 const observer=new MutationObserver(()=>{
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;visit(root)});
 });
 observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["placeholder","title","aria-label"]});
 return ()=>observer.disconnect();
}
export function LocaleProvider({children}){
 const [preferences,setPreferences]=useState(getPreferences);
 const [fx,setFX]=useState(null);
 useEffect(()=>{
  const sync=()=>setPreferences(getPreferences());
  addEventListener("iqcloud:preferences",sync);addEventListener("storage",sync);
  return()=>{removeEventListener("iqcloud:preferences",sync);removeEventListener("storage",sync)};
 },[]);
 useEffect(()=>{
  document.documentElement.lang=preferences.language;
  document.documentElement.dir=RTL_LANGUAGES.has(preferences.language)?"rtl":"ltr";
  return installDOMLanguage(preferences.language);
 },[preferences.language]);
 useEffect(()=>{
  let active=true;
  setFX(null);
  if(preferences.country==="IN"){setFX({rate:1,currency:"INR",status:"native"});return()=>{active=false}};
  const path="/api/v1/pricing/international?country="+encodeURIComponent(preferences.country)+"&ram=1&cpu=1&months=1";
  apiRequest(path).then(reply=>{if(active)setFX({rate:Number(reply.fxRate)||0,currency:reply.currency,status:reply.fxStatus,at:reply.fxUpdatedAt})}).catch(()=>{if(active)setFX({rate:0,currency:currencyForCountry(preferences.country),status:"unavailable"})});
  return()=>{active=false};
 },[preferences.country]);
 const values=useMemo(()=>{
  const country=preferences.country,language=preferences.language;
  const currency=country==="IN"?"INR":fx?.currency||currencyForCountry(country);
  const formatINR=paise=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format((Number(paise)||0)/100);
  const formatPaise=paise=>{
   if(country==="IN")return formatINR(paise);
   if(!fx?.rate)return formatINR((Number(paise)||0)*2)+" (FX pending)";
   try{return "≈"+new Intl.NumberFormat(priceLocale(language,country),{style:"currency",currency,maximumFractionDigits:2}).format((Number(paise)||0)/100*2*fx.rate)}
   catch{return formatINR((Number(paise)||0)*2)}
  };
  return {...preferences,language,country,currency,isInternational:country!=="IN",catalogStatus:translationCompleteness(language),
   fxStatus:fx?.status||"loading",fxUpdatedAt:fx?.at,
   t:english=>translateUI(english,language),formatPaise,formatINR,
   formatMonthly:rupees=>formatPaise((Number(rupees)||0)*100),
   setLanguage:value=>updatePreferences({language:value}),
   setCountry:value=>updatePreferences({country:value}),
  };
 },[preferences,fx]);
 return <Context.Provider value={values}>{children}</Context.Provider>;
}
export function useLocale(){
 const context=useContext(Context);
 if(!context)throw Error("LocaleProvider is missing");
 return context;
}
