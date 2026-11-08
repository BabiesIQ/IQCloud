import { ResourceList } from '@/components/cloud/Records';

export const route = { path: '/invoices', layout: 'owner', access: 'authenticated' };
export const nav = { icon: 'ReceiptText', label: 'Billing & invoices', section: 'Account', order: 40, profiles: null };

export default function Invoices() {
  return <ResourceList kind="invoices" />;
}
