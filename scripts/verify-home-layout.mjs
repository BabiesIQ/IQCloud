import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const home=readFileSync('src/pages/Home.jsx','utf8');
assert.ok(!home.includes('Choose your billing period'),'Home must not repeat the full billing-period pricing grid');
assert.ok(!home.includes('A simple setup, in one place'),'Remove the home server preview card');
assert.ok(!home.includes('Illustrative compute price'),'Remove sample server pricing from home');
assert.ok(!home.includes('BILLING_TERMS')&&!home.includes('termQuote'),'Billing terms belong on the pricing/checkout pages');
for(const method of ['VISA','Mastercard','UPI','PayPal']){
 assert.ok(home.includes(method),'Compact payment-method strip must mention '+method);
}
assert.ok(home.includes('gateway activation'),'Do not imply payment methods are already live when the merchant is disabled');
assert.ok(home.includes('Network & storage details')&&home.includes('Everything in one place.'),'Preserve remaining home sections');
assert.ok(home.includes('to="/pricing"'),'Pricing page must remain accessible');
console.log('Home QA passed: both oversized previews removed, concise gated payment methods present.');
