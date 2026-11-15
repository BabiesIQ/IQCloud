import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {translateUI} from '../src/i18n/translations.js';
const checks={
 'src/pages/Home.jsx':['Your cloud.','Made simple.','Create a server your way. Pick a region, choose your resources, and manage it all in one simple dashboard.','Create a server','View pricing','Secure checkout','Everything in one place.','Ready to get started?','Build your server','Connect your domain'],
 'src/pages/Pricing.jsx':['Choose RAM and CPU. See your price.','Monthly compute price','Complete RAM × CPU price list','Configure instance'],
 'src/pages/CreateInstance.jsx':['Cloud configuration','Operating system','VPS root password','Passwords do not match.','Total payable'],
 'src/pages/ServerCheckout.jsx':['Secure checkout','Loading your configuration…','Total payable','Railway root storage is ephemeral. Expiry followed by redeployment may erase data. Back up important files and renew before expiry.'],
 'src/pages/Dashboard.jsx':['Cloud workspace','Your infrastructure and account, in one place.','Active servers','Saved drafts','Recent activity'],
 'src/pages/Domains.jsx':['Select a VPS, enter the HTTP port your website uses, then connect your own domain and verify its DNS records.','Your VPS','Loading your servers…'],
 'src/pages/DomainManager.jsx':['Website port','Your custom domain','Invalid hostname. Enter a public domain, not a URL or port.','DNS records to add'],
 'src/pages/CustomPorts.jsx':['Outbound networking','Manage public HTTP application ports separately from your protected SSH connection. Outbound traffic has different provider-level limits.'],
 'src/pages/SecurityCenter.jsx':['Account security','Your devices','Active sessions'],
 'src/pages/Notifications.jsx':['Activity & security','Notifications','Account activity will appear here.'],
 'src/components/ServerActions.jsx':['Server controls','Pause','Delete permanently','Permanently delete this service?'],
 'src/components/ServerCredentials.jsx':['SSH connection','Copy SSH command','Reset password'],
 'src/components/cloud/SharedInfrastructure.jsx':['Network speed target','Shared host storage','IPv4 / IPv6 connectivity'],
 'src/pages/CurrencyPage.jsx':['Choose the country used to preview local prices. Your browser language and billing residence are separate settings.','Billing duration','Example compute prices'],
 'src/App.jsx':['Log in','All my VPS domains','Sign in to manage your domains','Notifications','Preferences']
};
let verified=0;
for(const [page,phrases] of Object.entries(checks)){
 const code=readFileSync(page,'utf8');
 for(const phrase of phrases){
  assert.ok(code.includes(phrase),'Source text missing: '+page+' / '+phrase);
  assert.notEqual(translateUI(phrase,'hi'),phrase,'Hindi translation missing: '+page+' / '+phrase);
  verified++;
 }
}
for(const lang of ['es','fr','de','pt','ar','bn','ru','zh','ja','ko','it','tr','id']){
 for(const phrase of ['Your cloud.','Made simple.']){
  assert.notEqual(translateUI(phrase,lang),phrase,'Hero translation missing: '+lang+' / '+phrase);
 }
}
assert.equal(translateUI('BabiesIQ Cloud','hi'),'BabiesIQ Cloud');
assert.equal(translateUI('Apple','hi'),'सेब');
console.log('Core page translation QA passed: '+verified+' Hindi phrases across '+Object.keys(checks).length+' pages and 13 additional hero locales.');
