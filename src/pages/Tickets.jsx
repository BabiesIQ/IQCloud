import { ResourceList } from '@/components/cloud/Records';

export const route = { path: '/tickets', layout: 'owner', access: 'authenticated' };
export const nav = { icon: 'LifeBuoy', label: 'Support tickets', section: 'Account', order: 50, profiles: null };

export default function Tickets() {
  return <ResourceList kind="tickets" />;
}
