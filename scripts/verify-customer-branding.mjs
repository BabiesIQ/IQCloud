import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join,relative} from 'node:path';

// Only customer-visible UI, policy pages, and bundled translations are checked.
// Actual backend credentials, infrastructure APIs, DNS host validation and
// provider integration code must NOT be white-labeled at the transport layer.
const roots=['src/pages','src/components','src/layouts','src/i18n'];
const files=[];
function walk(folder){
 for(const entry of readdirSync(folder,{withFileTypes:true})){
  const name=join(folder,entry.name);
  if(entry.isDirectory()){walk(name);continue;}
  if(/\.(jsx|js|json)$/.test(name))files.push(name);
 }
}
for(const folder of roots)walk(folder);
let checked=0;
for(const file of files){
 const source=readFileSync(file,'utf8');
 const technicallyRequiredOnly=source.replace(/\.railway\.app/gi,'.reserved-provider-domain');
 assert.doesNotMatch(technicallyRequiredOnly,/\bRailway\b/i,'Customer UI includes underlying provider name: '+relative('.',file));
 checked++;
}
const domainManager=readFileSync('src/pages/DomainManager.jsx','utf8');
assert.match(domainManager,/\.railway\.app/,'Reject reserved infrastructure domains in custom domain form');
assert.doesNotMatch(domainManager,/docs\.railway\.com/i,'Do not expose third-party hosting admin guides in the customer UI');
const cloud=readFileSync('src/pages/Docs.jsx','utf8');
assert.match(cloud,/vps\.babiesiq\.tech/,'Customer developer docs need the branded SSH host');
const privacy=readFileSync('src/pages/Privacy.jsx','utf8');
assert.match(privacy,/contracted infrastructure processors/,'Privacy policy must acknowledge infrastructure processors');
const terms=readFileSync('src/pages/Terms.jsx','utf8');
assert.match(terms,/ephemeral root storage/,'Storage loss warnings must stay visible');
const client=readFileSync('src/services/apiClient.js','utf8');
assert.match(client,/normalizeVisibleMessages/,'Customer-facing API errors must also be white-labeled');
console.log('Brand audit: '+checked+' UI and translation modules checked; no provider branding exposed. Operational DNS protections and data-loss notices preserved.');
