import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LANGUAGE_CODES,canonicalLanguage,priceLocale} from '../src/i18n/config.js';
import {translateUI,translationCompleteness,UI_DICTIONARIES,PROTECTED_BRANDS} from '../src/i18n/translations.js';

assert.equal(LANGUAGE_CODES.length,60,'The language selector must contain 60 distinct languages');
assert.equal(new Set(LANGUAGE_CODES).size,60);
for(const language of LANGUAGE_CODES){
 if(language==='en')continue;
 const dict=UI_DICTIONARIES[language];
 assert.ok(dict&&typeof dict==='object','Missing offline dictionary: '+language);
 for(const key of ['Home','Pricing','Create server','Log out','Refresh']){
  assert.ok(typeof dict[key]==='string'&&dict[key].length>0,'Missing essential translation: '+language+' / '+key);
 }
 assert.equal(translationCompleteness(language),'partial','Incomplete languages must never claim complete review');
 for(const [source,target] of Object.entries(dict)){
  assert.ok(source.trim()&&target.trim(),'Blank localized text '+language);
  assert.ok(!/<[^>]*>/.test(target),'HTML markup inside translation '+language+' '+source);
  for(const brand of PROTECTED_BRANDS){
   if(source.includes(brand))assert.ok(target.includes(brand),'Brand changed in '+language+' for '+source);
  }
 }
}
assert.equal(canonicalLanguage('zh-Hant-TW'),'zh-TW');
assert.equal(canonicalLanguage('zh-HK'),'zh-TW');
assert.equal(canonicalLanguage('zh-Hans-CN'),'zh');
assert.equal(priceLocale('zh-TW','TW'),'zh-Hant-TW');
assert.equal(translateUI('Apple','hi'),'सेब');
assert.equal(translateUI('BabiesIQ Cloud','zh-TW'),'BabiesIQ Cloud');
assert.equal(translateUI('Home','zh-TW'),'首頁');
assert.notEqual(translateUI('Home','zh'),'首頁','Simplified and Traditional Chinese must not share one dictionary');
assert.equal(translateUI('0.0.0.0:3000','zh-TW'),'0.0.0.0:3000','Technical addresses must never be translated');
assert.equal(translateUI('user@example.com','zh-TW'),'user@example.com','User data must never be translated');

const mustTranslate={
 'src/pages/Home.jsx':[
  'Create a server your way. Pick a region, choose your resources, and manage it all in one simple dashboard.',
  'Everything in one place.','Secure checkout','More ways to host.',
 ],
 'src/pages/Pricing.jsx':[
  '64 compute combinations. No SSD selector or per-plan disk size; Railway containers use shared, ephemeral host storage.',
  'Compute-only price. Shared host capacity is not customer storage allocation. Container data is ephemeral. Validity starts once your server is SSH-ready; a warning is sent 3 days before expiry and the service stops when billing ends. Renewal requires a new verified payment; prices are not recurring auto-debits.',
  'Higher capacity coming soon','Complete RAM × CPU price list',
 ],
 'src/pages/CreateInstance.jsx':[
  'Cloud configuration','Operating system','VPS root password','Minimum 16 characters required.',
  'Total payable','Checkout and provisioning: subject to provider and payment readiness',
 ],
 'src/pages/ServerCheckout.jsx':[
  'Secure checkout','Loading your configuration…',
  'Railway root storage is ephemeral. Expiry followed by redeployment may erase data. Back up important files and renew before expiry.',
  'The backend verifies the exact amount and gateway capture. Never pay twice for the same order.',
 ],
 'src/pages/Dashboard.jsx':[
  'Your infrastructure and account, in one place.',
  'Active servers','Your instances','No provisioned instances yet.','Quick access','Recent activity',
 ],
 'src/pages/DomainManager.jsx':[
  'Domain management','Connected & pending domains','DNS records to add',
  'Add every required DNS record, then tap Refresh status. DNS propagation can take time.',
 ],
 'src/pages/CustomPorts.jsx':[
  'Server networking','Custom ports','Outbound networking',
  'Outgoing connections are normally permitted by Railway without opening a port in this panel. This tab does not list traffic history or add egress firewall rules.',
 ],
 'src/pages/SecurityCenter.jsx':[
  'Account security','Your devices','Review where your BabiesIQ Cloud account is signed in.',
  'Loading your sessions…',
 ],
 'src/pages/Notifications.jsx':['Activity & security','Account activity will appear here.'],
 'src/pages/CurrencyPage.jsx':[
  'Exchange rates are indicative only. Source: ExchangeRate-API public exchange-rate feed. The final payment currency and total must be confirmed by the gateway.',
  'Example compute prices','Billing duration',
 ],
 'src/pages/Docs.jsx':[
  'BabiesIQ Cloud documentation','Getting started','SSH and remote access',
  'Typical custom-domain workflow',
 ],
 'src/components/ServerActions.jsx':[
  'Server controls','Delete permanently',
  'No automatic refund is issued for unused subscription time when you delete a service. Any refund rights under applicable law or the published refund policy still apply. Save all data before proceeding.',
 ],
 'src/components/cloud/BillingTermPicker.jsx':['Choose your validity','Save up to 30%'],
 'src/components/CloudPreferences.jsx':['Language','Appearance'],
};
let count=0;
for(const [file,phrases] of Object.entries(mustTranslate)){
 const source=readFileSync(file,'utf8');
 for(const phrase of phrases){
  assert.ok(source.includes(phrase),'Source UI moved; update translation audit: '+file+' / '+phrase);
  assert.notEqual(translateUI(phrase,'zh-TW'),phrase,'Traditional Chinese missing: '+file+' / '+phrase);
  count++;
 }
}
const provider=readFileSync('src/i18n/LocaleProvider.jsx','utf8');
assert.ok(!provider.includes('/api/v1/localization/catalog/'),'Website must never request a translation server');
assert.ok(!provider.includes('remoteCatalog'),'Website translations must be bundled locally');
assert.ok(!provider.includes('Azure')&&!provider.includes('AZURE_'),'No Azure translation');
console.log('Offline i18n QA: 60 locale dictionaries, '+count+' high-value Traditional Chinese strings across '+Object.keys(mustTranslate).length+' pages, brand/data safety and no translation API requests passed.');
console.log('Quality notice: not every public paragraph is translated or linguistically reviewed in all 60 languages. English fallback is intentional.');
