import { useParams } from 'react-router-dom';
import { ResourceDetail } from '@/components/cloud/Records';

export const route = { path: '/domains/:id', layout: 'owner', access: 'authenticated' };

export default function DomainDetail() {
  const { id } = useParams();
  return <ResourceDetail kind="domains" id={id}/>;
}
