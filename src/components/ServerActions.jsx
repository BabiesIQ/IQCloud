import { useState } from 'react';
import { Pause, Play, Trash2, ShieldAlert, MailCheck } from 'lucide-react';
import { apiRequest } from '@/services/apiClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const DELETE_PHRASE='yes delete my service permanently';
const deletable=['running','paused','stopped','expired'];

export default function ServerActions({item,onChanged}){
 const [runningAction,setRunningAction]=useState('');
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 const [open,setOpen]=useState(false);
 const [phrase,setPhrase]=useState('');
 const [otp,setOtp]=useState('');
 const [phase,setPhase]=useState('phrase');
 const [busy,setBusy]=useState(false);
 const [deleteMessage,setDeleteMessage]=useState('');
 const id=item?._id;
 const eligible=deletable.includes(item?.status);
 function closeDialog(value){
  if(busy&&value===false)return;
  setOpen(value);
  if(!value){setPhrase('');setOtp('');setPhase('phrase');setDeleteMessage('');}
 }
 async function execute(action){
  if(!id||runningAction)return;
  setRunningAction(action);setError('');setMessage('');
  try{
   const result=await apiRequest('/api/v1/instances/'+encodeURIComponent(id)+'/actions/'+action,{method:'POST',body:{}});
   setMessage(result.message||'Railway command accepted.');
   if(onChanged)await onChanged();
  }catch(e){setError(e.message||'Could not complete Railway action.')}
  finally{setRunningAction('');}
 }
 async function requestCode(){
  if(!id||phrase!==DELETE_PHRASE||busy)return;
  setBusy(true);setDeleteMessage('');
  try{
   const result=await apiRequest('/api/v1/instances/'+encodeURIComponent(id)+'/delete/request',{method:'POST',body:{phrase}});
   setDeleteMessage(result.message||'Verification code sent to your registered email.');
   setPhase('otp');
  }catch(e){setDeleteMessage(e.message||'OTP request failed. Service unchanged.')}
  finally{setBusy(false);}
 }
 async function confirmDelete(){
  if(!id||busy||phrase!==DELETE_PHRASE||!/^[0-9]{6}$/.test(otp))return;
  setBusy(true);setDeleteMessage('');
  try{
   const result=await apiRequest('/api/v1/instances/'+encodeURIComponent(id)+'/delete/confirm',{method:'POST',body:{phrase,code:otp}});
   setOpen(false);setPhrase('');setOtp('');setPhase('phrase');
   setMessage(result.message||'Service permanently deleted.');
   if(onChanged)await onChanged();
  }catch(e){setDeleteMessage(e.message||'Railway deletion not confirmed. Do not submit another request until reconciled.')}
  finally{setBusy(false);}
 }
 return <div className="mt-4 rounded-xl border p-4">
  <div className="mb-3 flex items-center justify-between gap-2"><h4 className="text-sm font-semibold">Server controls</h4><span className="text-xs text-muted-foreground">{item.status==='running'?'Online':item.status}</span></div>
  <div className="flex flex-wrap gap-2">
   {item.status==='running'&&<button type="button" disabled title="Unavailable until the service supports suspension without rebuilding its ephemeral filesystem" className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold opacity-50"><Pause size={15}/> Pause</button>}
   {['paused','stopped','resuming'].includes(item.status)&&<button type="button" disabled={!!runningAction} onClick={()=>execute('resume')} className="inline-flex items-center gap-2 rounded-lg border border-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-500 disabled:opacity-50"><Play size={15}/> {item.status==='resuming'?'Check & resume':'Resume'}</button>}
   {eligible&&<button type="button" disabled={!!runningAction} onClick={()=>closeDialog(true)} className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 disabled:opacity-50"><Trash2 size={15}/> Delete permanently</button>}
  </div>
  {['running','paused','stopped','resuming'].includes(item.status)&&<p className="mt-2 text-xs leading-5 text-muted-foreground">Data-safe controls only: Resume checks the existing Railway deployment without restarting it. Pause is blocked while a safe suspend and persistent storage are unavailable; your files are not risked by an automatic stop/redeploy.</p>}
  {item.status==='action_needs_review'&&<p className="mt-2 text-xs text-amber-600">The previous provider action needs reconciliation. Do not retry automatically.</p>}
  {item.status==='delete_needs_review'&&<p className="mt-2 text-xs text-amber-600">Permanent deletion could not be confirmed. Contact support; do not retry.</p>}
  {message&&<p role="status" className="mt-3 text-xs text-emerald-600">{message}</p>}
  {error&&<p role="alert" className="mt-3 text-xs text-red-600">{error}</p>}
  <Dialog open={open} onOpenChange={closeDialog}>
   <DialogContent className="max-w-lg">
    <DialogHeader><DialogTitle className="flex items-center gap-2 text-red-600"><ShieldAlert size={21}/> Permanently delete this service?</DialogTitle><DialogDescription>This removes the real Railway service, its deployments, SSH endpoint and all ephemeral files. This cannot be undone.</DialogDescription></DialogHeader>
    <div className="space-y-4">
     <div className="rounded-xl border border-red-500/40 bg-red-500/5 p-3 text-sm text-red-600 dark:text-red-400">
      <strong>Warning:</strong> No automatic refund is issued for unused subscription time when you delete a service. Any refund rights under applicable law or the published refund policy still apply. Save all data before proceeding.
     </div>
     <div><label htmlFor="confirm-deletion-phrase" className="text-xs font-medium">To confirm, type exactly:</label><code className="mt-2 block select-all rounded-lg bg-muted p-2 text-xs">{DELETE_PHRASE}</code><input id="confirm-deletion-phrase" type="text" value={phrase} onChange={e=>setPhrase(e.target.value)} disabled={busy||phase==='otp'} autoComplete="off" className="mt-2 w-full rounded-lg border bg-background p-3 text-sm" placeholder="Type exact confirmation phrase"/></div>
     {phase==='otp'&&<div><label htmlFor="deletion-otp" className="flex items-center gap-2 text-sm font-semibold"><MailCheck size={17}/> Email verification OTP</label><p className="mt-1 text-xs text-muted-foreground">Enter the six-digit OTP sent to your verified email. Expires in 10 minutes.</p><input id="deletion-otp" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/[^0-9]/g,''))} autoComplete="one-time-code" className="mt-2 w-full rounded-lg border bg-background p-3 text-lg tracking-widest" placeholder="000000"/></div>}
     {deleteMessage&&<p role="status" className="rounded-lg border p-3 text-xs">{deleteMessage}</p>}
     <div className="flex flex-wrap justify-end gap-2">
      <button type="button" disabled={busy} onClick={()=>closeDialog(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
      {phase==='phrase'?<button type="button" disabled={busy||phrase!==DELETE_PHRASE} onClick={requestCode} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">{busy?'Sending…':'Send deletion OTP'}</button>:
       <button type="button" disabled={busy||!/^[0-9]{6}$/.test(otp)} onClick={confirmDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">{busy?'Verifying…':'Verify OTP & delete permanently'}</button>}
     </div>
    </div>
   </DialogContent>
  </Dialog>
 </div>;
}
