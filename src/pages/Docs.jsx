import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '@/services/apiClient';
import ApperIcon from '@/components/ApperIcon';

export const route = { path: '/docs', layout: 'public', access: 'public' };
const BASE = 'https://api.cloud.babiesiq.tech';
const COUNTRIES = [{"code":"IN","local":"INR","currency":"INR"},{"code":"US","local":"USD","currency":"USD"},{"code":"GB","local":"GBP","currency":"GBP"},{"code":"CA","local":"CAD","currency":"CAD"},{"code":"AU","local":"AUD","currency":"AUD"},{"code":"NZ","local":"NZD","currency":"NZD"},{"code":"DE","local":"EUR","currency":"EUR"},{"code":"FR","local":"EUR","currency":"EUR"},{"code":"IT","local":"EUR","currency":"EUR"},{"code":"ES","local":"EUR","currency":"EUR"},{"code":"PT","local":"EUR","currency":"EUR"},{"code":"IE","local":"EUR","currency":"EUR"},{"code":"NL","local":"EUR","currency":"EUR"},{"code":"BE","local":"EUR","currency":"EUR"},{"code":"AT","local":"EUR","currency":"EUR"},{"code":"FI","local":"EUR","currency":"EUR"},{"code":"GR","local":"EUR","currency":"EUR"},{"code":"EE","local":"EUR","currency":"EUR"},{"code":"LV","local":"EUR","currency":"EUR"},{"code":"LT","local":"EUR","currency":"EUR"},{"code":"SK","local":"EUR","currency":"EUR"},{"code":"SI","local":"EUR","currency":"EUR"},{"code":"LU","local":"EUR","currency":"EUR"},{"code":"MT","local":"EUR","currency":"EUR"},{"code":"CY","local":"EUR","currency":"EUR"},{"code":"HR","local":"EUR","currency":"EUR"},{"code":"AE","local":"AED","currency":"USD"},{"code":"SA","local":"SAR","currency":"USD"},{"code":"QA","local":"QAR","currency":"USD"},{"code":"KW","local":"KWD","currency":"USD"},{"code":"BH","local":"BHD","currency":"USD"},{"code":"OM","local":"OMR","currency":"USD"},{"code":"IL","local":"ILS","currency":"ILS"},{"code":"JP","local":"JPY","currency":"JPY"},{"code":"CN","local":"CNY","currency":"USD"},{"code":"HK","local":"HKD","currency":"HKD"},{"code":"TW","local":"TWD","currency":"TWD"},{"code":"KR","local":"KRW","currency":"USD"},{"code":"SG","local":"SGD","currency":"SGD"},{"code":"MY","local":"MYR","currency":"USD"},{"code":"TH","local":"THB","currency":"THB"},{"code":"ID","local":"IDR","currency":"USD"},{"code":"PH","local":"PHP","currency":"PHP"},{"code":"VN","local":"VND","currency":"USD"},{"code":"BD","local":"BDT","currency":"USD"},{"code":"PK","local":"PKR","currency":"USD"},{"code":"NP","local":"NPR","currency":"USD"},{"code":"LK","local":"LKR","currency":"USD"},{"code":"ZA","local":"ZAR","currency":"USD"},{"code":"NG","local":"NGN","currency":"USD"},{"code":"KE","local":"KES","currency":"USD"},{"code":"GH","local":"GHS","currency":"USD"},{"code":"TZ","local":"TZS","currency":"USD"},{"code":"UG","local":"UGX","currency":"USD"},{"code":"EG","local":"EGP","currency":"USD"},{"code":"MA","local":"MAD","currency":"USD"},{"code":"DZ","local":"DZD","currency":"USD"},{"code":"TN","local":"TND","currency":"USD"},{"code":"BR","local":"BRL","currency":"USD"},{"code":"MX","local":"MXN","currency":"MXN"},{"code":"AR","local":"ARS","currency":"USD"},{"code":"CL","local":"CLP","currency":"USD"},{"code":"CO","local":"COP","currency":"USD"},{"code":"PE","local":"PEN","currency":"USD"},{"code":"UY","local":"UYU","currency":"USD"},{"code":"PY","local":"PYG","currency":"USD"},{"code":"BO","local":"BOB","currency":"USD"},{"code":"CR","local":"CRC","currency":"USD"},{"code":"DO","local":"DOP","currency":"USD"},{"code":"CH","local":"CHF","currency":"CHF"},{"code":"SE","local":"SEK","currency":"SEK"},{"code":"NO","local":"NOK","currency":"NOK"},{"code":"DK","local":"DKK","currency":"DKK"},{"code":"IS","local":"ISK","currency":"USD"},{"code":"PL","local":"PLN","currency":"PLN"},{"code":"CZ","local":"CZK","currency":"CZK"},{"code":"HU","local":"HUF","currency":"HUF"},{"code":"RO","local":"RON","currency":"USD"},{"code":"BG","local":"EUR","currency":"EUR"},{"code":"RS","local":"RSD","currency":"USD"},{"code":"UA","local":"UAH","currency":"USD"},{"code":"TR","local":"TRY","currency":"USD"},{"code":"GE","local":"GEL","currency":"USD"},{"code":"AZ","local":"AZN","currency":"USD"},{"code":"KZ","local":"KZT","currency":"USD"},{"code":"UZ","local":"UZS","currency":"USD"},{"code":"RU","local":"RUB","currency":"USD"},{"code":"BY","local":"BYN","currency":"USD"},{"code":"AM","local":"AMD","currency":"USD"},{"code":"MD","local":"MDL","currency":"USD"},{"code":"MU","local":"MUR","currency":"USD"},{"code":"SC","local":"SCR","currency":"USD"},{"code":"ET","local":"ETB","currency":"USD"},{"code":"ZM","local":"ZMW","currency":"USD"},{"code":"BW","local":"BWP","currency":"USD"},{"code":"NA","local":"NAD","currency":"USD"},{"code":"AO","local":"AOA","currency":"USD"},{"code":"FJ","local":"FJD","currency":"USD"},{"code":"PG","local":"PGK","currency":"USD"},{"code":"SB","local":"SBD","currency":"USD"},{"code":"PA","local":"PAB","currency":"USD"},{"code":"GT","local":"GTQ","currency":"USD"},{"code":"HN","local":"HNL","currency":"USD"},{"code":"NI","local":"NIO","currency":"USD"},{"code":"SV","local":"USD","currency":"USD"},{"code":"EC","local":"USD","currency":"USD"},{"code":"JM","local":"JMD","currency":"USD"},{"code":"TT","local":"TTD","currency":"USD"},{"code":"BS","local":"BSD","currency":"USD"},{"code":"BB","local":"BBD","currency":"USD"},{"code":"BZ","local":"BZD","currency":"USD"}];
const COUNTRY_GROUPS = [{"currency":"AUD","countries":"AU"},{"currency":"CAD","countries":"CA"},{"currency":"CHF","countries":"CH"},{"currency":"CZK","countries":"CZ"},{"currency":"DKK","countries":"DK"},{"currency":"EUR","countries":"DE, FR, IT, ES, PT, IE, NL, BE, AT, FI, GR, EE, LV, LT, SK, SI, LU, MT, CY, HR, BG"},{"currency":"GBP","countries":"GB"},{"currency":"HKD","countries":"HK"},{"currency":"HUF","countries":"HU"},{"currency":"ILS","countries":"IL"},{"currency":"JPY","countries":"JP"},{"currency":"MXN","countries":"MX"},{"currency":"NOK","countries":"NO"},{"currency":"NZD","countries":"NZ"},{"currency":"PHP","countries":"PH"},{"currency":"PLN","countries":"PL"},{"currency":"SEK","countries":"SE"},{"currency":"SGD","countries":"SG"},{"currency":"THB","countries":"TH"},{"currency":"TWD","countries":"TW"},{"currency":"USD","countries":"US, AE, SA, QA, KW, BH, OM, CN, KR, MY, ID, VN, BD, PK, NP, LK, ZA, NG, KE, GH, TZ, UG, EG, MA, DZ, TN, BR, AR, CL, CO, PE, UY, PY, BO, CR, DO, IS, RO, RS, UA, TR, GE, AZ, KZ, UZ, RU, BY, AM, MD, MU, SC, ET, ZM, BW, NA, AO, FJ, PG, SB, PA, GT, HN, NI, SV, EC, JM, TT, BS, BB, BZ"}];
const OS_LIST = ['ubuntu-24', 'ubuntu-22', 'ubuntu-26', 'debian-12'];
const REGION_LIST = ['ap-southeast', 'us-west', 'us-east', 'eu-west'];
const CONT = ' ' + String.fromCharCode(92) + '\n';
const curl = (lines) => lines.join(CONT);
const paymentExampleId = 'devpay_0123456789abcdef0123456789abcdef';

function Copy({value, title='Copy'}) {
  const [done,setDone] = useState(false);
  const [error,setError] = useState(false);
  async function handleCopy(){
    try { await navigator.clipboard.writeText(value); setDone(true); setError(false); window.setTimeout(()=>setDone(false),1500); }
    catch { setError(true); }
  }
  return <span className="inline-flex items-center gap-1">
    <button type="button" onClick={handleCopy} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted" aria-label={title}>
      <ApperIcon name={done?'Check':'Copy'} size={14}/>{done?'Copied':title}
    </button>
    {error && <span className="text-[11px] text-amber-600">Select to copy</span>}
  </span>;
}
function CodeBox({title,code,note}) {
  return <div className="min-w-0 overflow-hidden rounded-xl border border-border">
    <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 px-4 py-3">
      <span className="text-xs font-semibold">{title}</span><Copy value={code} title="Copy command"/>
    </div>
    <pre className="max-w-full overflow-x-auto p-4 text-xs leading-6"><code>{code}</code></pre>
    {note && <p className="border-t border-border px-4 py-3 text-xs leading-6 text-muted-foreground">{note}</p>}
  </div>;
}
function JsonBox({title,value,note}) {
  return <CodeBox title={title} code={JSON.stringify(value,null,2)} note={note}/>;
}
function Section({id,n,title,description,children}) {
  return <section id={id} className="scroll-mt-24 space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-7">
    <header className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">{n}</span>
      <div><h2 className="font-heading text-lg font-bold sm:text-xl">{title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div>
    </header>{children}
  </section>;
}
function KeyManager(){
  const [label,setLabel]=useState('My Discord Bot');
  const [working,setWorking]=useState(false);
  const [secret,setSecret]=useState('');
  const [keys,setKeys]=useState([]);
  const [message,setMessage]=useState('');
  async function load(silent=false){
    if(!silent)setWorking(true);
    try {const result=await apiRequest('/api/v1/developer/keys');setKeys(result.keys||[]);if(!silent)setMessage('Loaded key metadata. Existing secret values are never shown again.');}
    catch(e){if(!silent)setMessage(e.message||'Sign in to view API keys.');}
    finally{if(!silent)setWorking(false);}
  }
  async function generate(){
    setWorking(true);setMessage('');setSecret('');
    try {const result=await apiRequest('/api/v1/developer/keys',{method:'POST',body:{label:label.trim()}});
      if(!result.apiKey)throw Error('API key was not returned');
      setSecret(result.apiKey);setMessage('Key created. Copy it securely: it will only be shown once.');await load(true);
    }catch(e){setMessage(e.message||'Unable to generate key.');}finally{setWorking(false);}
  }
  async function revoke(id){
    if(!window.confirm('Revoke this API key? Connected bots using it will stop working.'))return;
    setWorking(true);
    try {await apiRequest('/api/v1/developer/keys/'+id,{method:'DELETE'});setMessage('Key revoked.');await load(true);}
    catch(e){setMessage(e.message||'Unable to revoke key.');}finally{setWorking(false);}
  }
  return <div className="space-y-3 rounded-xl border border-border bg-background p-4">
    <h3 className="text-sm font-semibold">Create and manage your developer API keys</h3>
    <p className="text-xs leading-6 text-muted-foreground">Requires a signed-in, verified BabiesIQ Cloud account. Maximum 3 active API keys, valid for 180 days. Keep these only on your trusted bot/backend, not in a public website or GitHub repo.</p>
    <div className="flex flex-wrap gap-2">
      <input value={label} onChange={e=>setLabel(e.target.value)} maxLength={60} placeholder="Bot/application label" aria-label="Developer API key label" className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"/>
      <button disabled={working||label.trim().length<2} onClick={generate} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">{working?'Working…':'Generate API key'}</button>
      <button disabled={working} onClick={()=>load()} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold disabled:opacity-50">My keys</button>
    </div>
    {message && <p role="status" className="text-xs text-muted-foreground">{message}</p>}
    {secret && <div className="rounded-lg border border-amber-500/40 p-3">
      <p className="mb-2 text-xs font-semibold">Save this secret now — shown once only</p>
      <code className="block break-all rounded bg-muted/40 p-2 text-xs">{secret}</code>
      <div className="mt-3 flex flex-wrap gap-2"><Copy value={secret} title="Copy API key"/><button onClick={()=>setSecret('')} className="rounded-lg border border-border px-3 py-1 text-xs">Clear from screen</button></div>
    </div>}
    {!!keys.length && <div className="space-y-2">{keys.map(k=><div key={k.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-2 text-xs">
      <span><strong>{k.label}</strong> <span className="text-muted-foreground">••••{k.id} · Expires {new Date(k.expiresAt).toLocaleDateString()}</span></span>
      <button disabled={working} onClick={()=>revoke(k.id)} className="rounded border border-border px-2 py-1">Revoke</button>
    </div>)}</div>}
  </div>;
}

export default function Docs(){
  const [country,setCountry]=useState('IN');
  const [search,setSearch]=useState('');
  const [ram,setRam]=useState(1);
  const [cpu,setCpu]=useState(1);
  const [months,setMonths]=useState(1);
  const [osImage,setOSImage]=useState('ubuntu-24');
  const [region,setRegion]=useState('ap-southeast');
  const [paymentId,setPaymentId]=useState(paymentExampleId);
  const selectedCountry=COUNTRIES.find(c=>c.code===country)||COUNTRIES[0];
  const currency=selectedCountry.currency;
  const priceId='linux-r'+ram+'-c'+cpu+'-m'+months;
  const countryQuery='?currency='+currency+'&country='+country;
  const availableCountries=useMemo(()=>COUNTRIES.filter(c=>(c.code+' '+c.local+' '+c.currency).toLowerCase().includes(search.toLowerCase().trim())),[search]);
  const orderRequest=JSON.stringify({country,os:osImage,region,rootPassword:'REPLACE_With_a_Strong_Passw0rd!'});
  const apiKeyCommand='export IQC_API_KEY="iqd_REPLACE_WITH_YOUR_SECRET_KEY"';
  const selectedPriceCurl=curl(['curl -sS "'+BASE+'/linux/price-list'+countryQuery+'"']);
  const selectedOrderCurl=curl([
    'curl -sS -X POST "'+BASE+'/create-order/linux/'+priceId+countryQuery+'"',
    '-H "Authorization: Bearer $IQC_API_KEY"',
    '-H "Idempotency-Key: your-bot-order-00000001"',
    '-H "Content-Type: application/json"',
    "-d '"+orderRequest+"'"
  ]);
  const indiaOrderCurl=curl([
    'curl -sS -X POST "'+BASE+'/create-order/linux/linux-r1-c1-m1?currency=INR"',
    '-H "Authorization: Bearer $IQC_API_KEY"',
    '-H "Idempotency-Key: india-order-00000001"',
    '-H "Content-Type: application/json"',
    "-d '"+JSON.stringify({country:'IN',os:'ubuntu-24',region:'ap-southeast',rootPassword:'REPLACE_With_a_Strong_Passw0rd!'})+"'"
  ]);
  const usOrderCurl=curl([
    'curl -sS -X POST "'+BASE+'/create-order/linux/linux-r1-c1-m1?currency=USD"',
    '-H "Authorization: Bearer $IQC_API_KEY"',
    '-H "Idempotency-Key: us-order-00000001"',
    '-H "Content-Type: application/json"',
    "-d '"+JSON.stringify({country:'US',os:'ubuntu-24',region:'us-east',rootPassword:'REPLACE_With_a_Strong_Passw0rd!'})+"'"
  ]);
  const checkId=paymentId.trim()||paymentExampleId;
  const verifyCurl=curl(['curl -sS "'+BASE+'/confirmation/'+checkId+'"','-H "Authorization: Bearer $IQC_API_KEY"']);
  const keyCreateCurl=curl([
    'curl -sS -X POST "'+BASE+'/api/v1/developer/keys"',
    '-H "Origin: https://cloud.babiesiq.tech"',
    '-H "Content-Type: application/json"',
    '-H "Cookie: iqcloud_session=YOUR_ACTIVE_BROWSER_SESSION"',
    "-d '"+JSON.stringify({label:'My Discord Bot'})+"'"
  ]);
  const keyListCurl=curl(['curl -sS "'+BASE+'/api/v1/developer/keys"','-H "Cookie: iqcloud_session=YOUR_ACTIVE_BROWSER_SESSION"']);
  const keyDeleteCurl=curl([
    'curl -sS -X DELETE "'+BASE+'/api/v1/developer/keys/LAST_8_CHARACTERS_OF_KEY_ID"',
    '-H "Origin: https://cloud.babiesiq.tech"',
    '-H "Cookie: iqcloud_session=YOUR_ACTIVE_BROWSER_SESSION"'
  ]);

  const nav=[
    ['#api-keys','API key'],['#price-list','Price list'],['#countries','Countries & currencies'],
    ['#create-order','Create order'],['#verify','Verify payment'],['#response','VPS details'],['#errors','Errors']
  ];

  return <div id="developer-api" className="mx-auto max-w-6xl space-y-7 px-4 py-10 sm:px-6 sm:py-14">
    <header className="space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary"><ApperIcon name="Code2" size={15}/> BabiesIQ Cloud • Developer API</div>
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Developer API documentation</h1>
      <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">Complete integration guide for Telegram bots, Discord bots and websites. Get Linux VPS prices, create a Razorpay or PayPal hosted payment link, and securely confirm payment before delivering VPS login details.</p>
      <div className="flex flex-wrap items-center gap-2"><code className="rounded-lg border border-border px-3 py-2 text-xs">{BASE}</code><Copy value={BASE} title="Copy base URL"/></div>
      <nav aria-label="API documentation sections" className="flex flex-wrap gap-2">{nav.map(([url,text])=><a key={url} href={url} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">{text}</a>)}</nav>
    </header>
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        ['GET','/linux/price-list','Public catalog, 256 Linux price IDs'],
        ['POST','/create-order/linux/{priceId}','Protected hosted payment link creation'],
        ['GET','/confirmation/{paymentId}','Protected payment and SSH-ready verification']
      ].map(([method,url,desc])=><div key={url} className="rounded-xl border border-border bg-card p-4">
        <p className="mb-2 text-xs font-bold text-primary">{method}</p><code className="block break-all text-xs font-semibold">{url}</code><p className="mt-2 text-xs leading-5 text-muted-foreground">{desc}</p>
      </div>)}
    </div>

    <Section id="api-keys" n="01" title="Create an API key" description="The price-list request is public. Orders and confirmations use your private developer API key in the Authorization header.">
      <KeyManager/>
      <CodeBox title="Set your API key on a trusted server or terminal" code={apiKeyCommand} note="Replace the example string with your real one-time key. Never place it in public JavaScript, source control, bot commands or screenshots."/>
      <p className="text-xs leading-6 text-muted-foreground">Authenticated requests must include an HTTP header in this format: <code>Authorization: Bearer YOUR_DEVELOPER_API_KEY</code>. API keys are linked to the verified BabiesIQ account that owns the orders, cannot read another developer's payments, and expire after 180 days.</p>
      <details className="rounded-xl border border-border p-4"><summary className="cursor-pointer text-sm font-semibold">Advanced API key management cURL commands</summary>
        <p className="mt-3 text-xs leading-6 text-muted-foreground">Key creation/list/revocation use a logged-in browser session cookie rather than an API bearer key. Prefer the buttons above. Never share your session cookie. For POST/DELETE, the Origin header must match the trusted website.</p>
        <div className="mt-3 space-y-3"><CodeBox title="POST /api/v1/developer/keys — create" code={keyCreateCurl}/>
          <CodeBox title="GET /api/v1/developer/keys — list" code={keyListCurl}/>
          <CodeBox title="DELETE /api/v1/developer/keys/{last8} — revoke" code={keyDeleteCurl}/>
        </div>
      </details>
    </Section>

    <Section id="price-list" n="02" title="Get the complete Linux price list" description="The standard catalog has 256 price IDs (1–8 GB RAM × 1–8 vCPU × 1/3/6/12 months). Verified and explicitly priced Pro combinations up to 24 GB/24 vCPU appear dynamically when enabled. Always use the returned price list; currency does not change a price ID.">
      <div className="grid gap-3 md:grid-cols-2">
        <CodeBox title="India / INR / Razorpay — public cURL" code={'curl -sS "'+BASE+'/linux/price-list?currency=INR"'}/>
        <CodeBox title="United States / USD / PayPal — public cURL" code={'curl -sS "'+BASE+'/linux/price-list?currency=USD&country=US"'}/>
      </div>
      <div className="rounded-xl bg-muted/40 p-4 text-xs leading-6 text-muted-foreground">
        <p>Price ID example: <strong className="text-foreground">linux-r2-c2-m3</strong> = 2 GB RAM, 2 vCPU, 3 months. Fields include <code>priceId</code>, <code>ramGb</code>, <code>vcpu</code>, <code>months</code>, <code>monthlyINR</code>, <code>discountPercent</code>, <code>amountMinor</code>, <code>currency</code> and <code>available</code>.</p>
        <p className="mt-2">INR amounts are in paise. International amounts use the currency minor unit; JPY/HUF/TWD use whole units. Overseas compute prices apply the current 2× multiplier and FX conversion; list quotes are estimates until order creation locks the final amount. Check <code>checkoutEnabled</code> and the plan's <code>available</code> flag.</p>
      </div>
      <JsonBox title="Shortened response example — the real endpoint returns 256 plans" value={{
        category:'linux',currency:'INR',gateway:'razorpay',priceCount:256,checkoutEnabled:true,
        plans:[{priceId:'linux-r1-c1-m1',ramGb:1,vcpu:1,months:1,monthlyINR:49,discountPercent:0,amountMinor:4900,currency:'INR',available:true}]
      }}/>
    </Section>

    <Section id="countries" n="03" title="All country codes and supported payment currencies" description="Use ISO two-letter billing country codes. INR is Razorpay; eligible overseas checkout uses PayPal. PayPal must verify the actual payer country.">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs font-semibold">Choose billing country
          <select value={country} onChange={e=>setCountry(e.target.value)} className="min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm">
            {COUNTRIES.map(c=><option value={c.code} key={c.code}>{c.code} → {c.currency}{c.local!==c.currency?' (USD fallback)':''}</option>)}
          </select>
        </label>
        <div className="flex flex-col gap-1 text-xs font-semibold">Checkout currency
          <span className="rounded-lg border border-border bg-background px-3 py-2 text-sm">{currency}</span>
        </div>
        <div className="flex flex-col gap-1 text-xs font-semibold">Payment gateway
          <span className="rounded-lg border border-border bg-background px-3 py-2 text-sm">{currency==='INR'?'Razorpay':'PayPal'}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/40 p-3 text-xs"><code>{countryQuery}</code><Copy value={countryQuery} title="Copy country query"/></div>
      <CodeBox title={'Selected country '+country+' — price-list cURL'} code={selectedPriceCurl}/>
      <div className="space-y-2 text-xs leading-6 text-muted-foreground">
        <p>Examples: <code>?currency=INR&country=IN</code> (India), <code>?currency=USD&country=US</code> (USA), <code>?currency=GBP&country=GB</code> (UK), <code>?currency=EUR&country=DE</code> (Germany), and <code>?currency=USD&country=AE</code> (UAE, fallback to USD).</p>
        <p>Never put currency in a URL fragment such as <strong>#USD</strong>; fragments are never sent to the backend. Use <strong>?currency=USD</strong>. The order JSON must include <code>country</code> for international purchases, and the verified PayPal billing country must match.</p>
      </div>
      <div className="rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold">Complete country mapping in the live backend</h3>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">The following codes are grouped by actual checkout currency. Countries with unsupported local PayPal currency fall back to USD. IN uses INR/Razorpay. Countries not explicitly mapped currently default to USD for a syntactically valid two-letter foreign country code, but acceptance depends on actual PayPal merchant and payer eligibility.</p>
        <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[390px] text-left text-xs">
          <thead><tr className="border-b border-border"><th className="py-2 pr-3">Currency</th><th className="py-2">Country codes</th></tr></thead>
          <tbody><tr className="border-b border-border"><td className="py-2 font-bold">INR</td><td className="py-2">IN</td></tr>{COUNTRY_GROUPS.map(g=><tr key={g.currency} className="border-b border-border/50 align-top"><td className="py-2 pr-3 font-semibold">{g.currency}</td><td className="py-2 leading-6">{g.countries}</td></tr>)}</tbody>
        </table></div>
        <label className="mt-5 block text-xs font-semibold">Search country code or currency
          <input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="US, AE, EUR, AED..." className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"/>
        </label>
        <div className="mt-3 grid max-h-48 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-4">{availableCountries.map(c=><button type="button" key={c.code} onClick={()=>setCountry(c.code)} className={'rounded-lg border p-2 text-left text-xs '+(country===c.code?'border-primary bg-primary/5':'border-border hover:bg-muted')}>
          <strong>{c.code}</strong> <span className="text-muted-foreground">{c.currency}</span>{c.local!==c.currency&&<span className="block text-[10px] text-muted-foreground">{c.local} → USD</span>}
        </button>)}</div>
      </div>
      <p className="text-xs leading-6 text-muted-foreground">Current non-INR currencies accepted by the API: AUD, CAD, CZK, DKK, EUR, HKD, HUF, ILS, JPY, MXN, TWD, NZD, NOK, PHP, PLN, GBP, SGD, SEK, CHF, THB, USD. INR cannot be used for international checkout, and India-based PayPal buyers cannot use this international flow.</p>
    </Section>

    <Section id="create-order" n="04" title="Create a payment link and order ID" description="POST /create-order/linux/{priceId}?currency=... — send your developer API key and a unique Idempotency-Key so retries cannot create duplicate chargeable orders.">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          ['RAM GB',ram,setRam,[1,2,3,4,5,6,7,8]],['vCPU',cpu,setCpu,[1,2,3,4,5,6,7,8]],
          ['Months',months,setMonths,[1,3,6,12]],['Linux image',osImage,setOSImage,OS_LIST],['Region',region,setRegion,REGION_LIST]
        ].map(([name,value,change,options])=><label key={name} className="flex flex-col gap-1 text-xs font-semibold">{name}
          <select value={value} onChange={e=>change(typeof value==='number'?Number(e.target.value):e.target.value)} className="min-w-0 rounded-lg border border-border bg-background px-2 py-2 text-sm">{options.map(v=><option key={v} value={v}>{v}</option>)}</select>
        </label>)}
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/40 p-3"><span className="text-xs text-muted-foreground">Selected price ID</span><code className="text-sm font-semibold">{priceId}</code><Copy value={priceId}/></div>
      <CodeBox title={'Complete '+country+'/'+currency+' order cURL — generated from your selections'} code={selectedOrderCurl} note="REPLACE_With_a_Strong_Passw0rd! is an example, not a password to reuse. Choose a unique root password and a new Idempotency-Key for every new purchase. Repeat the same key only to retry the SAME order."/>
      <div className="grid gap-3 md:grid-cols-2">
        <CodeBox title="INR / India — Razorpay order example" code={indiaOrderCurl}/>
        <CodeBox title="USD / United States — PayPal order example" code={usOrderCurl}/>
      </div>
      <div className="rounded-xl bg-muted/40 p-4 text-xs leading-6 text-muted-foreground">
        <p><strong className="text-foreground">Required:</strong> Authorization Bearer key, Idempotency-Key (8–96 safe letters/digits/dot/underscore/dash), and JSON fields <code>rootPassword</code>, <code>country</code>, <code>os</code>, <code>region</code>. The server defaults to ubuntu-24 and ap-southeast if OS/region are omitted.</p>
        <p className="mt-2">Root password requires 16–128 characters, at least three of uppercase/lowercase/numbers/symbols; colon, line breaks and control characters are forbidden. The root password is encrypted into the saved draft and NEVER returned by confirmation. This is a POST endpoint; opening it with GET does not create an order.</p>
      </div>
      <JsonBox title="Example HTTP 201 create-order response — payment URL is illustrative" value={{
        paymentId:paymentExampleId,priceId,provider:currency==='INR'?'razorpay_payment_link':'paypal',
        currency,amountMinor:'SERVER_LOCKED_AMOUNT_IN_MINOR_UNITS',
        status:'awaiting_payment',paymentUrl:'https://rzp.io/rzp/EXAMPLE_NOT_PAYABLE',
        confirmationUrl:BASE+'/confirmation/'+paymentExampleId,serverProvisioned:false
      }} note="The price amount and URL above are illustrative. In a real response the provider-generated paymentUrl can point to Razorpay or PayPal and amountMinor is the exact locked charge. Store paymentId in your bot; share only paymentUrl with the buyer."/>
    </Section>

    <Section id="verify" n="05" title="Verify payment and VPS provisioning" description="GET /confirmation/{paymentId} with the SAME developer API key. Do not trust screenshots or browser redirects.">
      <label className="flex flex-col gap-1 text-xs font-semibold">Payment ID returned by create-order
        <input value={paymentId} onChange={e=>setPaymentId(e.target.value)} placeholder={paymentExampleId} className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs"/>
      </label>
      <CodeBox title="Verify a specific payment using your API key" code={verifyCurl} note="Run approximately every 15–30 seconds while awaiting payment/provisioning. A HTTP 200 response alone does NOT mean paid: inspect paymentVerified, status and serverProvisioned."/>
      <CodeBox title="Shell variables — store the paymentId, then check" code={'export IQC_PAYMENT_ID="'+paymentExampleId+'" \n'+curl([
        'curl -sS "'+BASE+'/confirmation/$IQC_PAYMENT_ID"','-H "Authorization: Bearer $IQC_API_KEY"'
      ])}/>
      <div className="grid gap-3 md:grid-cols-3">{[
        ['awaiting_payment','Checkout link exists; buyer has not completed a verified payment.'],
        ['provisioning','Captured payment verified; VPS or its SSH gateway is still being prepared.'],
        ['ready','Payment verified and VPS SSH-ready. Deliver the returned server fields.']
      ].map(([state,text])=><div key={state} className="rounded-xl border border-border p-4"><code className="font-bold text-primary text-xs">{state}</code><p className="mt-2 text-xs leading-6 text-muted-foreground">{text}</p></div>)}</div>
      <p className="text-xs leading-6 text-muted-foreground">Other possible states include creating, captured_verified, expired, failed_before_gateway and needs_review. For needs_review, retain your original paymentId and contact support; NEVER create a replacement order or make a second payment just because confirmation was delayed. Only deliver credentials when <code>status: ready</code> and <code>serverProvisioned: true</code>.</p>
    </Section>

    <Section id="response" n="06" title="VPS details returned after verified payment" description="The confirmation response includes the real SSH-ready VPS route, not a mock or the original root password.">
      <JsonBox title="Illustrative ready response — example VPS ID and SSH fingerprint" value={{
        paymentId:paymentExampleId,status:'ready',paymentVerified:true,paymentStatus:'captured_verified',
        serverProvisioned:true,
        server:{host:'vps.babiesiq.tech',port:33756,username:'root',vpsId:'12345678',
          passwordExample:'12345678:YOUR_VPS_PASSWORD',
          os:osImage,region,ramGb:ram,vcpu:cpu,
          hostKeyFingerprint:'SHA256:EXAMPLE_FINGERPRINT'}
      }} note="The VPS ID and fingerprint above are placeholders. Obtain your actual values from your own successful confirmation response."/>
      <p className="rounded-xl bg-muted/40 p-4 text-xs leading-6 text-muted-foreground"><strong className="text-foreground">Termius SSH:</strong> host <code>vps.babiesiq.tech</code>, username <code>root</code>, use <code>server.port</code> from the response (currently 33756). In the password field enter <code>VPS_ID:YOUR_VPS_PASSWORD</code> with your unique ID and the original root password you supplied. The backend never returns that secret. These BabiesIQ Cloud containers support IPv4 and IPv6 networking through their configured routes. Use the assigned connection details; shared root storage remains ephemeral.</p>
    </Section>

    <Section id="errors" n="07" title="HTTP status codes, quotas and safe retry rules" description="All errors are JSON. Keep the original order reference and the same idempotency key on any uncertain retry.">
      <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full min-w-[420px] text-left text-xs">
        <thead><tr className="border-b border-border bg-muted/40"><th className="px-3 py-3">Status</th><th className="px-3 py-3">Meaning and action</th></tr></thead>
        <tbody>{[
          ['200','Successful request. In confirmation, inspect JSON state before delivering VPS.'],
          ['201','Payment order created. Save paymentId and forward paymentUrl to buyer.'],
          ['202','Provider/order reconciliation uncertain; do not create another payment.'],
          ['400','Invalid country, currency, priceId, OS, region, password or idempotency key.'],
          ['401','Missing/invalid developer bearer key, or owner login required for key management.'],
          ['404','Payment ID was not found for this developer key/account.'],
          ['405','Wrong request method (create-order requires POST).'],
          ['409','Conflicting order/idempotency key or unavailable currency quote.'],
          ['429','Rate limit, developer key limit or outstanding order quota exceeded.'],
          ['503','Temporary provider, FX or payment readiness problem; check original order.']
        ].map(([status,text])=><tr key={status} className="border-b border-border/50"><td className="px-3 py-2 font-mono font-semibold">{status}</td><td className="px-3 py-2 leading-6">{text}</td></tr>)}</tbody>
      </table></div>
      <p className="text-xs leading-6 text-muted-foreground">Limits: 100 authenticated API calls/minute per key, 3 active API keys per account, 5 outstanding orders, 20 saved drafts. Always send payment and root-password details via HTTPS only. PayPal requires an actual eligible foreign buyer; a valid country code by itself is not a guarantee of provider acceptance.</p>
    </Section>
    <footer className="flex flex-wrap gap-4 pb-6 text-xs text-muted-foreground"><a href="#developer-api" className="font-semibold text-primary">Back to top</a><Link to="/terms">Terms of service</Link><span>BabiesIQ Cloud Developer API</span></footer>
  </div>;
}
