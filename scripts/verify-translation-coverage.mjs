import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {translateUI} from '../src/i18n/translations.js';

const required={
 'src/pages/Home.jsx':[
  'Your cloud.','Made simple.','Create a server your way. Pick a region, choose your resources, and manage it all in one simple dashboard.',
  'Create a server','View pricing','Choose your billing period','Everything in one place.',
  'Ready to get started?','Build your server','Connect your domain',
 ],
 'src/pages/Pricing.jsx':[
  'Choose RAM and CPU. See your price.','Monthly compute price','Complete RAM × CPU price list','Configure instance',
 ],
 'src/pages/CreateInstance.jsx':[
  'Cloud configuration','Operating system','VPS root password','Passwords do not match.','Total payable',
 ],
 'src/pages/ServerCheckout.jsx':[
  'Secure checkout','Loading your configuration…','Total payable','Railway root storage is ephemeral. Expiry followed by redeployment may erase data. Back up important files and renew before expiry.',
 ],
 'src/pages/Dashboard.jsx':[
  'Cloud workspace','Your infrastructure and account, in one place.','Active servers','Saved drafts','Recent activity',
 ],
 'src/pages/Domains.jsx':[
  'Select a VPS, enter the HTTP port your website uses, then connect your own domain and verify its DNS records.','Your VPS','Loading your servers…'
 ],
 'src/pages/DomainManager.jsx':[
  'Website port','Your custom domain','Invalid hostname. Enter a public domain, not a URL or port.','DNS records to add',
 ],
 'src/pages/CustomPorts.jsx':[
  'Outbound networking','Manage public HTTP application ports separately from your protected SSH connection. Outbound traffic has different provider-level limits.'
 ],
 'src/pages/SecurityCenter.jsx':['Account security','Your devices','Active sessions'],
 'src/pages/Notifications.jsx':['Activity & security','Notifications','Account activity will appear here.'],
 'src/components/ServerActions.jsx':['Server controls','Pause','Delete permanently','Permanently delete this service?'],
 'src/components/ServerCredentials.jsx':['SSH connection','Copy SSH command','Reset password'],
 'src/components/cloud/SharedInfrastructure.jsx':['Network speed target','Shared host storage','IPv4 / IPv6 connectivity'],
 'src/pages/CurrencyPage.jsx':['Choose the country used to preview local prices. Your browser language and billing residence are separate settings.','Billing duration','Example compute prices'],
 'src/App.jsx':['Log in','All my VPS domains','Sign in to manage your domains','Notifications','Preferences'],
};
let checked=0;
for(const [page,phrases] of Object.entries(required)){
 const source=readFileSync(page,'utf8');
 for(const phrase of phrases){
  assert.ok(source.includes(phrase),'Missing source UI phrase '+page+' / '+phrase);
  const translated=translateUI(phrase,'hi');
  assert.notEqual(translated,phrase,'Missing Hindi translation '+page+' / '+phrase);
  checked++;
 }
}
for(const lang of ['es','fr','de','pt','ar','bn','ru','zh','ja','ko','it','tr','id']){
 assert.notEqual(translateUI('Your cloud.',lang),'Your cloud.','Hero title not localized: '+lang);
 assert.notEqual(translateUI('Made simple.',lang),'Made simple.','Hero subtitle not localized: '+lang);
}
assert.equal(translateUI('BabiesIQ Cloud','hi'),'BabiesIQ Cloud','Brand must stay unchanged');
assert.equal(translateUI('Apple','hi'),'सेब','Natural-language dictionary regression');
console.log('Site i18n QA: '+checked+' visible Hindi labels/long descriptions across '+Object.keys(required).length+' core pages plus 13 other languages hero strings verified.');
