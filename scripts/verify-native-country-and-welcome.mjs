import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LANGUAGE_CODES, COUNTRY_OPTIONS, CURRENCY_BY_COUNTRY, nativeCountryName, nativeCountryLocale, countryName } from '../src/i18n/config.js';
import { translateUI } from '../src/i18n/translations.js';
import { WELCOME_BACK_TRANSLATIONS } from '../src/i18n/locales/welcome.js';

assert.equal(LANGUAGE_CODES.length, 60);
assert.equal(Object.keys(WELCOME_BACK_TRANSLATIONS).length, 59);
for (const code of LANGUAGE_CODES) {
  const greeting = translateUI('Welcome back,', code);
  assert.ok(greeting && (code === 'en' || greeting !== 'Welcome back,'), 'Missing greeting for '+code);
}
assert.equal(COUNTRY_OPTIONS.length, 112);
for (const code of COUNTRY_OPTIONS) {
  assert.ok(CURRENCY_BY_COUNTRY[code], 'Missing currency for '+code);
  assert.ok(nativeCountryLocale(code), 'Missing native locale for '+code);
  assert.ok(nativeCountryName(code).trim(), 'Missing native country name for '+code);
}
assert.equal(nativeCountryLocale('AM'), 'hy');
assert.equal(nativeCountryLocale('LK'), 'si');
assert.equal(nativeCountryLocale('IN'), 'hi');
assert.equal(nativeCountryName('AM'), new Intl.DisplayNames(['hy'], { type: 'region' }).of('AM'));
assert.notEqual(nativeCountryName('AM'), countryName('AM', 'si'), 'Country labels must ignore the website language');
const dashboard = readFileSync('src/pages/Dashboard.jsx', 'utf8');
assert.ok(dashboard.includes('<span data-no-translate>{name}</span>'), 'A user's name must never be translated');
assert.ok(dashboard.includes("t('Welcome back,')"), 'Greeting must be localized through the locale provider');
for (const path of ['src/components/LanguageSelector.jsx','src/pages/CurrencyPage.jsx','src/components/CloudPreferences.jsx']) {
  const content = readFileSync(path, 'utf8');
  assert.ok(content.includes('nativeCountryName(code)'), path+' must render native country names');
}
console.log('Native country names and dashboard welcome: 112 countries and 60 languages verified; user names preserved.');
