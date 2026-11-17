<div align="center">

<img src="./assets/cloud-saas-live.svg" width="100%" alt="BabiesIQ Cloud animated SaaS banner with conceptual workspace" />

# ☁️ BabiesIQ Cloud
### Compute built around you.

**A SaaS-inspired cloud control panel for Linux containers, SSH access, billing, localization and developer integrations.**

[![Open Dashboard](https://img.shields.io/badge/OPEN-DASHBOARD-00bfa5?style=for-the-badge&logo=googlechrome&logoColor=white)](https://cloud.babiesiq.tech)
[![Developer Docs](https://img.shields.io/badge/DEVELOPER-API_DOCS-1383ae?style=for-the-badge&logo=readthedocs&logoColor=white)](https://cloud.babiesiq.tech/docs#developer-api)
[![Community](https://img.shields.io/badge/TELEGRAM-@BabiesIQ-2ca5e0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/BabiesIQ)

**Frontend:** [cloud.babiesiq.tech](https://cloud.babiesiq.tech) · **Go API:** [api.cloud.babiesiq.tech](https://api.cloud.babiesiq.tech/health) · **SSH:** <code>vps.babiesiq.tech</code>

</div>

> [!IMPORTANT]
> This repository contains the **React + Vite frontend only**. The Go API, MongoDB, Redis, payment credentials, infrastructure integrations and customer instances operate in separate server-side systems. This frontend is **not** a complete VPS provider by itself. The animated SVG is a SaaS illustration and **does not show live uptime or CPU metrics**.

---

## ◈ Navigation & Quick Links

| ▸ Destination | ▸ Open |
|:--|:--|
| **Dashboard** | [Launch BabiesIQ Cloud](https://cloud.babiesiq.tech) |
| **Pricing** | [See eligible plans](https://cloud.babiesiq.tech/pricing) |
| **Developer API Guide** | [API keys, price IDs, orders and cURL](https://cloud.babiesiq.tech/docs#developer-api) |
| **Documentation** | [Read website and service guides](https://cloud.babiesiq.tech/docs) |
| **Terms of Service** | [Service conditions](https://cloud.babiesiq.tech/terms) |
| **Privacy Policy** | [Privacy information](https://cloud.babiesiq.tech/privacy) |
| **Community & Updates** | [Telegram @BabiesIQ](https://t.me/BabiesIQ) |

<details>
<summary><b>⌄ OPEN README NAVIGATION — tap to explore the guides</b></summary>

- [Cloud features](#-cloud-features)
- [Architecture & stack](#-architecture--stack)
- [Quick Start](#-quick-start)
- [Host the frontend: Railway / Vercel / Netlify / Cloudflare / Render / Nginx](#-frontend-deployment)
- [Domains, Cloudflare DNS & SSL](#-domains-dns--ssl)
- [Host a website on a Linux VPS](#-host-websites-on-a-linux-vps)
- [Developer API & checkout flows](#-developer-api-guide)
- [Security & important limitations](#-security--important-limitations)
- [FAQ](#-frequently-asked-questions)
- [Contributing](#-contributing--community)

</details>

---

## ◆ Cloud Features

<table>
<tr><td width="50%" valign="top"><b>◈ Cloud Workspace</b><p>Responsive customer dashboard for accounts, instances, invoices and preferences.</p></td>
<td width="50%" valign="top"><b>◇ Linux Compute</b><p>RAM/vCPU plans, compatible Linux images, region choices and SSH gateway details after provisioning.</p></td></tr>
<tr><td valign="top"><b>⌘ Developer API</b><p>Price catalog, developer key management, order creation and verified provisioning workflow.</p></td>
<td valign="top"><b>▣ International Experience</b><p>Localization, country and currency selection, responsive UI, light and dark mode.</p></td></tr>
<tr><td valign="top"><b>✦ Domains & Networking</b><p>Customer domain connection workflow and provider-dependent port routing.</p></td>
<td valign="top"><b>◉ Payment & Security</b><p>Billing-duration selection, available payment gateways, account security and owner-only admin tools.</p></td></tr>
</table>

| Service | Status / important boundary |
|:--|:--|
| **Linux containers** | Supported configurations, subject to actual payment and provider availability |
| **RDP / Windows servers** | **COMING SOON** — not an available Linux VPS feature |
| **Billing** | Monthly, 3, 6 and 12-month terms; applicable discounts shown at checkout |
| **Currency & countries** | Localization and supported gateway combinations; not all payment routes are necessarily live |
| **SSH** | Server-provided gateway hostname and a per-instance port |
| **Storage** | Shared, **ephemeral** host filesystem; no dedicated SSD size guarantee |
| **IPv4/IPv6** | No dedicated incoming public IP address guaranteed per container |
| **Dashboard** | Frontend needs the separately deployed Go backend for real operations |
| **Admin panel** | Restricted server-authorized access at <code>/admin/login</code> |

> [!CAUTION]
> Do not confuse a host overlay filesystem with customer-owned multi-terabyte SSD storage. Do not promise static public IPv4, dedicated CPU, guaranteed bandwidth or RDP availability. Preserve backups before expiry or redeployment.

---

## ◇ Architecture & Stack

<div align="center">

<img src="./assets/cloud-architecture.svg" width="100%" alt="Architecture diagram: browser to React frontend to separate Go API and server-side services"/>

</div>

| Layer | Technology / location | Responsibilities |
|:--|:--|:--|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, React Router 7 | Pages, routing, localization and dashboards |
| **Backend** | **Go**, hosted separately at <code>https://api.cloud.babiesiq.tech</code> | Auth, APIs, payments, orders and provisioning |
| **Database** | MongoDB (backend) | Account, order and instance records |
| **Cache** | Redis (backend) | Caching, rate limits and transient workflows |
| **Billing** | Backend Razorpay / PayPal integrations | Gateway verification and order state |
| **Infrastructure** | Provider integration (backend only) | Cloud instance lifecycle |
| **SSH gateway** | <code>vps.babiesiq.tech</code> | User access using assigned connection details |

```text
Your browser
    │ HTTPS
    ▼
cloud.babiesiq.tech      React + Vite SPA (this repository)
    │ fetch / cookies
    ▼
api.cloud.babiesiq.tech  Go API (separate backend)
    ├── Authentication / email verification
    ├── Pricing / payments / developer keys
    ├── VPS provisioning / domains / SSH
    └── MongoDB / Redis / external services
```

<details>
<summary><b>⌄ Source structure — frontend and assets</b></summary>

```text
IQCloud/
├── assets/
│   ├── cloud-saas-live.svg        # animated README hero
│   └── cloud-architecture.svg     # animated system design
├── public/
│   ├── babiesiq-cloud-logo.svg   # site logo
│   └── assets/                  # site assets
├── src/
│   ├── App.jsx                  # app routes
│   ├── pages/                   # Home, Dashboard, Docs, Terms ...
│   ├── components/              # design and UI
│   ├── services/apiClient.js    # backend API client
│   ├── config/                  # runtime and plan configuration
│   └── i18n/                    # localization
├── scripts/                     # prebuild checks
├── .github/workflows/           # PR build validation
├── package.json
└── vite.config.js
```

**Note:** Root-level <code>assets/</code> is for GitHub README illustrations. The site’s runtime public assets are served from <code>public/</code>.

</details>

<details>
<summary><b>⌄ API boundary & frontend environment — read before forking</b></summary>

The current public API URL is **fixed** in <code>src/config/runtime.config.js</code> and <code>src/config/app.config.js</code>:

**https://api.cloud.babiesiq.tech**

There is **no supported VITE_API_URL override** in this version. Any alternate backend origin requires deliberate frontend changes and a matching backend CORS/origin/cookie configuration. Merely deploying this UI at another domain does not grant access to production logins, customer orders, or provisioned servers.

**Never** embed server API keys, root passwords, payment secrets or provider credentials in Vite environment variables; browser builds are public.

</details>

---

## ⚡ Quick Start

<details open>
<summary><b>01 · Install and run on your computer</b></summary>

**Requirements:** Node.js **24** (also used in the project’s GitHub Actions workflow), npm, Git and a browser.

```bash
git clone https://github.com/BabiesIQ/IQCloud.git
cd IQCloud
npm install --no-audit --no-fund
npm run dev
```

Vite will print the local URL, normally **http://localhost:5173**.

**Production build / preview:**

```bash
npm run build
npm run preview
```

| Script | Meaning |
|:--|:--|
| <code>npm run dev</code> | Starts Vite locally |
| <code>npm run build</code> | Runs repository prebuild checks and builds <code>dist/</code> |
| <code>npm run preview</code> | Previews the built frontend |
| <code>node scripts/check-active-routes.mjs</code> | Checks known frontend routes |

> Local UI works independently; production authentication may reject localhost because of backend origin and cookie controls. Do not relax production authentication to support a fork.

</details>

---

## 🚀 Frontend Deployment

This section covers **hosting the React SPA only**. The Go backend stays at **api.cloud.babiesiq.tech** and is **not changed by these instructions**.

<details>
<summary><b>▸ 01 · Railway — GitHub → build → domain</b></summary>

1. In [Railway](https://railway.com/), create a project and add a service connected to the **IQCloud** repository.
2. Use a compatible **Node.js 24** environment and install dependencies.
3. Build command: **<code>npm run build</code>**.
4. Serve the generated **<code>dist/</code>** folder with a static server supporting SPA route fallback.
5. A suitable example start command, if <code>serve</code> is available:

```bash
npx serve -s dist -l 3000
```

Set the listening port to your provider’s required PORT value if different; for Railway, make sure the server binds to the expected interface and port. This command is an example, not a checked-in runtime script.

6. Create the service domain, copy the **exact DNS record Railway provides**, verify SSL and test refreshes on <code>/docs</code>.

**Do not add production MongoDB, payment or infrastructure secrets to a frontend deployment.**

</details>

<details>
<summary><b>▸ 02 · Vercel — simple React hosting</b></summary>

1. [New Project](https://vercel.com/new) → import **BabiesIQ/IQCloud**.
2. Choose framework preset **Vite**.
3. Build command **<code>npm run build</code>**; output **<code>dist</code>**.
4. For direct navigation to nested SPA routes, use a rewrite to <code>/index.html</code>. Example <code>vercel.json</code> for **your fork**:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

5. Follow Vercel’s custom-domain DNS instructions. Backend origin authorization must be handled separately.

</details>

<details>
<summary><b>▸ 03 · Netlify — publish the Vite dist directory</b></summary>

1. [Netlify](https://app.netlify.com/start) → import repository.
2. Build: <code>npm run build</code>; publish: <code>dist</code>.
3. Add a SPA fallback to <code>public/_redirects</code> in **your fork**, if needed:

```text
/*    /index.html   200
```

4. Connect your domain via Netlify and verify HTTPS. The redirect file in this example is **not yet part of this repo**.

</details>

<details>
<summary><b>▸ 04 · Cloudflare Pages — GitHub and Pages</b></summary>

1. [Cloudflare dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → create a **Pages** project.
2. Connect this repo and branch.
3. Framework: **Vite**, build: <code>npm run build</code>, output: <code>dist</code>.
4. Choose a supported Node version (prefer Node 24 where supported).
5. Add a custom domain and confirm SPA deep-link routing and TLS with Cloudflare’s current Pages documentation.

Only the public UI is hosted here; API requests still go to the separate Go backend.

</details>

<details>
<summary><b>▸ 05 · Render — deploy a Static Site</b></summary>

1. [Render Dashboard](https://dashboard.render.com/) → **Static Site**.
2. Connect this GitHub repository.
3. Build: <code>npm install &amp;&amp; npm run build</code>.
4. Publish directory: <code>dist</code>.
5. Rewrite <code>/*</code> to <code>/index.html</code> using Render’s rewrite rules.
6. Attach your domain and validate HTTPS.

</details>

<details>
<summary><b>▸ 06 · Ubuntu VPS / Nginx — deploy static output</b></summary>

On an Ubuntu server **you manage**, install Node 24 separately, then:

```bash
sudo apt-get update
sudo apt-get install -y git nginx
git clone https://github.com/BabiesIQ/IQCloud.git
cd IQCloud
npm install --no-audit --no-fund
npm run build
sudo mkdir -p /var/www/iqcloud
sudo cp -a dist/. /var/www/iqcloud/
```

Example Nginx virtual host file:

```nginx
server {
    listen 80;
    server_name cloud.example.com;
    root /var/www/iqcloud;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Save it in an enabled Nginx server configuration and validate it:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Add DNS A/AAAA/CNAME records **as appropriate for the server you actually own**, open inbound ports and use an ACME certificate or managed TLS. Do not copy example domains as real records.

</details>

<details>
<summary><b>▸ 07 · Hosting providers at a glance</b></summary>

| Platform | Build | Directory | SPA routing |
|:--|:--|:--|:--|
| Railway | <code>npm run build</code> | <code>dist</code> | Static server with fallback |
| Vercel | <code>npm run build</code> | <code>dist</code> | Rewrite to <code>index.html</code> |
| Netlify | <code>npm run build</code> | <code>dist</code> | <code>_redirects</code> |
| Cloudflare Pages | <code>npm run build</code> | <code>dist</code> | Pages SPA routing |
| Render Static Site | <code>npm run build</code> | <code>dist</code> | Rewrite fallback |
| Nginx on VPS | <code>npm run build</code> | <code>/var/www/iqcloud</code> | <code>try_files</code> |

**Every option above is for the frontend.** Backend auth/payment/provisioning requires separate infrastructure and authorized domains.

</details>

---

## ◇ Domains, DNS & SSL

<details>
<summary><b>▸ Add a custom domain to your frontend</b></summary>

1. Decide the host, for example **cloud.example.com**.
2. In the **hosting provider dashboard**, add the domain and request its verification records.
3. Open your DNS provider (e.g., Cloudflare) and add the **exact record the hosting platform gives you**:

| Type | Name | Target |
|:--|:--|:--|
| CNAME, if directed | <code>cloud</code> | **Your host’s supplied CNAME target** |
| TXT, if directed | Exact requested name | Host’s verification token |

**Never put a TCP port in a DNS CNAME.** The hostname <code>api.cloud.babiesiq.tech</code> is the **existing backend**, not a generic frontend DNS target.

4. Wait for propagation and verify your HTTPS certificate.
5. Open <code>/docs</code>, <code>/pricing</code> and <code>/dashboard</code> directly and refresh.
6. Ensure backend CORS, cookie and origin allowlists explicitly permit the frontend domain when necessary.

</details>

<details>
<summary><b>▸ Connect a domain to a purchased Cloud container</b></summary>

1. Sign in at [BabiesIQ Cloud](https://cloud.babiesiq.tech).
2. Choose your instance and open its domain controls.
3. Select the app port **only if inbound HTTP routing is supported**.
4. Copy the exact dashboard-provided DNS record, add it in your DNS provider, and refresh validation.
5. Wait for certificate creation and check the application’s health.

SSH gateway access on <code>vps.babiesiq.tech</code> does **not** automatically expose ports 80/443 or provide a dedicated public IP.

</details>

<details>
<summary><b>▸ Fix SSL, Bad Gateway and DNS errors</b></summary>

| Problem | First checks |
|:--|:--|
| Home works, nested route returns 404 | SPA fallback missing |
| 502 Bad Gateway | App port, runtime health and reverse proxy |
| SSL error | Domain verification, certificate provisioning and DNS |
| Domain not connected | CNAME/TXT target and DNS propagation |
| Login fails only on custom domain | Backend origin/cookie policy |
| SSH works but web URL fails | SSH ingress is not HTTP ingress |

</details>

---

## ◈ Host Websites on a Linux VPS

Examples below apply to Ubuntu machines/containers with a working shell and **supported public HTTP routing**. BabiesIQ Cloud containers may use **ephemeral storage**; make backups before any redeploy.

<details>
<summary><b>▸ Step 1 · Connect by SSH</b></summary>

Use the actual hostname and assigned port shown in your server details:

```bash
ssh -p YOUR_ASSIGNED_PORT root@YOUR_ASSIGNED_HOST
```

For platform-specific password formats, use the connection instructions in the dashboard. Do not paste live credentials into public issues or README files.

</details>

<details>
<summary><b>▸ Step 2 · Create a basic HTML website</b></summary>

```bash
apt-get update
apt-get install -y nginx
mkdir -p /var/www/mysite
echo '<h1>Hello from BabiesIQ Cloud</h1>' > /var/www/mysite/index.html
```

Example server block:

```nginx
server {
    listen 80;
    server_name yourdomain.example;
    root /var/www/mysite;
    index index.html;
    location / { try_files $uri $uri/ =404; }
}
```

Enable the configuration, run <code>nginx -t</code> and reload Nginx. Check with <code>curl -I http://127.0.0.1/</code>. **A local response is not proof that the container’s public HTTP port is open.**

</details>

<details>
<summary><b>▸ Step 3 · Host a Node, Python or Go app behind Nginx</b></summary>

Start your app on a local port such as <code>127.0.0.1:3000</code>. Add a reverse-proxy location:

```nginx
server {
    listen 80;
    server_name app.yourdomain.example;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Use a reliable process supervisor and configure externally supported port/domain routing. Back up the project outside the container if its root filesystem is ephemeral.

</details>

---

## ⌘ Developer API Guide

<div align="center">

[![Developer API documentation](https://img.shields.io/badge/OPEN-COMPLETE_API_GUIDE-11b4a3?style=for-the-badge&logo=readthedocs&logoColor=white)](https://cloud.babiesiq.tech/docs#developer-api)

**API base URL:** https://api.cloud.babiesiq.tech

</div>

| Method | Endpoint | Function |
|:--|:--|:--|
| GET | <code>/linux/price-list?currency=INR</code> | Fetch Linux prices |
| POST | <code>/create-order/linux/{priceId}?currency=INR</code> | Create a developer order (private key required) |
| GET | <code>/confirmation/{paymentId}</code> | Inspect payment and provisioning result |
| — | <code>/api/v1/developer/keys</code> | Manage developer keys with authenticated account |

<details>
<summary><b>▸ Tutorial A · Get live plan prices</b></summary>

```bash
curl -sS "https://api.cloud.babiesiq.tech/linux/price-list?currency=INR"
```

Catalog responses include plan price IDs and a **checkoutEnabled** indicator. A listed plan is not proof that checkout or provisioning is enabled.

</details>

<details>
<summary><b>▸ Tutorial B · Secure VPS orders from your backend</b></summary>

1. Get a developer API key using a signed-in verified account.
2. Fetch the latest plan and choose a valid price ID.
3. Send <code>Authorization: Bearer</code> and a unique <code>Idempotency-Key</code>.
4. Save the payment ID and checkout link.
5. Poll the confirmation endpoint with the **same key**.
6. Release credentials only once the API confirms **payment verification and actual server provisioning**.

```bash
# RUN ONLY ON A TRUSTED BACKEND. All values below are placeholders.
curl -X POST \
  "https://api.cloud.babiesiq.tech/create-order/linux/linux-r1-c1-m1?currency=INR" \
  -H "Authorization: Bearer YOUR_PRIVATE_DEVELOPER_KEY" \
  -H "Idempotency-Key: YOUR_UNIQUE_ORDER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "country":"IN",
    "os":"ubuntu-24",
    "region":"ap-southeast",
    "rootPassword":"YOUR_LOCAL_STRONG_ROOT_PASSWORD"
  }'
```

Feature flags, eligible country, payment method, checkout readiness and provisioning capacity determine whether the request can succeed. **Never trust a payment screenshot or HTTP 200 alone.** See [Developer API documentation](https://cloud.babiesiq.tech/docs#developer-api) for full examples and response schemas.

</details>

<details>
<summary><b>▸ Tutorial C · API separation and configuration</b></summary>

This frontend uses **https://api.cloud.babiesiq.tech** from its existing runtime config.

The following belong to the **separate Go backend** and must **never** be put into public frontend assets or client variables:

- MongoDB connection credentials and Redis auth
- Razorpay/PayPal credentials, signature and webhook secrets
- Telegram bot tokens and private sessions
- Root passwords and SSH gateway credentials
- Infrastructure API keys and provisioning secrets
- OTP email-provider secrets and admin passwords

The backend is maintained and deployed independently. This documentation change does not modify its code or configuration.

</details>

---

## ▣ Security & Important Limitations

<details>
<summary><b>▸ Service model, access and data protection</b></summary>

- **User accounts:** protected by backend sessions and email verification; hiding a frontend route is not authorization.
- **Admin:** <code>/admin/login</code> is restricted; all permissions are checked by the backend.
- **Payments:** only verified, provider-confirmed payment events can authorize provisioning.
- **Password safety:** no actual root passwords, OTPs or access tokens should appear in this README or public issues.
- **Container data:** filesystem contents can disappear after restart/redeploy/expiry depending on service architecture; maintain external backups.
- **Networking:** a shared SSH gateway is not a dedicated IP.
- **Service terms:** [Terms](https://cloud.babiesiq.tech/terms) and [Privacy](https://cloud.babiesiq.tech/privacy) currently include draft policy content and should receive legal review before full public commercial operation.

</details>

<details>
<summary><b>▸ Before publishing the repository: security checklist</b></summary>

- [ ] Review **all Git history, branches and tags** for tokens, SSH keys, customer data, private URIs and credentials.
- [ ] Remove any exposed secrets from history and **rotate them** before opening the repository.
- [ ] Confirm that admin login email exposure and marketing assets are intentional.
- [ ] Review asset licensing and add a license appropriate for this project.
- [ ] Never make the separate backend/production secrets public by accident.

**GitHub visibility affects the entire repository history**, not just the files visible in the most recent commit.

</details>

---

## ◇ Frequently Asked Questions

<details>
<summary><b>Can I run the frontend without the backend?</b></summary>

Yes, as a static UI. But actual login, orders, domains, server state and paid provisioning require the separately deployed API and compatible origin settings.

</details>

<details>
<summary><b>Does this repo alone create working VPS services?</b></summary>

No. The frontend depends on remote auth, billing, provisioning and networking services. UI controls do not replace payment verification or real provider resources.

</details>

<details>
<summary><b>Does the animated live SVG show real-time telemetry?</b></summary>

No. It is an animated **brand illustration**. The actual backend/service health must be measured independently. Some SVG viewers may show a static frame.

</details>

<details>
<summary><b>Is Windows RDP available?</b></summary>

Not yet. **RDP is coming soon**; do not order it as a currently available option.

</details>

<details>
<summary><b>Can I host any website on my instance?</b></summary>

You can install a supported web runtime inside an eligible Linux container, but **public ingress, domains, SSL and storage persistence** depend on the actual provider and plan. Verify port support before relying on it.

</details>

---

## ♡ Contributing & Community

For UI improvements, build and test locally before opening a pull request:

```bash
git checkout -b feat/cloud-ui
npm install
node scripts/check-active-routes.mjs
npm run build
```

| Resource | Link |
|:--|:--|
| Website | [cloud.babiesiq.tech](https://cloud.babiesiq.tech) |
| Developer API Docs | [cloud.babiesiq.tech/docs#developer-api](https://cloud.babiesiq.tech/docs#developer-api) |
| Service Terms | [Terms & Conditions](https://cloud.babiesiq.tech/terms) |
| Privacy | [Privacy Policy](https://cloud.babiesiq.tech/privacy) |
| Telegram | [@BabiesIQ](https://t.me/BabiesIQ) |
| Source | [BabiesIQ/IQCloud](https://github.com/BabiesIQ/IQCloud) |

**License note:** No license file was added with this documentation. Public visibility does not automatically grant redistribution rights. The repository owner should select and review an appropriate software license separately.

---

<div align="center">

### ◈ Built for builders. Designed for clarity.

[![Dashboard](https://img.shields.io/badge/OPEN-DASHBOARD-00cda8?style=for-the-badge)](https://cloud.babiesiq.tech)
[![API Docs](https://img.shields.io/badge/VIEW-API_DOCS-148ca6?style=for-the-badge)](https://cloud.babiesiq.tech/docs#developer-api)
[![GitHub](https://img.shields.io/badge/VIEW-SOURCE-333b47?style=for-the-badge&logo=github)](https://github.com/BabiesIQ/IQCloud)

<sub>BabiesIQ Cloud · Frontend documentation · © 2026</sub>

</div>
