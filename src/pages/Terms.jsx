import { Link } from 'react-router-dom';
import { BackLink } from '@/components/cloud/CloudUI';

export const route = { path: '/terms', layout: 'public', access: 'public' };

const clauses=[
  ['1. Service description','BabiesIQ Cloud is currently piloting Railway-backed Linux containers for verified test orders. These are shared-kernel containers, not fully virtualized VMs or Windows RDP; commercial availability, billing and service levels are not yet broadly established.'],
  ['2. Eligibility and use','Future users must be legally eligible to enter binding contracts and may use the service only for lawful purposes. Spam, malware, unauthorized intrusion, abusive scraping, illicit content and other prohibited activity would not be allowed.'],
  ['3. Resource allocation','Selected vCPU and memory are compute resources. No individual SSD quota is sold: container root storage uses a shared ephemeral host filesystem and files may be lost on redeploy. Shared host capacity is not a customer entitlement and network speed targets are not guaranteed. Public SSH uses a provider-issued TCP proxy hostname and port; separately assigned inbound IPv4 and IPv6 addresses are not included or guaranteed. IPv4/IPv6 accessibility depends on provider routing and DNS. Containerized environments share a host kernel, with no promise of dedicated hardware, arbitrary root capabilities or static public IPv4.'],
  ['4. Availability and changes','Regions, supported operating-system images, prices, uptime, network ingress, quotas and volume limits will depend on provider capacity, service plan and applicable terms. They may change before sale.'],
  ['5. Payment and renewal','Published monthly compute prices are estimates for RAM and CPU only. Pilot checkout uses Razorpay Test Mode where enabled; actual commercial payment terms, taxes, renewals, cancellations and refunds must be disclosed and legally reviewed before launch.'],
  ['6. Customer content and security','Customers are responsible for uploaded content, domain ownership, access keys and lawful operations. Root passwords chosen at configuration are encrypted and retained temporarily for a one-time authenticated reveal after provisioning; they are not included in notification emails. Older server passwords that were deleted cannot be recovered from this service. Customers must securely save their secrets and keep independent backups.'],
  ['7. Custom domain routing','A domain would require customer DNS control and registration against the correct hosting service. Propagation times vary; verification is not guaranteed. The system will not claim domain ownership merely because DNS is entered.'],
  ['8. Suspension and misuse','A future service may suspend access for abuse, payment failure or infrastructure security threats, subject to a published notice, review and appeal policy.'],
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
