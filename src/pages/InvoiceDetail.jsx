import { useParams } from 'react-router-dom';
import { ResourceDetail } from '@/components/cloud/Records';

export const route = { path: '/invoices/:id', layout: 'owner', access: 'authenticated' };

export default function InvoiceDetail() {
  const { id } = useParams();
  return <ResourceDetail kind="invoices" id={id}/>;
}
