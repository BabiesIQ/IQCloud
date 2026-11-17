import { Link } from 'react-router-dom';
import { BackLink } from '@/components/cloud/CloudUI';

export const route = { path: '/terms', layout: 'public', access: 'public' };

const clauses=[
  ['1. Service description','BabiesIQ Cloud provides managed Linux containers for eligible verified orders. These are shared-kernel containers, not fully virtualized VMs or Windows RDP. Provider capacity, availability and service-level commitments depend on the actual offering.'],
  ['2. Eligibility and use','Future users must be legally eligible to enter binding contracts and may use the service only for lawful purposes. Spam, malware, unauthorized intrusion, abusive scraping, illicit content and other prohibited activity would not be allowed.'],
  ['3. Resource allocation','Selected vCPU and memory are compute resources. No individual SSD quota is sold: container root storage uses a shared ephemeral host filesystem and files may be lost on redeploy. Shared host capacity is not a customer entitlement. IPv4 and IPv6 networking is supported, with SSH access via the assigned hostname and port; public IP assignments and dedicated or static address availability depend on each instance’s configuration. Real network throughput depends on source and destination server limits, available bandwidth, routing and traffic; no fixed Mbps or Gbps rate is guaranteed. Containerized environments share a host kernel, with no promise of dedicated hardware or unrestricted root capabilities.'],
  ['4. Availability and changes','Regions, supported operating-system images, prices, uptime, network ingress, quotas and volume limits will depend on provider capacity, service plan and applicable terms. They may change before sale.'],
  ['5. Payment and renewal','Compute prices are based on INR monthly rates, with 1 month (0% off), 3 months (7% off), 6 months (14% off) and 12 months (30% off). Discounts apply to the full term subtotal. Razorpay handles eligible India checkout and PayPal supports eligible international buyers in provider-supported currencies. The payment gateway confirms the final payable currency and amount. Renewals require a new verified payment and do not create automatic recurring debits.'],
  ['6. Customer content and security','Customers are responsible for uploaded content, domain ownership, access keys and lawful operations. Root passwords chosen at configuration are encrypted and retained temporarily for a one-time authenticated reveal after provisioning; they are not included in notification emails. Older server passwords that were deleted cannot be recovered from this service. Customers must securely save their secrets and keep independent backups.'],
  ['7. Custom domain routing','A domain would require customer DNS control and registration against the correct hosting service. Propagation times vary; verification is not guaranteed. The system will not claim domain ownership merely because DNS is entered.'],
  ['8. Expiry, suspension and data loss','For newly purchased time-limited plans, validity begins once the instance is SSH-ready. An email and in-app reminder are scheduled three days before expiration. If not renewed, the BabiesIQ Cloud deployment is stopped when the billing period expires. Paying to renew extends the same service validity; restoring a stopped container requires redeployment and may permanently lose files on ephemeral root storage. Please back up data and renew before expiry. Previously created legacy instances without billing expiry are not automatically assigned a deadline. Abuse and security enforcement may be handled separately.'],
  ['8A. Password resets and networking changes','An instance root password reset requires authenticated ownership verification and email OTP. It may cause the same BabiesIQ Cloud service to redeploy, permanently erasing ephemeral files. Adding an inbound HTTP domain may also interrupt container operation. Outbound port-level firewall rules and additional raw TCP proxies are not promised. Customers must accept the relevant data-loss warning before changes.'],
  ['8B. Provider account recovery','A token change alone never authorizes a new billable customer container. Only an operator-confirmed deletion of an old provider service, an authorized new infrastructure project, and an active paid plan may trigger a replacement. The replacement SSH hostname, port and possibly root password can change; the owner receives an account notification. Ephemeral data is not migrated.'],
  ['9. Liability and support','The preview is provided without service-level guarantees. A production agreement must separately define uptime commitments, support response targets, data retention and limits of liability, as permitted by applicable law.'],
  ['10. Updates and contact','This is a draft policy for product design, not finalized legal advice. Before accepting customers, publish the legal business name, registered address, official support channel, effective date and jurisdiction-specific consumer terms.'],
];

export default function Terms() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <BackLink to="/" label="Back to home"/>
      <p className="font-heading text-xs uppercase tracking-widest text-primary">Legal / Draft preview</p>
      <h1 className="mt-4 font-heading text-4xl font-bold">Terms of service</h1>
      <p className="mt-4 border-b border-border pb-8 text-sm leading-7 text-muted-foreground">Draft updated 12 November 2026. These conditions explain the proposed service model; they are not a substitute for a legally reviewed agreement.</p>
      <div className="mt-9 space-y-9">
        {clauses.map(([title,description])=>(
          <section key={title}><h2 className="font-heading text-base font-bold">{title}</h2><p className="mt-3 text-sm leading-8 text-muted-foreground">{description}</p></section>
        ))}
      </div>
      <div className="mt-12 border-t border-border pt-7 text-sm text-muted-foreground">Also see the <Link className="font-semibold text-primary" to="/privacy">Privacy policy</Link> and <Link className="font-semibold text-primary" to="/refund-policy">Refund policy</Link>.</div>
    </div>
  );
}
