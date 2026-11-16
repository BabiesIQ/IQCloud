import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sdk } from '@/services/sdk';
import { useFetch } from '@/hooks/useFetch';
import { ListSkeleton, DetailSkeleton } from '@/components/PageSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ApperIcon from '@/components/ApperIcon';
import { toast } from 'sonner';
import { BackLink, Status, formatMoney } from '@/components/cloud/CloudUI';
import { formatLocalDate, DATE_FORMATS } from '@/utils/date';

const { contains, eq } = window.ApperSDK.CoreSDK;

export const RESOURCE = {
  instances: {
    table: 'instances_c', title: 'Instances', singular: 'Instance', icon: 'Server',
    subtitle: 'Monitor your cloud configurations and instance requests.',
    fields: ['Name','region_c','os_c','cpu_c','ram_c','status_c','price_c','term_c','endpoint_c'],
    filter: 'status_c', filterOptions: ['All','Running','Provisioning','Stopped','Pending'],
    labels: {
      Name:'Server name',region_c:'Region',os_c:'Operating system',cpu_c:'vCPU',
      ram_c:'Memory (GB)',status_c:'State',
      price_c:'Monthly price (INR)',term_c:'Billing cycle',endpoint_c:'SSH endpoint'
    },
    types: {cpu_c:'number',ram_c:'number',price_c:'number',region_c:'select',os_c:'select',status_c:'select',term_c:'select'},
    values: {region_c:['ap-southeast','us-west','eu-west','us-east'],os_c:['Ubuntu 24.04 LTS','Debian 12'],status_c:['Running','Provisioning','Stopped','Pending'],term_c:['Monthly','Yearly']},
    defaults: {Name:'new-app-server',region_c:'ap-southeast',os_c:'Ubuntu 24.04 LTS',cpu_c:2,ram_c:4,status_c:'Pending',price_c:185,term_c:'Monthly',endpoint_c:'Not assigned'},
  },
  domains: {
    table:'domains_c',title:'Domains',singular:'Domain',icon:'Globe2',
    subtitle:'Manage website hostnames and review the DNS records for each.',
    fields:['Name','hostname_c','target_c','status_c','record_type_c','instance_name_c'],
    filter:'status_c',filterOptions:['All','Verified','Unverified','Pending'],
    labels:{Name:'Domain label',hostname_c:'Hostname',target_c:'CNAME target',status_c:'Verification',record_type_c:'DNS record type',instance_name_c:'Linked instance'},
    types:{status_c:'select',record_type_c:'select'},
    values:{status_c:['Unverified','Pending','Verified'],record_type_c:['CNAME','TXT']},
    defaults:{Name:'app.yourdomain.com',hostname_c:'app.yourdomain.com',target_c:'Pending assignment',status_c:'Unverified',record_type_c:'CNAME',instance_name_c:'my-cloud-server'},
  },
  invoices: {
    table:'invoices_c',title:'Invoices',singular:'Invoice',icon:'ReceiptText',
    subtitle:'View sample billing statements. No payments or collections are performed.',
    fields:['Name','amount_c','status_c','due_c','description_c'],
    filter:'status_c',filterOptions:['All','Paid','Pending','Overdue'],
    labels:{Name:'Invoice number',amount_c:'Amount (INR)',status_c:'Payment status',due_c:'Due date',description_c:'Description'},
    types:{amount_c:'number',status_c:'select',due_c:'date'},
    values:{status_c:['Paid','Pending','Overdue']},
    defaults:{Name:'BIC-2026-NEW',amount_c:899,status_c:'Pending',due_c:'2026-12-01',description_c:'Demo invoice — not payable'},
  },
  tickets: {
    table:'tickets_c',title:'Support tickets',singular:'Ticket',icon:'LifeBuoy',
    subtitle:'Track requests, questions and support status.',
    fields:['Name','topic_c','status_c','priority_c','message_c'],
    filter:'status_c',filterOptions:['All','Open','Pending','Resolved'],
    labels:{Name:'Subject',topic_c:'Category',status_c:'Status',priority_c:'Priority',message_c:'Description'},
    types:{topic_c:'select',status_c:'select',priority_c:'select',message_c:'textarea'},
    values:{topic_c:['Networking','Domains','Storage','Billing','SSH','Compute','Regions','API'],status_c:['Open','Pending','Resolved'],priority_c:['High','Medium','Low']},
    defaults:{Name:'Help with my server',topic_c:'Networking',status_c:'Open',priority_c:'Medium',message_c:'I have a question about my cloud setup.'},
  },
};

const cell = (key, value) => {
  if (key === 'status_c') return <Status value={value} />;
  if (key === 'price_c' || key === 'amount_c') return <span className="font-heading font-semibold">{formatMoney(value)}</span>;
  if (key === 'due_c') return value ? formatLocalDate(value, DATE_FORMATS.SHORT) : '—';
  return <span className="break-words">{value == null || value === '' ? '—' : String(value)}</span>;
};

export function RecordFields({ config, form, setForm, isEdit = false }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {config.fields.map((field) => {
        const type = config.types[field] || 'text';
        const value = form[field] ?? '';
        return (
          <div key={field} className={type==='textarea'?'sm:col-span-2':''}>
            <Label htmlFor={'field-'+field}>{config.labels[field]}</Label>
            {type === 'select' ? (
              <select id={'field-'+field} value={value} onChange={(e)=>setForm({...form,[field]:e.target.value})}
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {(config.values[field] || []).map((choice)=><option key={choice} value={choice}>{choice}</option>)}
              </select>
            ) : type === 'textarea' ? (
              <textarea id={'field-'+field} value={value} rows={4} onChange={(e)=>setForm({...form,[field]:e.target.value})}
                placeholder="Describe your request" className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            ) : (
              <Input id={'field-'+field} className="mt-2" type={type} value={value}
                min={type==='number'?0:undefined} placeholder={config.labels[field]}
                onChange={(e)=>setForm({...form,[field]:type==='number'?Number(e.target.value):e.target.value})} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ResourceList({ kind }) {
  const config = RESOURCE[kind];
  const [search,setSearch] = useState('');
  const [status,setStatus] = useState('All');
  const [page,setPage] = useState(1);
  const [sort,setSort] = useState('newest');
  const [createOpen,setCreateOpen] = useState(false);
  const [form,setForm] = useState(config.defaults);
  const [saving,setSaving] = useState(false);
  const [confirmCreate,setConfirmCreate] = useState(false);

  const { data, loading, error, run } = useFetch(async () => {
    let query = sdk.table(config.table).select(['Id',...config.fields,'CreatedOn']);
    if (search.trim()) query = query.where(contains('Name',search.trim()));
    if (status !== 'All') query = query.where(eq(config.filter,status));
    query = sort==='oldest'?query.orderBy('CreatedOn'):query.orderByDesc('CreatedOn');
    const response = await query.page(page,8).fetch();
    if (!response.success) throw new Error(response.message);
    return { rows:response.data,total:response.total,hasMore:response.hasMore };
  },[kind,search,status,page,sort]);
  const rows = data?.rows ?? [];

  async function save() {
    if (!form.Name?.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const result = await sdk.table(config.table).create(form);
      if (!result.data?.length) {
        toast.error(result.messages?.[0] ?? 'Could not create record');
        return;
      }
      toast.success(config.singular+' created in demo');
      setCreateOpen(false);
      setConfirmCreate(false);
      setForm(config.defaults);
      run();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="font-heading text-[11px] font-bold uppercase tracking-widest text-primary">Cloud console / {kind}</p>
          <h1 className="mt-3 font-heading text-3xl font-bold">{config.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{config.subtitle}</p>
        </div>
        {kind!=='invoices' && (
          <Button onClick={()=>{setForm(config.defaults);setCreateOpen(true);}}>
            <ApperIcon name="Plus" size={17}/>{kind==='instances'?'New demo instance':kind==='domains'?'Add hostname':'New ticket'}
          </Button>
        )}
      </div>
      {kind==='instances' && <div className="mt-6 rounded-md border border-warning-border bg-warning-muted p-4 text-xs leading-6 text-warning">Instances in this demo are sample records, not actual BabiesIQ Cloud containers or dedicated virtual machines.</div>}
      {kind==='domains' && <div className="mt-6 rounded-md border border-warning-border bg-warning-muted p-4 text-xs leading-6 text-warning">DNS instructions are illustrative. No live BabiesIQ Cloud hostname has been assigned and no actual DNS verification is run.</div>}
      <div className="mt-8 overflow-hidden rounded-md border border-border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative min-w-[210px] flex-1">
            <ApperIcon name="Search" size={16} className="absolute left-3 top-3 text-muted-foreground"/>
            <Input className="pl-9" placeholder={'Search '+config.title.toLowerCase()+'...'} value={search}
              onChange={(e)=>{setSearch(e.target.value);setPage(1);}} />
          </div>
          <select aria-label="Filter by status" value={status} onChange={(e)=>{setStatus(e.target.value);setPage(1);}}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            {config.filterOptions.map(x=><option key={x} value={x}>{x==='All'?'All statuses':x}</option>)}
          </select>
          <select aria-label="Sort records" value={sort} onChange={(e)=>{setSort(e.target.value);setPage(1);}}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="newest">Newest first</option><option value="oldest">Oldest first</option>
          </select>
        </div>
        {loading && data===undefined ? <div className="p-5"><ListSkeleton rows={7}/></div> : error ? (
          <div className="p-10 text-center text-sm text-destructive">{error.message ?? String(error)} <Button variant="outline" onClick={run} className="ml-3">Retry</Button></div>
        ) : rows.length===0 ? (
          <div className="grid place-items-center gap-3 p-16 text-center"><ApperIcon name={config.icon} size={30} className="text-muted-foreground"/><p className="font-semibold">No matching {config.title.toLowerCase()}</p><p className="text-sm text-muted-foreground">Adjust your search and filters.</p></div>
        ) : (
          <div className={loading?'opacity-60 transition-opacity':''} aria-busy={loading}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Name</th>
                    <th className="px-5 py-4 font-semibold">{config.labels[config.filter]}</th>
                    <th className="hidden px-5 py-4 font-semibold md:table-cell">{config.labels[config.fields[1]]}</th>
                    <th className="hidden px-5 py-4 font-semibold lg:table-cell">{config.labels[config.fields[2]]}</th>
                    <th className="px-5 py-4 text-right font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((record)=>(
                    <tr key={record.Id} className="hover:bg-accent/35">
                      <td className="px-5 py-4"><div className="font-semibold">{record.Name}</div><div className="mt-1 font-heading text-[10px] text-muted-foreground">{String(record.Id).slice(0,8)}</div></td>
                      <td className="px-5 py-4">{cell(config.filter,record[config.filter])}</td>
                      <td className="hidden px-5 py-4 text-muted-foreground md:table-cell">{cell(config.fields[1],record[config.fields[1]])}</td>
                      <td className="hidden px-5 py-4 text-muted-foreground lg:table-cell">{cell(config.fields[2],record[config.fields[2]])}</td>
                      <td className="px-5 py-4 text-right"><Link to={'/'+kind+'/'+record.Id} className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">Open <ApperIcon name="ArrowUpRight" size={14}/></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-border px-5 py-4 text-xs text-muted-foreground">
              <span>{data?.total ?? 0} total records • page {page}</span>
              <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Previous</Button><Button size="sm" variant="outline" disabled={!data?.hasMore} onClick={()=>setPage(p=>p+1)}>Next</Button></div>
            </div>
          </div>
        )}
      </div>

      {kind !== 'invoices' && (
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader><DialogTitle>New {config.singular.toLowerCase()} (demo)</DialogTitle></DialogHeader>
            <p className="text-xs text-muted-foreground">Create a sample record for preview. It will not contact BabiesIQ Cloud or provision a server.</p>
            <form onSubmit={(e)=>{e.preventDefault();setConfirmCreate(true);}} className="space-y-6">
              <RecordFields config={config} form={form} setForm={setForm}/>
              <DialogFooter><Button type="button" variant="outline" onClick={()=>setCreateOpen(false)}>Cancel</Button><Button type="submit">Review demo record</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
      <AlertDialog open={confirmCreate} onOpenChange={setConfirmCreate}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Create {form.Name}?</AlertDialogTitle><AlertDialogDescription>This creates a demo record only. No real infrastructure will be provisioned.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button disabled={saving} onClick={save}>{saving?'Creating…':'Create demo record'}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function ResourceDetail({ kind, id }) {
  const config = RESOURCE[kind];
  const navigate = useNavigate();
  const [editing,setEditing] = useState(false);
  const [form,setForm] = useState(config.defaults);
  const [confirmDelete,setConfirmDelete] = useState(false);
  const [saving,setSaving] = useState(false);
  const {data:record,loading,error,run} = useFetch(async()=>{
    const r=await sdk.table(config.table).select(['Id',...config.fields,'CreatedOn']).get(id);
    return r.data;
  },[kind,id]);

  const beginEdit = () => {
    if (!record) return;
    setForm(Object.fromEntries(config.fields.map(field=>[field,record[field] ?? ''])));
    setEditing(true);
  };
  async function update() {
    if (!record || !form.Name?.trim()) { toast.error('A name is required'); return; }
    setSaving(true);
    try {
      const r=await sdk.table(config.table).update({Id:record.Id,...form});
      if (!r.data?.length) {toast.error(r.messages?.[0]??'Update failed');return;}
      toast.success(config.singular+' updated');
      setEditing(false);
      run();
    } finally {setSaving(false);}
  }
  async function remove() {
    if (!record) return;
    setSaving(true);
    try {
      const r=await sdk.table(config.table).remove([record.Id]);
      if (!r.data?.length) {toast.error(r.messages?.[0]??'Delete failed');return;}
      toast.success(config.singular+' deleted');
      navigate('/'+kind);
    } finally {setSaving(false);}
  }
  return (
    <div>
      <BackLink to={'/'+kind} label={'Back to '+config.title}/>
      {loading && record===undefined ? <DetailSkeleton/> : error ? (
        <div className="text-destructive">{error.message ?? String(error)} <Button variant="outline" onClick={run}>Retry</Button></div>
      ) : !record ? <div className="rounded-md border border-border bg-card p-12 text-center">Record not found.</div> : (
        <>
          <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
            <div><p className="font-heading text-[11px] uppercase tracking-widest text-primary">{kind} / details</p><h1 className="mt-3 font-heading text-3xl font-bold">{record.Name}</h1><div className="mt-3 flex items-center gap-3"><Status value={record.status_c}/><span className="font-heading text-xs text-muted-foreground">#{String(record.Id).slice(0,8)}</span></div></div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={beginEdit}><ApperIcon name="Pencil" size={16}/> Edit</Button>
              <Button variant="outline" className="text-destructive" onClick={()=>setConfirmDelete(true)}><ApperIcon name="Trash2" size={16}/> Delete</Button>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_310px]">
            <div className="rounded-md border border-border bg-card p-6">
              <h2 className="font-heading text-lg font-bold">Configuration & details</h2>
              <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {config.fields.map((field)=>(
                  <div key={field} className="border-b border-border pb-5">
                    <div className="text-xs text-muted-foreground">{config.labels[field]}</div>
                    <div className="mt-2 text-sm font-semibold">{cell(field,record[field])}</div>
                  </div>
                ))}
              </div>
            </div>
            <aside className="space-y-5">
              <div className="rounded-md border border-border bg-card p-6">
                <div className="font-heading text-sm font-bold">About this record</div>
                <p className="mt-4 text-xs leading-6 text-muted-foreground">Created {record.CreatedOn ? formatLocalDate(record.CreatedOn,DATE_FORMATS.SHORT) : 'recently'}</p>
                <p className="mt-4 text-xs leading-6 text-muted-foreground">This is demonstration data. BabiesIQ Cloud operations, actual DNS verification and payment status are not connected.</p>
              </div>
              {kind==='domains' && (
                <div className="rounded-md border border-warning-border bg-warning-muted p-5 text-sm text-warning">
                  <b>DNS instructions (demo)</b>
                  <p className="mt-3 leading-6">Set the CNAME for your hostname to the target allocated by the real provisioning API. “Pending assignment” is not a usable DNS destination.</p>
                  <p className="mt-3 text-xs">Refreshing this page does not perform public DNS verification.</p>
                </div>
              )}
              {kind==='instances' && <div className="rounded-md border border-border bg-card p-5 text-xs leading-6 text-muted-foreground">Live BabiesIQ Cloud VPSs use the branded vps.babiesiq.tech SSH gateway and a shared TCP port. No dedicated IPv4 address is promised.</div>}
            </aside>
          </div>
        </>
      )}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>Edit {config.singular.toLowerCase()}</DialogTitle></DialogHeader>
          <form className="space-y-6" onSubmit={(e)=>{e.preventDefault();update();}}>
            <RecordFields config={config} form={form} setForm={setForm} isEdit/>
            <DialogFooter><Button type="button" variant="outline" onClick={()=>setEditing(false)}>Cancel</Button><Button disabled={saving} type="submit">{saving?'Saving…':'Save changes'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete {record?.Name}?</AlertDialogTitle><AlertDialogDescription>This permanently removes this demo record. It cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Keep record</AlertDialogCancel><Button disabled={saving} variant="destructive" onClick={remove}>{saving?'Deleting…':'Delete record'}</Button></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
