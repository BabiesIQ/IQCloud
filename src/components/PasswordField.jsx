import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';


export default function PasswordField({ label, value, onChange, autoComplete, minLength, required = true, placeholder = '' }) {
 const [visible, setVisible] = useState(false);
 return <div className="block text-sm font-medium">
  <label className="block" htmlFor={autoComplete + '-' + label.replace(/\s+/g,'-').toLowerCase()}>{label}</label>
  <div className="relative mt-2">
   <input id={autoComplete + '-' + label.replace(/\s+/g,'-').toLowerCase()} type={visible?'text':'password'} autoComplete={autoComplete} required={required} minLength={minLength} placeholder={placeholder} value={value} onChange={onChange} className="w-full rounded-xl border bg-background px-4 py-3 pr-12 outline-offset-2"/>
   <button type="button" onClick={()=>setVisible(v=>!v)} aria-label={visible?'Hide '+label.toLowerCase():'Show '+label.toLowerCase()} aria-pressed={visible} title={visible?'Hide password':'Show password'} className="absolute inset-y-0 right-1 flex w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
    {visible?<EyeOff size={19} aria-hidden="true"/>:<Eye size={19} aria-hidden="true"/>}
   </button>
  </div>
 </div>;
}
