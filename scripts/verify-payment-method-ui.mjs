import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {translateUI} from '../src/i18n/translations.js';
const checkout=readFileSync('src/pages/ServerCheckout.jsx','utf8');
const cards=readFileSync('src/components/cloud/PayPalGuestCardButton.jsx','utf8');

assert.ok(checkout.includes("t('Choose a payment method')"));
assert.ok(checkout.includes('isInternational?<div'), 'Payment methods must only be shown for international checkout');
assert.ok(checkout.indexOf('<PayPalGuestCardButton') < checkout.indexOf('<section aria-label={t(\'Pay with PayPal\')}'),'Card section must be above PayPal');
assert.ok(checkout.includes('onClick={pay} className="mt-4'), 'PayPal must preserve the same guarded checkout handler');
assert.ok(checkout.includes('onClick={pay} className="mt-6'), 'India Razorpay checkout must remain present');
assert.ok(cards.includes('createPayPalGuestOneTimePaymentSession'), 'Do not replace PayPal-hosted card checkout');
assert.ok(cards.includes("const available=enabled&&state==='eligible'"), 'Never advertise card brand acceptance before PayPal buyer eligibility');
assert.ok(cards.includes('https://upload.wikimedia.org/wikipedia/commons/5/5c/Visa_Inc._logo_'), 'Use existing current Visa brand artwork');
assert.ok(cards.includes('https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg'), 'Use existing current Mastercard artwork');
assert.ok(!cards.includes('grayscale'), 'Do not recolor original payment trademarks');
assert.ok(!cards.includes('type="text"')&&!cards.includes('name="cvv"'), 'Card details must stay in PayPal-owned fields');
for(const locale of ['hi','zh-TW','es','fr','de','ar','pt']){
 for(const message of ['Choose a payment method','Pay using card','Pay with PayPal','Continue with PayPal']){
  assert.notEqual(translateUI(message,locale),message,locale+' checkout label is not translated: '+message);
 }
}
console.log('Payment UI QA: card-first checkout, untouched Visa/Mastercard SVGs, PayPal eligibility and existing guarded payment handlers all passed.');
