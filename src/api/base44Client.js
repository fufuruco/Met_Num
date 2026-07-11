import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;
const serverUrl = appBaseUrl || import.meta.env.VITE_BASE44_APP_BASE_URL || 'https://num-lab-engine-copy-7efa729f.base44.app';

//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl,
  requiresAuth: false,
  appBaseUrl
});
