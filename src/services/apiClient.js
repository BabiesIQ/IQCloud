import { APP_RUNTIME_DEFAULTS, getPreferences } from '@/config/runtime.config';
// All new API integrations must use this client, never hard-code a backend URL.
export async function apiRequest(path, { method = 'GET', body, headers = {}, signal } = {}) {
  if (!path.startsWith('/') || path.startsWith('//')) throw Error('API path must be relative');
  const response = await fetch(APP_RUNTIME_DEFAULTS.apiBaseUrl + path, {
    method, credentials: 'include', signal,
    headers: { 'Accept-Language': getPreferences().language, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) { const error = new Error(data?.error || 'Request failed'); error.details = data || {}; error.status = response.status; throw error; }
  return data;
}
