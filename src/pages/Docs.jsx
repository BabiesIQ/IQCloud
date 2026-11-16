import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '@/services/apiClient';
import { SectionHead } from '@/components/cloud/CloudUI';
import ApperIcon from '@/components/ApperIcon';

export const route = { path: '/docs', layout: 'public', access: 'public' };

const blocks = [
  {icon:'Server',title:'Getting started',text:'Choose Linux image, region, RAM and CPU, then a billing term: monthly, 3 months (7% off), 6 months (14% off) or 12 months (30% off). Only compute resources are priced; no SSD allocation is sold.'},
  {icon:'CalendarClock',title:'Billing validity and renewal',text:'Validity starts when the server is SSH-ready. Three days before expiry, we send an in-app and email warning. Use Renew in the dashboard to extend the existing service. Expired deployments stop; reopening them can erase ephemeral files. No auto-debit is enabled.'},
  {icon:'TerminalSquare',title:'SSH and remote access',text:'BabiesIQ Cloud uses the shared vps.babiesiq.tech Railway SSH gateway and a provider-assigned shared port for all paid VPSs. Each VPS has its own ID; in Termius use username root and VPS_ID:YOUR_VPS_PASSWORD in the password field. No dedicated IPv4/IPv6 is allocated. IPv4/IPv6 support depends on provider DNS/routing; do not assume dual-stack without verification. Copy your masked host from the dashboard. Use key-based authentication where configured.'},
  {icon:'Globe2',title:'Connect a custom domain',text:'Customer creates a DNS CNAME pointing to a real Railway-assigned hostname only after the operator registers the domain through Railway. DNS records cannot direct traffic to arbitrary ports by themselves.'},
  {icon:'Database',title:'Persistent storage',text:'Only a specifically attached Railway volume is persistent. The apparent size reported for a container overlay filesystem must not be sold as dedicated or persistent disk.'},
  {icon:'ShieldCheck',title:'Isolation & security',text:'A container shares the host kernel. Root access inside a container is not a dedicated virtual machine. User isolation, quotas, abuse prevention and network controls require additional infrastructure.'},
  {icon:'Code2',title:'Provisioning API roadmap',text:'The Go backend validates captured payment, provisions customer services and keeps operator credentials inaccessible to customers. Restarting the backend does not redeploy running VPS containers.'},
  {icon:'Network',title:'Custom inbound and outbound ports',text:'Manage inbound HTTP apps from Dashboard > hamburger menu > Networking > Inbound. Railway provides a public HTTP hostname for a selected application port after configuration. SSH keeps the single TCP proxy; additional raw TCP/UDP proxies and custom outbound firewall port rules are not supported by this service.'},
  {icon:'KeyRound',title:'Forgot VPS root password',text:'Use Reset password beside SSH credentials in the Dashboard. Confirm your BabiesIQ account password (if set), then a registered-email OTP and new root password. This reuses the same service but requires Railway redeployment; ephemeral files can be permanently lost. The forgotten original root password cannot be recovered.'},
  {icon:'ShieldCheck',title:'Hosting account migration',text:'Changing the operator Railway token alone does not mean an existing container was deleted. Automatic duplicate creation is disabled. For confirmed deleted old provider service IDs, an operator-configured gated recovery can create one replacement service on a newly authenticated project, preserve paid validity, and notify the account when the SSH address changes.'},
];

function DeveloperAPISection(){
 const [label,setLabel]=useState('Discord Bot');
 const [key,setKey]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [copied,setCopied]=useState(false);
 const endpoints=[
  {method:'GET',path:'/linux/price-list?currency=INR',description:'Browse all 256 Linux price IDs with real RAM/CPU prices and billing discounts.'},
  {method:'POST',path:'/create-order/linux/linux-r1-c1-m1?currency=INR',description:'Send rootPassword, os and region. Returns paymentId and hosted paymentUrl.'},
  {method:'GET',path:'/confirmation/devpay_YOUR_PAYMENT_ID',description:'Confirm captured payment, provisioning state and verified VPS SSH details.'},
 ];
 async function generateKey(){
  if(busy)return;
  setBusy(true);setKey('');setError('');
  try{
   const result=await apiRequest('/api/v1/developer/keys',{method:'POST',body:{label:label.trim()}});
   setKey(result?.apiKey||'');
   if(!result?.apiKey)throw Error('No API key was returned');
  }catch(e){setError(e.message||'Unable to generate developer key')}finally{setBusy(false)}
 }
 async function copy(value){
  try{await navigator.clipboard.writeText(value);setCopied(true);setTimeout(()=>setCopied(false),1800)}
  catch{setError('Clipboard is not available; select and copy the text manually.')}
 }
 const sample=`curl -X POST 'https://api.cloud.babiesiq.tech/create-order/linux/linux-r1-c1-m1?currency=INR' \\
  -H 'Authorization: Bearer YOUR_DEVELOPER_API_KEY' \\
  -H 'Idempotency-Key: order-unique-reference-12345' \\
  -H 'Content-Type: application/json' \\
  -d '{"os":"ubuntu-24","region":"ap-southeast","country":"IN","rootPassword":"YOUR_SECURE_16_PLUS_CHAR_ROOT_PASSWORD"}'`;
 return <section id="developer-api" className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8">
  <div className="flex items-center gap-2 text-emerald-600"><ApperIcon name="Code2" size={22}/><span className="text-xs font-bold uppercase tracking-widest">Developer API · Beta</span></div>
  <h2 className="mt-3 font-heading text-xl font-bold">Build VPS sales into Discord, Telegram or your website</h2>
  <p className="mt-2 text-sm leading-6 text-muted-foreground">Three integration calls. Your server/bot holds the private API key; end users only see the payment link. Buyer's VPS remains a Linux Railway container; shared host storage is ephemeral, not a dedicated SSD or static IP.</p>
  <div className="mt-5 space-y-2">
   {endpoints.map((x,i)=><div className="flex flex-col gap-1 rounded-lg bg-muted/40 p-3 sm:flex-row sm:items-start sm:gap-3" key={x.path}><span className="w-fit rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{x.method}</span><div className="min-w-0 flex-1"><code className="block break-all text-sm font-semibold">{x.path}</code><p className="mt-1 text-xs leading-5 text-muted-foreground">{x.description}</p></div><button type="button" className="w-fit rounded border px-2 py-1 text-xs" onClick={()=>copy('https://api.cloud.babiesiq.tech'+x.path)}>Copy URL</button></div>)}
  </div>
  <div className="mt-5 rounded-lg border p-4 text-xs leading-6 text-muted-foreground">
   <p><strong className="text-foreground">Price ID:</strong> `linux-r1-c1-m1` = 1 GB RAM, 1 vCPU, 1 month; other terms are 3, 6, 12 months. Use `?currency=USD&country=US` for eligible PayPal currency pricing; `#USD` is not an API query.</p>
   <p className="mt-2"><strong className="text-foreground">Auth:</strong> Add `Authorization: Bearer YOUR_DEVELOPER_API_KEY` to create-order and confirmation. Add a unique `Idempotency-Key` to create-order so retries cannot charge twice.</p>
   <p className="mt-2"><strong className="text-foreground">Password:</strong> Send `rootPassword` privately in the JSON request, not the URL. It must contain 16–128 characters and at least three character classes. Confirmation returns `vps.babiesiq.tech`, port, username `root`, unique VPS ID and the `VPS_ID:YOUR_VPS_PASSWORD` example only after real SSH readiness. It never returns the actual password.</p>
   <p className="mt-2"><strong className="text-foreground">Payment:</strong> INR uses Razorpay hosted payment link. Eligible supported non-INR currencies use PayPal Orders v2 approval. The actual total is locked at creation; a verified captured payment triggers provisioning. While pending, keep polling confirmation using your paymentId. Never trust a browser redirect as payment proof.</p>
  </div>
  <div className="mt-5">
   <p className="text-sm font-semibold">Create an API key for your logged-in BabiesIQ account</p>
   <p className="mt-1 text-xs text-muted-foreground">Generate only when Developer API access is enabled. The key is displayed once. Never paste it into public Discord commands, website JavaScript, GitHub or screenshots.</p>
   <div className="mt-3 flex flex-wrap gap-2">
    <input value={label} onChange={e=>setLabel(e.target.value)} maxLength={60} aria-label="API key label" className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-2 text-sm" placeholder="Discord bot / My backend"/>
    <button type="button" disabled={busy||label.trim().length<2} onClick={generateKey} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy?'Creating…':'Generate API key'}</button>
   </div>
   {error&&<p role="alert" className="mt-2 text-xs text-amber-600">{error}</p>}
   {key&&<div className="mt-3 rounded-lg border p-3"><p className="text-xs font-semibold">Save this key securely — it will not be shown again.</p><code className="mt-2 block break-all text-xs">{key}</code><button type="button" className="mt-2 rounded border px-3 py-1 text-xs" onClick={()=>copy(key)}>{copied?'Copied':'Copy key'}</button><button type="button" className="ml-2 rounded border px-3 py-1 text-xs" onClick={()=>setKey('')}>Clear from screen</button></div>}
  </div>
  <div className="mt-5"><p className="text-xs font-semibold">Example create-order request (server-side only)</p><pre className="mt-2 overflow-auto rounded-lg bg-muted/50 p-4 text-xs leading-5"><code>{sample}</code></pre></div>
 </section>
}

export default function Docs() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-17">
      <SectionHead eyebrow="Knowledge base / Preview" title="BabiesIQ Cloud documentation" description="Learn how BabiesIQ Cloud hosting works, including important provider limitations and safety precautions."/>
      <div className="grid gap-5 md:grid-cols-2">
        {blocks.map(x=>(
          <div key={x.title} className="rounded-md border border-border bg-card p-7">
            <ApperIcon name={x.icon} size={22} className="text-primary"/>
            <h2 className="mt-5 font-heading text-base font-bold">{x.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{x.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 rounded-md border border-border bg-card p-7">
        <h2 className="font-heading text-lg font-bold">Typical custom-domain workflow</h2>
        <ol className="mt-5 list-inside list-decimal space-y-4 text-sm leading-7 text-muted-foreground">
          <li>The customer enters and proves control of the hostname.</li>
          <li>The operator backend registers the hostname against the correct Railway HTTP service.</li>
          <li>The backend returns the exact CNAME/TXT records provided by Railway.</li>
          <li>The customer adds the records at their DNS provider and requests a verification refresh.</li>
          <li>The backend checks Railway ownership verification and routing status before marking it verified.</li>
        </ol>
        <p className="mt-5 text-xs text-warning">Live DNS targets are shown in your VPS Domain Management page after Railway accepts the custom hostname. Verify those records before changing your DNS.</p>
      </div>
      <DeveloperAPISection/>
      <div className="mt-9 flex gap-5 text-sm"><Link to="/dashboard/instances/new" className="font-semibold text-primary">Configure an instance →</Link><Link to="/terms" className="font-semibold text-muted-foreground">Read service terms →</Link></div>
    </div>
  );
}
