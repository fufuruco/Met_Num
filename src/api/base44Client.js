import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Create a client - token comes from URL param or localStorage via appParams
// The SDK also automatically reads from localStorage via getAccessToken() internally
export const base44 = createClient({
  appId,
  token,       // appParams reads this from ?access_token= or localStorage
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});
