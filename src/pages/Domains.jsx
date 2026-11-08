import { ResourceList } from '@/components/cloud/Records';

export const route = { path: '/domains', layout: 'owner', access: 'authenticated' };
export const nav = { icon: 'Globe2', label: 'Domains & DNS', section: 'Infrastructure', order: 30, profiles: null };

export default function Domains() {
  return <ResourceList kind="domains" />;
}
