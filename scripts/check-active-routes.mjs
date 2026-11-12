// The production browser entry imports App.jsx, not src/router/index.jsx.
// Guard against the historical 404 regression where routes were added only to
// the dormant auto-discovery router and the production Shell stayed unchanged.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const main = readFileSync('src/main.jsx', 'utf8');
const activeApp = readFileSync('src/App.jsx', 'utf8');
const createPage = readFileSync('src/pages/CreateInstance.jsx', 'utf8');
const checkoutPage = readFileSync('src/pages/ServerCheckout.jsx', 'utf8');

assert.match(main, /import App from ['"]\\.\\/App['"];/, 'production entrypoint must import App');
assert.match(activeApp, /import CreateInstance from ['"]@\\/pages\\/CreateInstance['"];/, 'CreateInstance must be imported by active App');
assert.match(activeApp, /import ServerCheckout from ['"]@\\/pages\\/ServerCheckout['"];/, 'ServerCheckout must be imported by active App');
for (const [path, element] of Object.entries({
  '/dashboard': 'Dashboard',
  '/dashboard/instances/new': 'CreateInstance',
  '/dashboard/checkout': 'ServerCheckout',
})) {
  const route = `<Route path="${path}" element={<${element}/>}/>`;
  assert.ok(activeApp.includes(route), `missing active route: ${route}`);
}
assert.ok(createPage.includes("navigate('/dashboard/checkout?draftId='"), 'Create Instance checkout must navigate to registered route');
assert.ok(checkoutPage.includes("'/api/v1/payments/test/orders'"), 'Checkout must use existing provider payment flow');
console.log('PASS: production App.jsx exposes dashboard, Create Instance and checkout routes');
