import { useParams } from 'react-router-dom';
import { ResourceDetail } from '@/components/cloud/Records';

export const route = { path: '/instances/:id', layout: 'owner', access: 'authenticated' };

export default function InstanceDetail() {
  const { id } = useParams();
  return <ResourceDetail kind="instances" id={id}/>;
}
