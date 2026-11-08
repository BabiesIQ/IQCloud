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
        <p>BabiesIQ Cloud currently operates as a non-billable preview. No real payments are processed, so there are no preview purchases to refund or subscriptions to cancel.</p>
        <section><h2 className="font-heading text-base font-bold text-foreground">Before real subscriptions launch</h2><p className="mt-3">We must publish the exact activation point, cancellation method, recurring-billing terms, refund eligibility, any pro-rata rules, applicable taxes and dispute-resolution process before charging customers.</p></section>
        <section><h2 className="font-heading text-base font-bold text-foreground">Unfulfilled or failed orders</h2><p className="mt-3">The intended production workflow should clearly distinguish a paid but unfulfilled request from a provisioned resource. Failed fulfillment would require a documented refund or reversal process through the same approved payment method where supported.</p></section>
        <section><h2 className="font-heading text-base font-bold text-foreground">Renewal and cancellation</h2><p className="mt-3">A customer should be able to see their renewal date and cancel future billing in the console. Data deletion and backup grace periods must be explicitly communicated before termination.</p></section>
        <section><h2 className="font-heading text-base font-bold text-foreground">Policy status</h2><p className="mt-3">This is draft product copy and does not promise a finalized refund window or override applicable consumer law. Obtain legal review before commercial launch.</p></section>
      </div>
      <p className="mt-12 text-sm">Review the <Link to="/terms" className="font-semibold text-primary">Terms of service</Link>.</p>
    </div>
  );
}
