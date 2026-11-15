import {ArrowUpRight, AudioLines, Code2, Clapperboard} from 'lucide-react';
import {useLocale} from '@/i18n/LocaleProvider';
import '@/cloud-motion.css';

const socialLinks=[
 {name:'Instagram',handle:'@babaiesiq',href:'https://www.instagram.com/babaiesiq/',kind:'instagram'},
 {name:'GitHub',handle:'@babiesiq',href:'https://github.com/BabiesIQ',kind:'github'},
 {name:'Telegram',handle:'@babiesiq',href:'https://t.me/babiesiq',kind:'telegram'}
];
function SocialIcon({kind}){
 if(kind==='instagram')return <svg aria-hidden="true" viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5.3"/><circle cx="12" cy="12" r="4.1"/><circle cx="17.65" cy="6.5" r="1.05" fill="currentColor" stroke="none"/></svg>;
 if(kind==='github')return <svg aria-hidden="true" viewBox="0 0 24 24" width="21" height="21" fill="currentColor"><path d="M12 .9A11.1 11.1 0 0 0 8.49 22.5c.56.1.77-.24.77-.53v-2.09c-3.15.69-3.81-1.34-3.81-1.34-.51-1.3-1.25-1.64-1.25-1.64-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.15 1.73 1.15 1 .1.2 1.39 2.73.99.1-.73.4-1.23.74-1.52-2.51-.29-5.15-1.26-5.15-5.57 0-1.23.44-2.24 1.15-3.04-.12-.28-.5-1.45.1-3.01 0 0 .94-.3 3.06 1.16a10.6 10.6 0 0 1 5.57 0c2.12-1.44 3.05-1.16 3.05-1.16.61 1.56.23 2.73.11 3.01.72.8 1.14 1.81 1.14 3.04 0 4.32-2.64 5.28-5.16 5.57.41.36.78 1.06.78 2.13v3.15c0 .3.2.64.78.53A11.11 11.11 0 0 0 12 .9Z"/></svg>;
 return <svg aria-hidden="true" viewBox="0 0 24 24" width="21" height="21" fill="currentColor"><path d="M21.43 3.38a1.1 1.1 0 0 0-1.16-.14L2.72 10.58c-.93.4-.9 1.3.04 1.59l4.79 1.5 1.72 5.36c.3.96 1.17 1.13 1.84.43l2.54-2.67 4.93 3.61c.78.57 1.71.17 1.86-.78l2.3-15.1c.1-.65-.12-1.04-.7-1.14-.21-.03-.41-.03-.61 0Zm-3.19 3.48-8.53 7.83-.3 2.64-1.2-3.79 10.03-6.68Z"/></svg>;
}
export default function MusicEcosystem(){
 const {t}=useLocale();
 return <section aria-labelledby="babiesiq-music-heading" className="border-t border-border px-4 py-14 sm:px-6 sm:py-20">
  <div className="mx-auto max-w-5xl overflow-hidden rounded-[30px] border border-border bg-card shadow-[0_12px_48px_rgba(8,20,47,.08)]">
   <div className="relative isolate overflow-hidden bg-[#0b1024] px-6 py-9 text-white sm:px-10 sm:py-12">
    <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 size-72 rounded-full bg-violet-500/20 blur-[70px]"/>
    <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-0 size-64 rounded-full bg-teal-400/15 blur-[70px]"/>
    <div className="relative grid items-center gap-9 md:grid-cols-[1fr_auto]">
     <div className="min-w-0">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/[.07] px-3 py-1.5 text-[11px] font-bold tracking-[.12em] text-emerald-200">
       <AudioLines size={14} aria-hidden="true"/>{t('MORE FROM BABIESIQ')}
      </div>
      <div className="flex items-center gap-4">
       <span className="iq-protected-icon inline-flex shrink-0" onContextMenu={e=>e.preventDefault()} onDragStart={e=>e.preventDefault()}>
        <img src="/assets/brands/babiesiq-music-api.svg?v=baby-headphones-2" alt="" width="90" height="90" decoding="async" draggable={false} className="pointer-events-none size-[78px] object-contain drop-shadow-[0_10px_22px_rgba(40,225,209,.22)] sm:size-[90px]"/>
       </span>
       <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[.20em] text-cyan-200/80">{t('Our music developer platform')}</p>
        <h2 id="babiesiq-music-heading" className="mt-1 text-[27px] font-bold leading-tight tracking-tight sm:text-4xl" data-no-translate>
         BabiesIQ <span className="bg-gradient-to-r from-emerald-300 via-cyan-200 to-violet-300 bg-clip-text text-transparent">Music API</span>
        </h2>
       </div>
      </div>
      <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">{t('Stream music and video, search tracks, and build with simple developer-friendly APIs.')}</p>
      <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-medium text-slate-200 sm:text-xs">
       <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[.06] px-3 py-1.5"><AudioLines size={13}/>{t('Audio streaming')}</span>
       <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[.06] px-3 py-1.5"><Clapperboard size={13}/>{t('Video streaming')}</span>
       <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[.06] px-3 py-1.5"><Code2 size={13}/>{t('Developer APIs')}</span>
      </div>
      <a href="https://babiesiq.tech" target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_8px_24px_rgba(40,220,190,.25)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
       {t('Explore Music API')}<ArrowUpRight size={18} aria-hidden="true"/>
      </a>
      <a href="https://babiesiq.tech" target="_blank" rel="noopener noreferrer" className="ml-0 mt-3 inline-flex items-center gap-1 text-xs font-medium text-cyan-200 underline-offset-4 hover:underline sm:ml-4" data-no-translate>babiesiq.tech <ArrowUpRight size={13}/></a>
     </div>
     <div aria-hidden="true" className="hidden items-center justify-center md:flex">
      <div className="iq-music-orbit relative grid size-40 place-items-center rounded-full border border-violet-300/30 bg-white/[.05] shadow-[0_0_80px_rgba(102,117,250,.18)]">
       <div className="absolute inset-5 rounded-full border border-dashed border-emerald-200/25"/>
       <div className="flex h-20 items-center gap-1.5">
        {[18,35,54,76,45,69,32,59,24].map((height,i)=><span key={i} className="iq-music-eq w-[6px] rounded-full bg-gradient-to-b from-cyan-200 via-emerald-300 to-violet-400" style={{height:height+'%',animationDelay:(i*0.13)+'s'}}/>)}
       </div>
      </div>
     </div>
    </div>
   </div>
   <div className="px-5 py-7 sm:px-9 sm:py-8">
    <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
     <div><h3 className="text-lg font-semibold tracking-tight sm:text-xl">{t('Connect with BabiesIQ')}</h3>
     <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{t('Updates, open-source projects, and our community.')}</p></div>
     <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">{t('Find us online')}</span>
    </div>
    <nav aria-label="BabiesIQ social links" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
     {socialLinks.map(link=><a key={link.kind} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.name+' '+link.handle} className="group flex min-h-[75px] items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-foreground transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
       <span className={'grid size-11 shrink-0 place-items-center rounded-[14px] '+(link.kind==='instagram'?'bg-gradient-to-br from-amber-400 via-fuchsia-500 to-violet-600 text-white':link.kind==='github'?'bg-slate-800 text-white':'bg-[#229ed9] text-white')}>
        <SocialIcon kind={link.kind}/>
       </span>
       <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{link.name}</span><span className="mt-0.5 block text-xs text-muted-foreground" data-no-translate>{link.handle}</span></span>
       <ArrowUpRight className="shrink-0 text-muted-foreground transition group-hover:text-primary" size={17} aria-hidden="true"/>
      </a>)}
    </nav>
   </div>
  </div>
 </section>;
}
