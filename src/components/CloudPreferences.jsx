import { useEffect, useState } from 'react';
import { getPreferences, updatePreferences } from '@/config/runtime.config';

// Can be mounted in account settings or the global header.
export default function CloudPreferences() {
  const [prefs, setPrefs] = useState(getPreferences);
  const [url, setUrl] = useState(prefs.apiBaseUrl);
  const [error, setError] = useState('');
  useEffect(() => {
    const sync = () => { const next = getPreferences(); setPrefs(next); setUrl(next.apiBaseUrl); };
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
          <option value="en">English</option><option value="hi">हिन्दी</option>
        </select>
      </label>
      <form className="space-y-2" onSubmit={e => { e.preventDefault(); update({ apiBaseUrl: url }); }}>
        <label className="block text-sm" htmlFor="cloud-api-url">Backend API URL</label>
        <input id="cloud-api-url" className="w-full rounded-lg border bg-background p-2" type="url" value={url} onChange={e => setUrl(e.target.value)} required />
        <p className="text-xs text-muted-foreground">HTTPS on babiesiq.tech only. Changes apply to requests using the shared API client.</p>
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Save API URL</button>
      </form>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </section>
  );
}
