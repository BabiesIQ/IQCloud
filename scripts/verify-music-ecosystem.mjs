import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {translateUI} from '../src/i18n/translations.js';

const home=readFileSync('src/pages/Home.jsx','utf8');
const panel=readFileSync('src/components/MusicEcosystem.jsx','utf8');
const logo=readFileSync('public/assets/brands/babiesiq-music-api.svg','utf8');
assert.ok(home.includes('<MusicEcosystem/>'),'Music ecosystem must be on home');
assert.ok(!home.includes('Ready to get started?')&&!home.includes('Set up your first server in a few simple steps.'),'Old CTA section must be removed');
for(const [name,url] of [['Music API','https://babiesiq.tech'],['Instagram','https://www.instagram.com/babiesiq.tech/'],['GitHub','https://github.com/BabiesIQ'],['Telegram','https://t.me/babiesiq']]){
 assert.ok(panel.includes(url),'Missing exact destination: '+name);
}
assert.ok(panel.includes('rel="noopener noreferrer"'),'External links must be safe');
assert.ok(panel.includes('socialLinks.map'),'Social links must share one component layout');
assert.ok(logo.includes('baby mascot with headphones')&&logo.includes('music-note hair curl'),'Music icon must show new baby headphone mascot');
assert.ok(panel.includes('baby-headphones-2'),'Use versioned asset to avoid cached old logo');
assert.ok(logo.startsWith('<svg')&&logo.includes('viewBox="0 0 320 320"')&&logo.includes('<linearGradient')&&logo.includes('</svg>'),'Music logo is not a standalone SVG');
assert.ok(!/<script\b|<foreignObject\b|<image\b|xlink:href/i.test(logo),'Music logo must not load embedded or external content');
assert.ok(panel.includes('prefers-reduced-motion')||readFileSync('src/cloud-motion.css','utf8').includes('.iq-music-eq'),'Music animation should have motion styling');
assert.notEqual(translateUI('Explore Music API','hi'),'Explore Music API','Hindi music CTA should be translated');
assert.equal(translateUI('BabiesIQ Cloud','hi'),'BabiesIQ Cloud','Cloud brand must remain unchanged');
console.log('Music API ecosystem QA: new vector logo, actual website and social links, safe targets, localized CTA and removed old section.');
