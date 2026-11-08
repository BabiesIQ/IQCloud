import { ResourceList } from '@/components/cloud/Records';

export const route = { path: '/instances', layout: 'owner', access: 'authenticated' };
export const nav = { icon: 'Server', label: 'Instances', section: 'Infrastructure', order: 20, profiles: null };

export default function Instances() {
  return <ResourceList kind="instances" />;
}
