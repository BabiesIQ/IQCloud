// Central, non-secret frontend configuration. API origin is fixed and not editable
// from browser preferences, even if an older session saved an apiBaseUrl.
const DEFAULT_API = 'https://api.cloud.babiesiq.tech';
const KEY = 'iqcloud:preferences:v1';
const defaults = Object.freeze({ theme: 'system', language: 'en', apiBaseUrl: DEFAULT_API });

export function getPreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '{}');
    return {
      theme: ['light','dark','system'].includes(stored.theme) ? stored.theme : defaults.theme,
      language: ['en','hi'].includes(stored.language) ? stored.language : defaults.language,
      apiBaseUrl: DEFAULT_API,
    };
  } catch { return { ...defaults }; }
}
export function updatePreferences(patch) {
  const current = getPreferences();
  const next = {
    theme: patch.theme ?? current.theme,
    language: patch.language ?? current.language,
    apiBaseUrl: DEFAULT_API,
  };
  if (!['light','dark','system'].includes(next.theme)) throw Error('Invalid theme');
  if (!['en','hi'].includes(next.language)) throw Error('Invalid language');
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private browsing */ }
  window.dispatchEvent(new CustomEvent('iqcloud:preferences', { detail: next }));
  return next;
}
export const APP_RUNTIME_DEFAULTS = defaults;
