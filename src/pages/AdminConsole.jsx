import {useEffect,useState,useCallback} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {apiRequest} from '@/services/apiClient';
import BrandLogo from '@/components/BrandLogo';
import AdminVPSManager from '@/components/AdminVPSManager';
import {Activity,AlertTriangle,ArrowLeft,ArrowRight,BarChart3,CalendarDays,CheckCircle2,ChevronLeft,ChevronRight,Clock3,CreditCard,Eye,EyeOff,FileClock,KeyRound,LoaderCircle,LockKeyhole,LogOut,RefreshCw,Search,Server,ShieldCheck,Trash2,Users,Wallet} from 'lucide-react';

const ADMIN_EMAIL='uk77061@gmail.com';
const SECTIONS=[
 {id:'overview',label:'Overview',icon:BarChart3},
 {id:'users',label:'Users',icon:Users},
 {id:'servers',label:'Servers',icon:Server},
 {id:'orders',label:'Payments',icon:CreditCard},
 {id:'logins',label:'Login activity',icon:Activity},
 {id:'audit',label:'Audit log',icon:FileClock},
];
const money=value=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format((Number(value)||0)/100);
const orderMoney=(value,currency)=>{
 const code=/^[A-Z]{3}$/.test(String(currency||''))?String(currency):'INR';
 try{return new Intl.NumberFormat('en-IN',{style:'currency',currency:code}).format((Number(value)||0)/100)}
 catch{return code+' '+((Number(value)||0)/100).toFixed(2)}
};
const when=value=>value?new Intl.DateTimeFormat('en-IN',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'—';
const shortID=id=>id?(id.length>22?id.slice(0,13)+'…'+id.slice(-5):id):'—';
function Status({value}){
 const s=String(value||'unknown').toLowerCase();
 const good=['running','captured_verified','fulfilled','success','verified','ssh_ready'].includes(s);
 const bad=['expired','failed','deactivated','deleted','needs_review'].some(x=>s.includes(x));
 const color=good?'border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300':bad?'border-red-400/30 bg-red-500/10 text-red-600 dark:text-red-300':'border-border bg-muted text-muted-foreground';
 return <span className={'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold '+color}>{value||'unknown'}</span>;
}
function Button({children,onClick,disabled=false,kind='default',type='button',className=''}) {
 const style=kind==='primary'?'bg-emerald-400 text-slate-950 hover:bg-emerald-300':kind==='danger'?'border border-red-400/35 bg-red-500/10 text-red-600 dark:text-red-300':kind==='ghost'?'border border-border bg-background hover:bg-muted':'bg-foreground text-background';
 return <button type={type} disabled={disabled} onClick={onClick} className={'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 '+style+' '+className}>{children}</button>;
}
function Notice({error,message}){
 if(!error&&!message)return null;
 return <div role={error?'alert':'status'} className={'rounded-xl border px-4 py-3 text-sm '+(error?'border-red-400/40 bg-red-500/10 text-red-600 dark:text-red-300':'border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300')}>{error||message}</div>;
}
function Spinner({text='Loading…'}){return <div role="status" className="flex min-h-28 items-center justify-center gap-2 text-sm text-muted-foreground"><LoaderCircle size={18} className="animate-spin"/>{text}</div>}
function Card({title,info,toolbar,children}){
 return <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5"><div><h2 className="text-lg font-semibold">{title}</h2>{info&&<p className="mt-1 text-xs text-muted-foreground">{info}</p>}</div>{toolbar}</div>
  <div className="p-4 sm:p-5">{children}</div>
 </section>;
}
function Stat({title,value,icon:Icon,info}){
 return <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between text-sm text-muted-foreground"><span>{title}</span><span className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600"><Icon size={18}/></span></div><div className="mt-3 text-3xl font-bold tracking-tight tabular-nums">{value??'—'}</div>{info&&<p className="mt-2 text-xs text-muted-foreground">{info}</p>}</div>;
}
function Pagination({page,total,onChange}){
 const max=Math.max(0,Math.ceil((Number(total)||0)/25)-1);
 return <div className="mt-4 flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>{total||0} entries · page {page+1} / {max+1}</span><div className="flex gap-2"><Button kind="ghost" disabled={page<=0} onClick={()=>onChange(page-1)}><ChevronLeft size={16}/></Button><Button kind="ghost" disabled={page>=max} onClick={()=>onChange(page+1)}><ChevronRight size={16}/></Button></div></div>;
}
export function AdminLogin(){
 const navigate=useNavigate();
 const [password,setPassword]=useState(''),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let active=true;apiRequest('/api/v1/admin/me').then(()=>{if(active)navigate('/admin',{replace:true})}).catch(()=>{});return()=>{active=false}},[navigate]);
 async function submit(e){e.preventDefault();setBusy(true);setError('');try{await apiRequest('/api/v1/admin/login',{method:'POST',body:{email:ADMIN_EMAIL,password}});setPassword('');navigate('/admin',{replace:true})}catch(err){setError(err.message||'Sign-in failed')}finally{setBusy(false)}}
 return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080e1a] px-4 py-10 text-white">
  <div className="pointer-events-none absolute -right-24 -top-40 size-[400px] rounded-full bg-emerald-400/10 blur-[100px]"/>
  <div className="pointer-events-none absolute -bottom-40 -left-24 size-[400px] rounded-full bg-cyan-500/10 blur-[105px]"/>
  <div className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-[#121a2b] p-6 shadow-2xl sm:p-9">
   <div className="flex items-center gap-3"><BrandLogo size={50}/><div><p className="text-lg font-bold">BabiesIQ Cloud</p><p className="text-xs text-slate-400">Owner administration</p></div></div>
   <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300"><ShieldCheck size={14}/>Restricted access</div>
   <h1 className="mt-4 text-3xl font-bold">Admin login</h1>
   <p className="mt-2 text-sm leading-6 text-slate-400">Manage your infrastructure, customers and payment records securely.</p>
   <form onSubmit={submit} className="mt-7 space-y-5">
    <div><label className="mb-2 block text-xs font-semibold text-slate-300">Admin email</label><input readOnly autoComplete="username" value={ADMIN_EMAIL} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-200"/></div>
    <div><label htmlFor="owner-password" className="mb-2 block text-xs font-semibold text-slate-300">Password</label><div className="flex items-center rounded-xl border border-white/15 bg-white/5 pr-2 focus-within:border-emerald-400">
     <input id="owner-password" type={show?'text':'password'} autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your admin password" className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none"/>
     <button type="button" onClick={()=>setShow(v=>!v)} aria-label={show?'Hide password':'Show password'} className="grid size-9 place-items-center rounded-lg hover:bg-white/10">{show?<EyeOff size={17}/>:<Eye size={17}/>}</button>
    </div></div>
    <Notice error={error}/>
    <Button kind="primary" type="submit" className="w-full" disabled={busy||!password}>{busy?<LoaderCircle size={17} className="animate-spin"/>:<LockKeyhole size={17}/>}Sign in <ArrowRight size={16}/></Button>
   </form>
   <div className="mt-7 flex items-center gap-2 border-t border-white/10 pt-5 text-xs text-slate-400"><Clock3 size={15}/>Session expires 24 hours after login.</div>
   <Link to="/" className="mt-5 inline-flex items-center gap-1 text-xs text-slate-300 hover:text-emerald-300"><ArrowLeft size={15}/>Back to Cloud</Link>
  </div>
 </main>;
}
export default function AdminDashboard(){
 const navigate=useNavigate();
 const [admin,setAdmin]=useState(null),[loading,setLoading]=useState(true);
 const [tab,setTab]=useState('overview'),[overview,setOverview]=useState(null);
 const [rows,setRows]=useState([]),[total,setTotal]=useState(0),[page,setPage]=useState(0),[busy,setBusy]=useState(false);
 const [search,setSearch]=useState(''),[query,setQuery]=useState('');
 const [selected,setSelected]=useState(null),[detail,setDetail]=useState(null),[detailBusy,setDetailBusy]=useState(false);
 const [confirm,setConfirm]=useState(false),[phrase,setPhrase]=useState(''),[adminPassword,setAdminPassword]=useState(''),[acting,setActing]=useState(false);
 const [error,setError]=useState(''),[message,setMessage]=useState('');
 const onError=useCallback(e=>{if(e?.status===401){navigate('/admin/login',{replace:true})}else{setError(e?.message||'Request failed')}},[navigate]);
 const load=useCallback(async(activeTab,activePage,activeQuery)=>{
  setBusy(true);setError('');
  try{
   if(activeTab==='overview'){const r=await apiRequest('/api/v1/admin/overview');setOverview(r.stats||{})}
   else{
    const params=new URLSearchParams({page:String(activePage)});
    if((activeTab==='users'||activeTab==='servers')&&activeQuery)params.set('search',activeQuery);
    const r=await apiRequest('/api/v1/admin/'+activeTab+'?'+params);
    setRows(Array.isArray(r.items)?r.items:[]);setTotal(r.total||0);
   }
  }catch(e){onError(e)}finally{setBusy(false)}
 },[onError]);
 useEffect(()=>{let active=true;apiRequest('/api/v1/admin/me').then(r=>{if(active){setAdmin(r);setLoading(false)}}).catch(e=>{if(active){setLoading(false);onError(e)}});return()=>{active=false}},[onError]);
 useEffect(()=>{if(admin)load(tab,page,query)},[admin,tab,page,query,load]);
 function changeTab(id){setTab(id);setPage(0);setQuery('');setSearch('');setSelected(null);setDetail(null);setConfirm(false);setMessage('');setError('')}
 async function inspectUser(id){
  setSelected(id);setDetail(null);setDetailBusy(true);setConfirm(false);
  try{setDetail(await apiRequest('/api/v1/admin/users/'+encodeURIComponent(id)))}catch(e){onError(e)}
  finally{setDetailBusy(false)}
 }
 async function action(name){
  if(!selected)return;
  setActing(true);setError('');setMessage('');
  try{
   const body=['deactivate','delete'].includes(name)?{confirmation:phrase,password:adminPassword}:undefined;
   const r=await apiRequest('/api/v1/admin/users/'+encodeURIComponent(selected)+'/'+name,{method:'POST',body});
   setMessage(r.message||'Action completed');setConfirm(false);setPhrase('');setAdminPassword('');
   if(name==='delete'){setSelected(null);setDetail(null)}else{await inspectUser(selected)}
   if(tab==='users')await load('users',page,query);
  }catch(e){onError(e)}finally{setActing(false)}
 }
 async function logout(){try{await apiRequest('/api/v1/admin/logout',{method:'POST'});navigate('/admin/login',{replace:true})}catch(e){onError(e)}}
 if(loading)return <div className="min-h-screen bg-background"><Spinner text="Checking admin session…"/></div>;
 if(!admin)return <div className="grid min-h-screen place-items-center bg-background"><Button onClick={()=>navigate('/admin/login')}>Admin sign in</Button></div>;
 const stats=overview||{};
 return <div className="min-h-screen bg-background text-foreground">
  <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
   <div className="flex min-w-0 items-center gap-2.5"><BrandLogo size={43}/><div className="min-w-0"><p className="truncate text-sm font-bold sm:text-lg">BabiesIQ Cloud <span className="text-emerald-500">/ Admin</span></p><p className="text-xs text-muted-foreground">Owner dashboard</p></div></div>
   <div className="flex items-center gap-2"><p className="hidden text-right text-[11px] text-muted-foreground sm:block">{admin.email}<span className="block">Expires {when(admin.expiresAt)}</span></p><Button kind="ghost" onClick={()=>load(tab,page,query)}><RefreshCw size={17}/></Button><Button kind="ghost" onClick={logout}><LogOut size={17}/><span className="hidden sm:inline">Log out</span></Button></div>
  </div></header>
  <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-7">
   <aside className="self-start rounded-2xl border border-border bg-card p-2 lg:sticky lg:top-24">
    <p className="hidden px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground lg:block">Administration</p>
    <nav aria-label="Admin navigation" className="flex gap-1 overflow-x-auto lg:flex-col">{SECTIONS.map(item=><button key={item.id} type="button" onClick={()=>changeTab(item.id)} className={'inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition '+(tab===item.id?'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300':'text-muted-foreground hover:bg-muted hover:text-foreground')}><item.icon size={17}/>{item.label}</button>)}</nav>
    <p className="hidden border-t border-border px-3 py-4 text-xs leading-5 text-muted-foreground lg:block">Admin-only data. Sessions expire after 24 hours and sensitive actions are audited.</p>
   </aside>
   <main className="min-w-0 space-y-5">
    <div><p className="text-xs font-bold uppercase tracking-[.15em] text-emerald-600 dark:text-emerald-400">Cloud operations</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{SECTIONS.find(v=>v.id===tab)?.label}</h1>
     <p className="mt-2 text-sm text-muted-foreground">{tab==='overview'?'Live database metrics for your Cloud platform.':tab==='users'?'Search accounts and manage security without seeing customer passwords.':tab==='servers'?'Create complimentary VPS, inspect customer IDs, and manage validity or deletion.':tab==='orders'?'Review gateway payment records and purchase history.':tab==='logins'?'Successful login history recorded since deployment.':'Operator action history.'}</p>
    </div>
    <Notice error={error} message={message}/>
    {tab==='overview'&&<>
     {busy&&!overview?<Spinner/>:<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <Stat title="All users" value={stats.users} icon={Users}/>
      <Stat title="New users today" value={stats.newUsersToday} icon={CalendarDays} info="Today in India"/>
      <Stat title="Logins today" value={stats.loginsToday} icon={Activity} info="Successful recorded sign-ins"/>
      <Stat title="Active sessions" value={stats.onlineSessions} icon={ShieldCheck} info="Sessions, not unique users"/>
      <Stat title="Server requests" value={stats.servers} icon={Server} info="Excludes drafts"/>
      <Stat title="Running servers" value={stats.runningServers} icon={CheckCircle2}/>
      <Stat title="Payment orders" value={stats.paymentOrders} icon={CreditCard}/>
      <Stat title="Captured orders" value={stats.capturedOrders} icon={Wallet}/>
      <Stat title="Verified captured amount" value={stats.capturedAmountPaise==null?'—':money(stats.capturedAmountPaise)} icon={BarChart3} info="Not merchant settlements"/>
     </div>}
     <Card title="Infrastructure attention" info="Orders and deployments need careful reconciliation."><div className="flex flex-wrap items-center gap-3"><AlertTriangle size={23} className="text-amber-500"/><div><p className="text-2xl font-bold">{stats.failedProvisioning??'—'}</p><p className="text-xs text-muted-foreground">Failed / needs-review server records</p></div><Button kind="ghost" className="ml-auto" onClick={()=>changeTab('servers')}>View servers <ArrowRight size={16}/></Button></div></Card>
     <Card title="Security guardrails"><div className="space-y-2 text-sm leading-6 text-muted-foreground"><p>Customer passwords, OTPs, root credentials and API keys are never displayed.</p><p>Admin sessions expire after 24 hours. Account changes require server authorization and are written to the audit trail.</p></div></Card>
    </>}
    {tab==='users'&&<Card title="Customer accounts" info="25 accounts per page; search using the start of an email address." toolbar={<form onSubmit={e=>{e.preventDefault();setPage(0);setQuery(search.toLowerCase().trim())}} className="flex gap-2"><label className="relative flex items-center"><Search className="absolute left-2 text-muted-foreground" size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Email" className="h-10 w-32 rounded-xl border border-border bg-background pl-8 pr-2 text-xs sm:w-48"/></label><Button kind="ghost" type="submit">Search</Button></form>}>
      {busy?<Spinner/>:<div className="space-y-2">{rows.map(u=><button type="button" onClick={()=>inspectUser(u.id)} key={u.id} className="flex w-full items-center justify-between gap-2 rounded-xl border border-border p-3 text-left hover:border-emerald-500/50 hover:bg-muted/30"><span className="min-w-0"><span className="block truncate text-sm font-semibold">{[u.firstName,u.lastName].filter(Boolean).join(' ')||u.email}</span><span className="block truncate text-xs text-muted-foreground">{u.email}</span><span className="mt-1 block text-[11px] text-muted-foreground">{when(u.createdAt)}</span></span>{u.accountDisabledAt?<Status value="deactivated"/>:u.emailVerified?<Status value="verified"/>:<Status value="pending"/>}</button>)}{rows.length===0&&<p className="p-4 text-sm text-muted-foreground">No matching users.</p>}</div>}<Pagination page={page} total={total} onChange={setPage}/>
    </Card>}
    {tab==='users'&&selected&&<Card title="Selected customer" toolbar={<Button kind="ghost" onClick={()=>{setSelected(null);setDetail(null)}}>Close</Button>}>
      {detailBusy?<Spinner text="Loading account…"/>:detail&&<>
       <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div><span className="text-muted-foreground">Email</span><p className="break-all font-semibold">{detail.user?.email}</p></div>
        <div><span className="text-muted-foreground">Active sessions</span><p className="font-bold">{detail.activeSessions??0}</p></div>
        <div><span className="text-muted-foreground">Account ID</span><p className="break-all font-mono text-xs">{detail.user?.id}</p></div>
        <div><span className="text-muted-foreground">Preferred language</span><p>{detail.user?.preferredLanguage||'en'}</p></div>
       </div>
       <div className="my-4 flex justify-around rounded-xl bg-muted p-3 text-center"><div><p className="text-2xl font-bold">{detail.instances?.length??0}</p><p className="text-xs text-muted-foreground">VPS records</p></div><div><p className="text-2xl font-bold">{detail.orders?.length??0}</p><p className="text-xs text-muted-foreground">Orders</p></div></div>
       <div className="mb-4 space-y-2"><AdminVPSManager customer={detail.user} instances={detail.instances||[]} onRefresh={()=>{inspectUser(selected);load(tab,page,query)}}/></div>
       <div className="mb-4 space-y-2">{(detail.orders||[]).slice(0,6).map(order=><div key={order.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 text-xs"><span className="min-w-0"><span className="block break-all font-semibold">{orderMoney(order.amount,order.currency)} · {order.kind||'VPS purchase'}</span><span className="text-muted-foreground">{shortID(order.id)} · {when(order.createdAt)}</span></span><Status value={order.status}/></div>)}</div>
       <div className="flex flex-wrap gap-2"><Button kind="ghost" disabled={acting} onClick={()=>action('send-reset')}><KeyRound size={16}/>Send reset link</Button><Button kind="ghost" disabled={acting} onClick={()=>action('revoke-sessions')}><LogOut size={16}/>Revoke sessions</Button><Button kind="danger" disabled={acting||Boolean(detail.user?.accountDisabledAt)} onClick={()=>{setConfirm('deactivate');setPhrase('');setAdminPassword('')}}><Trash2 size={16}/>Deactivate</Button>{(detail.instances||[]).length===0&&(detail.orders||[]).length===0&&detail.user?.email!==ADMIN_EMAIL&&<Button kind="danger" disabled={acting||Boolean(detail.user?.accountDisabledAt)} onClick={()=>{setConfirm('delete');setPhrase('');setAdminPassword('')}}><Trash2 size={16}/>Delete unused account</Button>}</div>
       {confirm&&<div className="mt-4 space-y-3 rounded-xl border border-red-400/35 bg-red-500/5 p-4">
        <p className="font-semibold text-red-600 dark:text-red-300">{confirm==='delete'?'Permanent account deletion':'Confirm deactivation'}</p>
        <p className="text-xs leading-5 text-muted-foreground">{confirm==='delete'?'This permanently removes an unused account and its sessions, notifications and login events. Only accounts with no server records, no payment orders and no pending provider operations are eligible.':'Accounts with paid purchases or live servers cannot be deactivated. This is not permanent data deletion.'}</p>
        <p className="break-all text-xs">Type exactly: <strong>{confirm==='delete'?'DELETE '+detail.user?.email+' PERMANENTLY':'DEACTIVATE '+detail.user?.email}</strong></p>
        <input value={phrase} onChange={e=>setPhrase(e.target.value)} placeholder="Exact confirmation" className="w-full rounded-lg border border-border bg-background p-3 text-sm"/>
        <input value={adminPassword} onChange={e=>setAdminPassword(e.target.value)} type="password" autoComplete="off" placeholder="Confirm with admin password" className="w-full rounded-lg border border-border bg-background p-3 text-sm"/>
        <div className="flex flex-wrap gap-2"><Button kind="danger" disabled={acting||phrase!==(confirm==='delete'?'DELETE '+detail.user?.email+' PERMANENTLY':'DEACTIVATE '+detail.user?.email)||!adminPassword} onClick={()=>action(confirm)}><Trash2 size={16}/>{confirm==='delete'?'Permanently delete':'Confirm deactivation'}</Button><Button kind="ghost" onClick={()=>{setConfirm(false);setPhrase('');setAdminPassword('')}}>Cancel</Button></div>
       </div>}
       <p className="mt-4 text-xs text-muted-foreground">Passwords and root credentials cannot be viewed. Reset links go only to verified customer email addresses; financial records are retained.</p>
      </>}
    </Card>}
    {tab==='servers'&&<Card title="VPS management" info="Create a free VPS for an active customer, or search by VPS ID, record ID, user ID or provider service ID." toolbar={<form onSubmit={e=>{e.preventDefault();setPage(0);setQuery(search.trim())}} className="flex gap-2"><input aria-label="Search VPS" value={search} onChange={e=>setSearch(e.target.value)} placeholder="VPS or user ID" className="min-w-0 w-40 rounded-xl border border-border bg-background px-3 text-xs"/><Button kind="ghost" type="submit">Search</Button></form>}><AdminVPSManager instances={rows} onRefresh={()=>load(tab,page,query)}/><Pagination page={page} total={total} onChange={setPage}/></Card>}
    {['orders','logins','audit'].includes(tab)&&<Card title={tab==='servers'?'All customer VPS records':tab==='orders'?'Gateway payment orders':tab==='logins'?'Successful logins':'Admin audit events'} info={tab==='logins'?'Older logins cannot be reconstructed; only sign-ins since tracking was enabled are shown.':undefined}>
      {busy?<Spinner/>:<div className="space-y-2">{rows.map(x=><div key={x.id} className="rounded-xl border border-border p-3 text-sm sm:p-4">
       <div className="flex flex-wrap justify-between gap-2"><div className="min-w-0"><p className="break-all font-semibold">{tab==='servers'?String(x.ram||'—')+' GB / '+String(x.cpu||'—')+' vCPU · '+(x.region||'—'):tab==='orders'?shortID(x.id):tab==='logins'?x.email:x.action}</p><p className="mt-1 break-all text-xs text-muted-foreground">{tab==='orders'?orderMoney(x.amount,x.currency):tab==='logins'?x.method+' · '+x.device:tab==='audit'?shortID(x.targetId):shortID(x.id)}</p></div>{tab==='servers'?<Status value={x.status}/>:tab==='orders'?<Status value={x.status}/>:tab==='audit'?<Status value={x.result}/>:<span className="text-xs text-muted-foreground">{x.method}</span>}</div>
       <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>{when(x.createdAt)}</span>{x.userId&&<button className="break-all font-semibold text-emerald-600 dark:text-emerald-400" onClick={()=>{changeTab('users');inspectUser(x.userId)}}>View customer {shortID(x.userId)} →</button>}</div>
      </div>)}{rows.length===0&&<p className="p-4 text-center text-sm text-muted-foreground">No records.</p>}</div>}<Pagination page={page} total={total} onChange={setPage}/>
    </Card>}
   </main>
  </div>
 </div>;
}
