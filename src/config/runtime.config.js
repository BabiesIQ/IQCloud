// Public, non-secret browser configuration. Do not put API keys here.
const DEFAULT_API = 'https://api.cloud.babiesiq.tech';
const KEY = 'iqcloud:preferences:v1';
const defaults = Object.freeze({ theme: 'system', language: 'en', apiBaseUrl: DEFAULT_API });
function safeApiUrl(value) {
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' || u.username || u.password || u.search || u.hash || u.pathname !== '/') return null;
    // Prevent browser-config changes from redirecting credentials to arbitrary origins.
    if (u.hostname !== 'babiesiq.tech' && !u.hostname.endsWith('.babiesiq.tech')) return null;
    return u.origin;
  } catch { return null; }
}
export function getPreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...defaults, theme: ['light','dark','system'].includes(stored.theme) ? stored.theme : defaults.theme,
      language: ['en','hi'].includes(stored.language) ? stored.language : defaults.language,
      apiBaseUrl: safeApiUrl(stored.apiBaseUrl) || DEFAULT_API };
  } catch { return { ...defaults }; }
}
export function updatePreferences(patch) {
  const next = { ...getPreferences(), ...patch };
  if (!['light','dark','system'].includes(next.theme)) throw Error('Invalid theme');
  if (!['en','hi'].includes(next.language)) throw Error('Invalid language');
  if (!safeApiUrl(next.apiBaseUrl)) throw Error('API URL must be HTTPS on babiesiq.tech');
  next.apiBaseUrl = safeApiUrl(next.apiBaseUrl);
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private browsing */ }
  window.dispatchEvent(new CustomEvent('iqcloud:preferences', { detail: next }));
  return next;
}
export const APP_RUNTIME_DEFAULTS = defaults;
