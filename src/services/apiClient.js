// White-label only human-readable backend notices. Never rewrite DNS targets,
 // payment URLs, route identifiers or technical connection fields.
export function brandVisibleMessage(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/\\bRailway\\b(?!\\.(?:app|com|net)\\b)/gi, 'BabiesIQ Cloud');
}
const VISIBLE_MESSAGE_FIELDS = new Set(['message', 'error', 'notice', 'description', 'reason', 'hint', 'warning', 'warnings', 'problems', 'purpose']);
function normalizeVisibleMessages(value, visible = false) {
  if (typeof value === 'string') return visible ? brandVisibleMessage(value) : value;
  if (Array.isArray(value)) return value.map(entry => normalizeVisibleMessages(entry, visible));
  if (value && typeof value === 'object') return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, normalizeVisibleMessages(entry, visible || VISIBLE_MESSAGE_FIELDS.has(key))])
  );
  return value;
}
import { APP_RUNTIME_DEFAULTS, getPreferences } from '@/config/runtime.config';
// All new API integrations must use this client, never hard-code a backend URL.
export async function apiRequest(path, { method = 'GET', body, headers = {}, signal } = {}) {
  if (!path.startsWith('/') || path.startsWith('//')) throw Error('API path must be relative');
  const response = await fetch(APP_RUNTIME_DEFAULTS.apiBaseUrl + path, {
    method, credentials: 'include', signal,
    headers: { 'Accept-Language': getPreferences().language, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const raw = await response.json().catch(() => null);
  const data = normalizeVisibleMessages(raw);
  if (!response.ok) { const error = new Error(data?.error || 'Request failed'); error.details = data || {}; error.status = response.status; throw error; }
  return data;
}
