import { Link } from 'react-router-dom';
import { BackLink } from '@/components/cloud/CloudUI';

export const route = { path: '/refund-policy', layout: 'public', access: 'public' };

export default function RefundPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <BackLink to="/" label="Back to home"/>
      <p className="font-heading text-xs uppercase tracking-widest text-primary">Legal / Draft preview</p>
      <h1 className="mt-4 font-heading text-4xl font-bold">Cancellation & refunds</h1>
      <div className="mt-9 space-y-8 border-t border-border pt-9 text-sm leading-8 text-muted-foreground">
        <p>PayPal and Razorpay checkouts may collect real payments for eligible orders. This is a draft refund-policy overview, not a finalized policy. Keep your payment reference and check the amount and billing term before approving a purchase.</p>
        <section><h2 className="font-heading text-base font-bold text-foreground">Customer protections and refunds</h2><p className="mt-3">The operator must clearly publish refund eligibility, cancellation procedures, taxes and dispute-resolution contacts. This draft does not limit any statutory consumer rights.</p></section>
        <section><h2 className="font-heading text-base font-bold text-foreground">Unfulfilled or failed orders</h2><p className="mt-3">If payment is confirmed but a VPS cannot be provisioned, the order must be reconciled and the customer informed of applicable refund or reversal options through the original payment method where supported. Do not pay twice for the same order.</p></section>
        <section><h2 className="font-heading text-base font-bold text-foreground">Renewal and cancellation</h2><p className="mt-3">Renewing a VPS requires a new verified payment; recurring auto-debits are not enabled. The dashboard shows service validity. Expiry, redeployment or permanent deletion can erase ephemeral files, so back up important data.</p></section>
        <section><h2 className="font-heading text-base font-bold text-foreground">Policy status</h2><p className="mt-3">This is draft product copy and does not promise a finalized refund window or override applicable consumer law. Obtain legal review before commercial launch.</p></section>
      </div>
      <p className="mt-12 text-sm">Review the <Link to="/terms" className="font-semibold text-primary">Terms of service</Link>.</p>
    </div>
  );
}
