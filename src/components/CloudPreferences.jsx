import { useEffect, useState } from 'react';
import { getPreferences, updatePreferences } from '@/config/runtime.config';
import { LANGUAGES,COUNTRY_OPTIONS,CURRENCY_BY_COUNTRY,nativeCountryName } from '@/i18n/config';

// Can be mounted in account settings or the global header.
export default function CloudPreferences() {
  const [prefs, setPrefs] = useState(getPreferences);
  const [error, setError] = useState('');
  useEffect(() => {
    const sync = () => { const next = getPreferences(); setPrefs(next); };
    window.addEventListener('iqcloud:preferences', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('iqcloud:preferences', sync); window.removeEventListener('storage', sync); };
  }, []);
  const update = (patch) => {
    try {
      const next = updatePreferences(patch);
      setPrefs(next); setError('');
      if (patch.theme) {
        const dark = next.theme === 'dark' || (next.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.toggle('dark', dark);
      }
    } catch (e) { setError(e.message); }
  };
  return (
    <section className="rounded-2xl border bg-card p-5 space-y-5" aria-label="Cloud preferences">
      <div><h2 className="text-lg font-semibold">Preferences</h2><p className="text-sm text-muted-foreground">Stored only on this device.</p></div>
      <label className="block text-sm space-y-2">Appearance
        <select className="w-full rounded-lg border bg-background p-2" value={prefs.theme} onChange={e => update({ theme: e.target.value })}>
          <option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option>
        </select>
      </label>
      <label className="block text-sm space-y-2">Language
        <select className="w-full rounded-lg border bg-background p-2" value={prefs.language} onChange={e => update({ language: e.target.value })}>
          {LANGUAGES.map(item=><option key={item.code} value={item.code}>{item.nativeName}</option>)}
        </select>
      </label>
      <label className="block text-sm space-y-2">Billing country / preview currency
        <select data-no-translate className="w-full rounded-lg border bg-background p-2" value={prefs.country} onChange={e=>update({country:e.target.value})}>
          {COUNTRY_OPTIONS.map(code=><option key={code} value={code}>{nativeCountryName(code)} · {CURRENCY_BY_COUNTRY[code]}</option>)}
        </select>
      </label>
      <p className="text-xs text-muted-foreground">Your billing country is a display preference, not payment verification. Local-currency estimates may differ from the final supported gateway amount.</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </section>
  );
}
