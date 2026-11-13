import assert from 'node:assert/strict';
import {LANGUAGE_CODES,LANGUAGES,CURRENCY_BY_COUNTRY,browserLanguage,browserCountry,canonicalLanguage,currencyForCountry,priceLocale} from '../src/i18n/config.js';
import {UI_DICTIONARIES,translateUI,isKnownTranslationOf} from '../src/i18n/translations.js';
import {termQuote,computePrice} from '../src/config/plans.js';

assert.equal(LANGUAGE_CODES.length,60,'Exactly 60 language choices must be present');
assert.equal(new Set(LANGUAGE_CODES).size,60,'Language codes must be unique');
assert.equal(LANGUAGES.length,60,'All language choices must have display labels');
for(const language of LANGUAGES){
 assert.ok(language.nativeName&&language.nativeName.length>=2,'Missing native name: '+language.code);
 assert.equal(canonicalLanguage(language.code),language.code,'Unsupported tag: '+language.code);
 assert.ok(language.region?.length===2,'Missing default country: '+language.code);
 new Intl.NumberFormat(priceLocale(language.code,language.region)).format(12345.67);
}
for(const [country,currency] of Object.entries(CURRENCY_BY_COUNTRY)){
 assert.match(country,/^[A-Z]{2}$/);
 assert.match(currency,/^[A-Z]{3}$/);
 new Intl.NumberFormat('en',{style:'currency',currency}).format(1.99);
}
assert.equal(currencyForCountry('IN'),'INR');
assert.equal(currencyForCountry('US'),'USD');
assert.equal(currencyForCountry('GB'),'GBP');
assert.equal(currencyForCountry('ZZ'),'USD');
assert.equal(priceLocale('fr-CA','CA'),'fr-CA');
assert.equal(translateUI('Apple','hi'),'सेब');
assert.equal(translateUI('BabiesIQ Cloud','hi'),'BabiesIQ Cloud');
assert.equal(translateUI('Railway','hi'),'Railway');
assert.equal(isKnownTranslationOf('Home','Inicio'),true);
for(const [lang,dict] of Object.entries(UI_DICTIONARIES)){
 assert.ok(LANGUAGE_CODES.includes(lang),'No phantom language dictionary: '+lang);
 for(const [source,target] of Object.entries(dict)){
  assert.ok(source.trim()&&target.trim(),'Empty localization: '+lang+' / '+source);
  for(const brand of ['BabiesIQ','Railway','Razorpay','PayPal','Cloudflare','Ubuntu','Debian']){
   if(source.includes(brand))assert.ok(target.includes(brand),'Brand must remain unchanged: '+lang+' / '+source);
  }
  assert.ok(!/[<>]/.test(target),'Translated UI must not contain markup: '+lang+' / '+source);
 }
}
for(const months of [1,3,6,12]){
 const q=termQuote(4,4,months);
 assert.ok(q.totalPaise>0);
 assert.equal(q.totalPaise*2,q.subtotalPaise*2-q.discountPaise*2,'International 2x must keep the term discount');
}
console.log('Localization QA: 60 language choices, '+Object.keys(CURRENCY_BY_COUNTRY).length+' currencies/countries, '+Object.keys(UI_DICTIONARIES).length+' reviewed (partial) dictionaries, brand invariance and pricing arithmetic verified.');
console.log('Warning: this DOES NOT mean all 60 language catalogs are fully translated or human reviewed.');
