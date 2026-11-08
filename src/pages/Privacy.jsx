import { Link } from 'react-router-dom';
import { BackLink } from '@/components/cloud/CloudUI';

export const route = { path: '/privacy', layout: 'public', access: 'public' };

const sections=[
 ['Information collected','A production account may process customer name, contact details, verified email, billing information, IP and network logs, domain records, requested server configuration, support messages, audit records and provider transaction identifiers. The current demo uses illustrative data.'],
 ['Why information is processed','Future processing would cover account access, technical service delivery, fraud and abuse prevention, customer support, order and payment reconciliation, security monitoring and legal obligations.'],
 ['Payments and third parties','Payments should be processed through an approved payment gateway; full payment-card details must not be stored by the platform. Railway or another hosting provider may process necessary operational configuration information.'],
 ['Security and access','Production controls should include encrypted transport, hashed credentials, server-side authorization, tenant-isolation policies, audit trails, secret storage and restricted administrator access.'],
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
