import { useParams } from 'react-router-dom';
import { ResourceDetail } from '@/components/cloud/Records';

export const route = { path: '/tickets/:id', layout: 'owner', access: 'authenticated' };

export default function TicketDetail() {
  const { id } = useParams();
  return <ResourceDetail kind="tickets" id={id}/>;
}
