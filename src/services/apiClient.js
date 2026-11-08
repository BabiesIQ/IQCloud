import { getPreferences } from '@/config/runtime.config';
// All new API integrations must use this client, never hard-code a backend URL.
export async function apiRequest(path, { method = 'GET', body, headers = {}, signal } = {}) {
  if (!path.startsWith('/') || path.startsWith('//')) throw Error('API path must be relative');
  const { apiBaseUrl } = getPreferences();
  const response = await fetch(apiBaseUrl + path, {
    method, credentials: 'include', signal,
    headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw Error(data?.error || 'Request failed');
  return data;
}
