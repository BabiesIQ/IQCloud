import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const icons=["domains","home","dashboard","security","pricing","currency","preferences","documentation","networking","logout"];
assert.equal(icons.length,10);
for(const icon of icons){
 const svg=readFileSync('public/assets/nav/'+icon+'.svg','utf8');
 assert.ok(svg.startsWith('<svg')&&svg.includes('viewBox="0 0 96 96"')&&svg.includes('</svg>'),'Invalid SVG: '+icon);
 assert.ok(svg.includes('linearGradient')&&svg.includes('<path'),'Not a 3D gradient vector: '+icon);
 assert.ok(!/<script\b|<foreignObject\b|<image\b|xlink:href|(?:href|src)\s*=\s*["']https?:\/\//i.test(svg),'SVG must not include external assets: '+icon);
}
const nav=readFileSync('src/components/NavIcon.jsx','utf8');
for(const icon of icons)assert.ok(nav.includes('"'+icon+'"'),'Missing icon mapping: '+icon);
const app=readFileSync('src/App.jsx','utf8');
for(const icon of icons)assert.ok(app.includes(icon),'Icon is not used: '+icon);
assert.ok(app.includes('<NavIcon name={item.icon}'),'Menu must use the shared component');
assert.ok(readFileSync('src/pages/Home.jsx','utf8').includes('<NavIcon'),'Home must match');
assert.ok(readFileSync('src/pages/Dashboard.jsx','utf8').includes('<NavIcon'),'Dashboard must match');
console.log('Navigation icon QA: 10 vector assets and shared sidebar, home and dashboard placements passed.');
