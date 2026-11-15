import {useEffect,useMemo,useRef,useState} from 'react';
import {Globe2,Search,Check,ChevronDown} from 'lucide-react';
import {LANGUAGES,countryName,COUNTRY_OPTIONS,CURRENCY_BY_COUNTRY} from '@/i18n/config';
import {translationCompleteness} from '@/i18n/translations';
import {useLocale} from '@/i18n/LocaleProvider';

export default function LanguageSelector(){
 const locale=useLocale();
 const {language,country,currency,fxStatus,setLanguage,setCountry,t}=locale;
 const [open,setOpen]=useState(false);
 const [tab,setTab]=useState('language');
 const [search,setSearch]=useState('');
 const inputRef=useRef(null);
 const dragStart=useRef(null);
 const [dragY,setDragY]=useState(0);
 const [dragging,setDragging]=useState(false);
 const choices=useMemo(()=>{
  const searchTerm=search.trim().toLowerCase();
  if(tab==='language')return LANGUAGES.filter(x=>x.nativeName.toLowerCase().includes(searchTerm)||x.code.toLowerCase().includes(searchTerm));
  return COUNTRY_OPTIONS.filter(c=>c.toLowerCase().includes(searchTerm)||countryName(c,language).toLowerCase().includes(searchTerm)||CURRENCY_BY_COUNTRY[c].toLowerCase().includes(searchTerm));
 },[search,tab,language]);
 function closeDrawer(){
  inputRef.current?.blur();
  setOpen(false);
  setSearch('');
  setDragY(0);
  setDragging(false);
  dragStart.current=null;
 }
 function openDrawer(){
  setTab('language');
  setSearch('');
  setDragY(0);
  setOpen(true);
 }
 function onSwipeStart(event){
  if(!event.isPrimary||(event.pointerType==='mouse'&&event.button!==0))return;
  dragStart.current={id:event.pointerId,y:event.clientY,at:performance.now()};
  event.currentTarget.setPointerCapture(event.pointerId);
  setDragging(true);
 }
 function onSwipeMove(event){
  const start=dragStart.current;
  if(!start||start.id!==event.pointerId)return;
  setDragY(Math.max(0,event.clientY-start.y));
 }
 function onSwipeEnd(event){
  const start=dragStart.current;
  if(!start||start.id!==event.pointerId)return;
  const distance=Math.max(0,event.clientY-start.y);
  const speed=distance/Math.max(1,performance.now()-start.at);
  dragStart.current=null;
  if(distance>96||(distance>32&&speed>0.65)){
   closeDrawer();
  }else{
   setDragY(0);
   setDragging(false);
  }
 }
 function onSwipeCancel(){
  dragStart.current=null;
  setDragY(0);
  setDragging(false);
 }
 useEffect(()=>{
  if(!open)return;
  const old=document.body.style.overflow;
  document.body.style.overflow='hidden';
  const onKeyDown=e=>{if(e.key==='Escape')closeDrawer()};
  document.addEventListener('keydown',onKeyDown);
  return()=>{
   document.removeEventListener('keydown',onKeyDown);
   document.body.style.overflow=old;
  };
 },[open]);
 function choose(code){
  if(tab==='language')setLanguage(code);
  else setCountry(code);
  closeDrawer();
 }
 return <>
  <div data-no-translate className="fixed bottom-3 left-3 z-[45] sm:bottom-5 sm:left-5">
   <button type="button" aria-label="Change language and country" onClick={openDrawer} className="inline-flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur hover:bg-muted">
    <Globe2 size={17} className="text-emerald-500"/><span>{language.toUpperCase()}</span><span className="text-muted-foreground">·</span><span>{currency}</span><ChevronDown size={14}/>
   </button>
  </div>
  <div data-no-translate aria-hidden={!open} inert={!open} className={'fixed inset-0 z-[120] flex items-end justify-center '+(!open?'pointer-events-none':'')}>
   <button type="button" tabIndex={open?0:-1} aria-label="Close language selector" className={'absolute inset-0 bg-black/60 transition-opacity duration-300 '+(open?'opacity-100':'opacity-0')} onClick={closeDrawer}/>
   <section role="dialog" aria-modal={open} aria-label="Choose language and currency" className={'relative flex max-h-[86dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[30px] border bg-background text-foreground shadow-2xl sm:mb-6 sm:max-h-[84dvh] sm:rounded-3xl '+(dragging?'transition-none':'transition-transform duration-300 ease-out')} style={{transform:open?'translateY('+dragY+'px)':'translateY(110%)'}}>
    <div className="touch-none select-none border-b px-6 pb-5 pt-3 sm:px-8" onPointerDown={onSwipeStart} onPointerMove={onSwipeMove} onPointerUp={onSwipeEnd} onPointerCancel={onSwipeCancel}>
     <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted-foreground/40" aria-hidden="true"/>
     <div><p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">BabiesIQ Cloud</p><h2 className="mt-1 text-2xl font-bold sm:text-3xl">{t('Choose a language')}</h2></div>
    </div>
    <div className="grid grid-cols-2 gap-2 border-b px-6 py-3 sm:px-8">
     <button type="button" onClick={()=>{setTab('language');setSearch('')}} className={'rounded-xl px-4 py-3 text-sm font-semibold '+(tab==='language'?'bg-emerald-500/15 text-emerald-500':'hover:bg-muted')}>{t('Language')} · 60</button>
     <button type="button" onClick={()=>{setTab('country');setSearch('')}} className={'rounded-xl px-4 py-3 text-sm font-semibold '+(tab==='country'?'bg-emerald-500/15 text-emerald-500':'hover:bg-muted')}>{t('Currency')} / {t('Billing country')}</button>
    </div>
    <label className="mx-6 mt-4 flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3 sm:mx-8">
     <Search size={18} className="text-muted-foreground"/>
     <input ref={inputRef} type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder={t(tab==='language'?'Search languages':'Choose your billing country')} className="min-w-0 flex-1 bg-transparent text-sm outline-none"/>
    </label>
    <p className="px-6 py-3 text-xs text-muted-foreground sm:px-8">{tab==='language'?t('All languages (60)'):t('Choose your billing country')}</p>
    <div className="grid min-h-0 grid-cols-2 gap-1 overflow-y-auto px-5 pb-8 sm:grid-cols-3 sm:px-7" role="listbox">
     {choices.map(item=>{
      const code=tab==='language'?item.code:item;
      const label=tab==='language'?item.nativeName:countryName(code,language);
      const selected=tab==='language'?language===code:country===code;
      return <button type="button" role="option" aria-selected={selected} key={code} onClick={()=>choose(code)} className={'min-h-14 rounded-xl border px-4 py-3 text-left text-sm transition hover:bg-muted '+(selected?'border-emerald-500 bg-emerald-500/10 font-semibold':'border-transparent')}>
       <span className="flex items-center justify-between gap-2"><span lang={tab==='language'?code:undefined} className="min-w-0 break-words">{label}</span>{selected&&<Check size={15} className="shrink-0 text-emerald-500"/>}</span>
       {tab==='country'&&<span className="mt-1 block text-[11px] text-muted-foreground">{CURRENCY_BY_COUNTRY[code]}</span>}
      </button>;
     })}
     {!choices.length&&<p className="col-span-full py-8 text-center text-sm text-muted-foreground">No results</p>}
    </div>
    <p className="border-t px-6 py-3 text-xs leading-5 text-muted-foreground sm:px-8">{tab==='language'?(translationCompleteness(language)==='original'?'Your language selection is saved on this device.':'Some translation phrases are still being reviewed; unfinished labels remain in English.'):'Country selects estimated local prices in '+currency+'. This does not verify payment residency. FX status: '+fxStatus+'.'}</p>
   </section>
  </div>
 </>;
}
