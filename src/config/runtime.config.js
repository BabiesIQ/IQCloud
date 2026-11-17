
import {browserCountry,browserLanguage,canonicalLanguage,LANGUAGE_CODES} from '@/i18n/config';
const DEFAULT_API = 'https://api.cloud.babiesiq.tech';
const KEY = 'iqcloud:preferences:v1';
const defaults = Object.freeze({ theme: 'system', apiBaseUrl: DEFAULT_API });
const safeTheme = theme => ['light','dark','system'].includes(theme)?theme:"system";
const safeCountry = input => /^[A-Z]{2}$/.test(String(input||""))?String(input):browserCountry();

export function getPreferences(){
 let saved={};
 try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}
 return {
  theme:safeTheme(saved.theme),
  language:canonicalLanguage(saved.language||browserLanguage()),
  country:safeCountry(saved.country),
  apiBaseUrl:DEFAULT_API,
 };
}
export function updatePreferences(patch={}){
 const current=getPreferences();
 const next={
  theme:safeTheme(patch.theme??current.theme),
  language:canonicalLanguage(patch.language??current.language),
  country:safeCountry(patch.country??current.country),
  apiBaseUrl:DEFAULT_API,
 };
 if(patch.language!=null&&!LANGUAGE_CODES.includes(patch.language))throw Error("Unsupported language");
 if(patch.country!=null&&!/^[A-Z]{2}$/.test(patch.country))throw Error("Invalid billing country");
 try{localStorage.setItem(KEY,JSON.stringify(next))}catch{}
 window.dispatchEvent(new CustomEvent('iqcloud:preferences',{detail:next}));
 return next;
}
export const APP_RUNTIME_DEFAULTS=Object.freeze({...defaults,language:'en',country:'IN'});
