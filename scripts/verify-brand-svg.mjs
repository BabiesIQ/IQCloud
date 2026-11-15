import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const svg=readFileSync('public/babiesiq-cloud-logo.svg','utf8');
assert.ok(svg.startsWith('<svg ') && svg.includes('viewBox="0 0 512 512"'));
assert.ok(svg.includes('<linearGradient') && svg.includes('<path') && svg.includes('<circle'));
assert.ok(!/<script\b|<foreignObject\b|<image\b|xlink:href|(?:href|src)\s*=\s*["']https?:\/\//i.test(svg), 'Brand SVG must be standalone, native vector shapes with no remote assets');
const component=readFileSync('src/components/BrandLogo.jsx','utf8');
assert.ok(component.includes('/babiesiq-cloud-logo.svg'));
for(const file of ['src/App.jsx','src/pages/Dashboard.jsx','src/pages/Home.jsx','src/components/LanguageSelector.jsx']){
  assert.ok(readFileSync(file,'utf8').includes('<BrandLogo'), 'Missing updated brand icon in '+file);
}
const html=readFileSync('index.html','utf8');
assert.ok(html.includes('type="image/svg+xml" href="/babiesiq-cloud-logo.svg"'), 'Favicon must use the same SVG as the website');
console.log('BabiesIQ brand QA: standalone vector logo, favicon and cross-site brand placements verified.');
