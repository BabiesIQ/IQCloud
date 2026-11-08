import { mockData, mockMeta } from './mockData';
import { policies } from './policies';

// Never block the entire React module graph on a third-party SDK.
const unavailable = { ok: false, error: { message: 'Service unavailable. Please try again later.' } };
const fallbackSession = {
  ui: null, initFailed: true,
  user: () => null,
  subscribe: () => () => {},
  login: async () => unavailable,
  register: async () => unavailable,
  logout: async () => unavailable,
  sendResetLink: async () => unavailable,
  retry: async () => unavailable,
};
const fallback = {
  session: fallbackSession,
  db: new Proxy({}, { get: () => async () => unavailable }),
};
let live = fallback;
export const sdk = new Proxy({}, {
  get: (_, key) => live[key] ?? fallback[key],
});
async function boot() {
  if (!window.ApperSDK?.MemoryAdapter || !window.ApperSDK?.CoreSDK?.createClient) return;
  try {
    const adapter = window.ApperSDK.MemoryAdapter({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY,
      seed: mockData, meta: mockMeta, policies, team: {},
    });
    const client = await Promise.race([
      window.ApperSDK.CoreSDK.createClient(adapter),
      new Promise((_, reject) => setTimeout(() => reject(new Error('SDK timeout')), 6000)),
    ]);
    if (client?.session) {
      live = client;
      window.dispatchEvent(new Event('iqcloud:sdk-ready'));
    }
  } catch (error) {
    console.error('Legacy SDK failed to initialize:', error);
  }
}
void boot();
