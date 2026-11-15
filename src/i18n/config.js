// Public site localizations. Language preferences are independent of billing
// country: browser language does NOT prove residency or payment eligibility.
export const LANGUAGE_CODES = Object.freeze("en hi es fr de pt it nl ru uk pl tr ar fa ur he zh ja ko bn ta te ml kn gu mr pa ne si th vi id ms tl sw am ha yo zu af fr-CA es-MX pt-BR zh-TW sv no da fi el cs sk hu ro bg hr sr sl et lv lt".split(" "));
export const LANGUAGE_GROUPS = Object.freeze({
 en:"US",hi:"IN",es:"ES",fr:"FR",de:"DE",pt:"PT",it:"IT",nl:"NL",ru:"RU",uk:"UA",pl:"PL",tr:"TR",
 ar:"AE",fa:"IR",ur:"PK",he:"IL",zh:"CN",ja:"JP",ko:"KR",bn:"BD",ta:"IN",te:"IN",ml:"IN",kn:"IN",
 gu:"IN",mr:"IN",pa:"IN",ne:"NP",si:"LK",th:"TH",vi:"VN",id:"ID",ms:"MY",tl:"PH",sw:"KE",am:"ET",
 ha:"NG",yo:"NG",zu:"ZA",af:"ZA","fr-CA":"CA","es-MX":"MX","pt-BR":"BR","zh-TW":"TW",
 sv:"SE",no:"NO",da:"DK",fi:"FI",el:"GR",cs:"CZ",sk:"SK",hu:"HU",ro:"RO",bg:"BG",hr:"HR",
 sr:"RS",sl:"SI",et:"EE",lv:"LV",lt:"LT"
});
export const CURRENCY_BY_COUNTRY = Object.freeze({
 IN:"INR",US:"USD",GB:"GBP",CA:"CAD",AU:"AUD",NZ:"NZD",DE:"EUR",FR:"EUR",IT:"EUR",ES:"EUR",
 PT:"EUR",IE:"EUR",NL:"EUR",BE:"EUR",AT:"EUR",FI:"EUR",GR:"EUR",EE:"EUR",LV:"EUR",
 LT:"EUR",SK:"EUR",SI:"EUR",LU:"EUR",MT:"EUR",CY:"EUR",HR:"EUR",AE:"AED",SA:"SAR",
 QA:"QAR",KW:"KWD",BH:"BHD",OM:"OMR",IL:"ILS",JP:"JPY",CN:"CNY",HK:"HKD",TW:"TWD",
 KR:"KRW",SG:"SGD",MY:"MYR",TH:"THB",ID:"IDR",PH:"PHP",VN:"VND",BD:"BDT",PK:"PKR",
 NP:"NPR",LK:"LKR",ZA:"ZAR",NG:"NGN",KE:"KES",GH:"GHS",TZ:"TZS",UG:"UGX",EG:"EGP",
 MA:"MAD",DZ:"DZD",TN:"TND",BR:"BRL",MX:"MXN",AR:"ARS",CL:"CLP",CO:"COP",PE:"PEN",
 UY:"UYU",PY:"PYG",BO:"BOB",CR:"CRC",DO:"DOP",CH:"CHF",SE:"SEK",NO:"NOK",DK:"DKK",
 IS:"ISK",PL:"PLN",CZ:"CZK",HU:"HUF",RO:"RON",BG:"EUR",RS:"RSD",UA:"UAH",TR:"TRY",
 GE:"GEL",AZ:"AZN",KZ:"KZT",UZ:"UZS",RU:"RUB",BY:"BYN",AM:"AMD",MD:"MDL",IR:"IRR",
 MU:"MUR",SC:"SCR",ET:"ETB",ZM:"ZMW",BW:"BWP",NA:"NAD",AO:"AOA",FJ:"FJD",PG:"PGK",
 SB:"SBD",PA:"PAB",GT:"GTQ",HN:"HNL",NI:"NIO",SV:"USD",EC:"USD",JM:"JMD",TT:"TTD",
 BS:"BSD",BB:"BBD",BZ:"BZD"
});
export const RTL_LANGUAGES = new Set(["ar","fa","ur","he"]);
export function canonicalLanguage(value){
 const tag=String(value||"").trim().replaceAll("_","-");
 if(/^zh-(?:Hant|TW|HK|MO)(?:-|$)/i.test(tag))return "zh-TW";
 if(/^zh-(?:Hans|CN|SG)(?:-|$)/i.test(tag))return "zh";
 if(LANGUAGE_CODES.includes(tag))return tag;
 const short=tag.split("-")[0].toLowerCase();
 return LANGUAGE_CODES.includes(short)?short:"en";
}
export function browserLanguage(){
 if(typeof navigator==="undefined")return "en";
 const options=navigator.languages?.length?navigator.languages:[navigator.language];
 for(const candidate of options||[]){
  const raw=String(candidate||"").trim();
  const supported=canonicalLanguage(raw);
  if(supported!=="en"||/^en(?:[-_]|$)/i.test(raw))return supported;
 }
 return "en";
}
export function browserCountry(){
 if(typeof navigator==="undefined")return "IN";
 const navigatorLocale=(navigator.languages?.[0]||navigator.language||"");
 const region=String(navigatorLocale).match(/(?:^|[-_])([A-Za-z]{2})$/)?.[1]?.toUpperCase();
 if(region&&/^[A-Z]{2}$/.test(region))return region;
 return LANGUAGE_GROUPS[browserLanguage()]||"IN";
}
export function nativeLanguageName(code){
 try{return new Intl.DisplayNames([code],{type:"language"}).of(code)||code}
 catch{return code}
}
export const LANGUAGES = Object.freeze(LANGUAGE_CODES.map(code=>({code,nativeName:nativeLanguageName(code),region:LANGUAGE_GROUPS[code]})));
export function currencyForCountry(country){return CURRENCY_BY_COUNTRY[String(country||"").toUpperCase()]||"USD"}
// PayPal merchant presentment is limited to its Orders v2 supported list.
// BRL/CNY/MYR are intentionally excluded for India-based merchants due to
// PayPal's in-country-only restrictions. Unsupported local currencies use USD.
export const PAYPAL_PRESENTMENT_CURRENCIES = new Set("AUD CAD CZK DKK EUR HKD HUF ILS JPY MXN TWD NZD NOK PHP PLN GBP SGD SEK CHF THB USD".split(" "));
export const PAYPAL_ZERO_DIGIT_CURRENCIES = new Set(["HUF","JPY","TWD"]);
export function paypalCurrencyForCountry(country){
 if(country==="IN")return "INR";
 const local=currencyForCountry(country);
 return PAYPAL_PRESENTMENT_CURRENCIES.has(local)?local:"USD";
}
export function formatPayPalMinorAmount(amount,currency,locale="en"){
 const digits=PAYPAL_ZERO_DIGIT_CURRENCIES.has(currency)?0:2;
 const value=(Number(amount)||0)/(digits===0?1:100);
 try{return new Intl.NumberFormat(locale,{style:"currency",currency,minimumFractionDigits:digits,maximumFractionDigits:digits}).format(value)}
 catch{return String(value)+" "+currency}
}
export const COUNTRY_OPTIONS = Object.freeze(Object.keys(CURRENCY_BY_COUNTRY).sort());
export function countryName(country,locale="en"){
 try{return new Intl.DisplayNames([locale],{type:"region"}).of(country)||country}
 catch{return country}
}
export function priceLocale(lang,country){
 const region=country||LANGUAGE_GROUPS[lang]||"IN";
 return lang==="zh-TW"?"zh-Hant-TW":lang.split("-")[0]+"-"+region;
}
