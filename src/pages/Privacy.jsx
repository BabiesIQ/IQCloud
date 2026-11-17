import { Link } from 'react-router-dom';
import { BackLink } from '@/components/cloud/CloudUI';

export const route = { path: '/privacy', layout: 'public', access: 'public' };

const sections=[
 ['Information collected','A production account may process customer name, contact details, verified email, billing information, IP and network logs, domain records, requested server configuration, support messages, audit records and provider transaction identifiers. Some preview elements may contain illustrative data, but real account, billing and server operations can process the information listed here.'],
 ['Why information is processed','Account access, technical service delivery, fraud and abuse prevention, support, payment reconciliation, server expiry warnings, email notification delivery, and lawful retention of billing records. Renewal notices are sent to registered account email addresses.'],
 ['Payments and third parties','Razorpay or PayPal handles payments depending on the eligible buyer and selected gateway; full card details are not stored by BabiesIQ Cloud. We store the selected billing term, discount, payment gateway order/reference, verified payment status and VPS expiry timestamp to manage renewals and expiration. BabiesIQ Cloud and its contracted infrastructure processors handle operational service information needed to deliver the service.'],
 ['Security and access','Server root passwords are encrypted at configuration time and are never included in server-list responses or emails. Eligible users may reveal an encrypted saved root password once after deployment; it is then deleted. Forgotten root passwords cannot be recovered. A separate authenticated reset uses registered-email OTP and cloud account reauthentication (when password-based); the chosen new root password is sent as a service-scoped provider secret, not by email, and applying it can redeploy the container. Production controls also require encrypted transport, authenticated access, audit trails and tenant isolation.'],
 ['IP and SSH privacy','BabiesIQ Cloud supports IPv4 and IPv6 networking. The managed SSH gateway supplies the assigned hostname and port, while public IP address assignment and inbound routes depend on the instance configuration. The dashboard may mask hostnames on-screen, but authenticated owners can copy their actual connection details. A dedicated static IP is available only if explicitly assigned. During verified infrastructure recovery, the SSH endpoint may change; account notifications provide details without exposing root passwords.'],
 ['Retention and user rights','Production retention schedules and mechanisms for access, correction, export and deletion requests must be published. Some records may need lawful retention for invoices or incident handling.'],
 ['Cookies and analytics','Any essential session cookies and optional analytics or marketing tracking must be disclosed before launch, with consent controls where required.'],
 ['International hosting regions','Selecting a hosting region may place service data in another country. Any cross-border personal-data processing must comply with applicable law and contractual safeguards.'],
 ['Contact and changes','Before public launch, publish the actual data-controller legal entity, privacy contact, effective date and grievance or complaint channel. This is a product-design draft, not a finalized legal notice.'],
];

export default function Privacy() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <BackLink to="/" label="Back to home"/>
      <p className="font-heading text-xs uppercase tracking-widest text-primary">Legal / Draft preview</p>
      <h1 className="mt-4 font-heading text-4xl font-bold">Privacy policy</h1>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">Effective draft: 6 November 2026. A transparent starting point for the future platform, subject to legal review and actual data practices.</p>
      <div className="mt-10 space-y-9 border-t border-border pt-9">
        {sections.map(([title,text])=><section key={title}><h2 className="font-heading text-base font-bold">{title}</h2><p className="mt-3 text-sm leading-8 text-muted-foreground">{text}</p></section>)}
      </div>
      <p className="mt-12 text-sm">Read our <Link to="/terms" className="font-semibold text-primary">Terms of service</Link>.</p>
    </div>
  );
}
