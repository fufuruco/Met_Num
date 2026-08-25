const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `base44_${toSnakeCase(paramName)}`;
	
	// Check both search and hash for the parameter
	const searchParams = new URLSearchParams(window.location.search);
	const hashQueryIndex = window.location.hash.indexOf('?');
	const hashParams = hashQueryIndex !== -1 ? new URLSearchParams(window.location.hash.substring(hashQueryIndex)) : new URLSearchParams();
	
	let searchParam = searchParams.get(paramName) || hashParams.get(paramName);
	
	// Also check for 'token' if paramName is 'access_token' (but not on reset-password page)
	if (!searchParam && paramName === 'access_token') {
		const isResetPassword = window.location.pathname.endsWith('/reset-password') || window.location.hash.includes('reset-password');
		if (!isResetPassword) {
			searchParam = searchParams.get('token') || hashParams.get('token');
		}
	}

	if (removeFromUrl && searchParam) {
		searchParams.delete(paramName);
		if (paramName === 'access_token') searchParams.delete('token');
		
		let newHash = window.location.hash;
		if (hashQueryIndex !== -1) {
			hashParams.delete(paramName);
			if (paramName === 'access_token') hashParams.delete('token');
			const hashParamStr = hashParams.toString();
			newHash = window.location.hash.substring(0, hashQueryIndex) + (hashParamStr ? `?${hashParamStr}` : '');
		}

		const newUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}${newHash}`;
		window.history.replaceState({}, document.title, newUrl);
	}

	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = storage.getItem(storageKey);
	if (storedValue && storedValue !== 'undefined' && storedValue !== 'null' && storedValue.trim() !== '') {
		return storedValue;
	}
	return defaultValue || null;
}

const DEFAULT_APP_ID = import.meta.env.VITE_BASE44_APP_ID || (typeof window !== 'undefined' && window.__BASE44_APP_ID__) || "6a452807c71f0d92851a2884";
const DEFAULT_APP_BASE_URL = import.meta.env.VITE_BASE44_APP_BASE_URL || 'https://solve-num-lab.base44.app';
const isGitHubPages = typeof window !== 'undefined' && window.location.hostname === 'fufuruco.github.io';

const getAppParams = () => {
	if (getAppParamValue("clear_access_token") === 'true') {
		storage.removeItem('base44_access_token');
		storage.removeItem('token');
	}
	const resolvedAppId = isGitHubPages
		? DEFAULT_APP_ID
		: getAppParamValue("app_id", { defaultValue: DEFAULT_APP_ID }) || DEFAULT_APP_ID;
	const resolvedBaseUrl = isGitHubPages
		? DEFAULT_APP_BASE_URL
		: getAppParamValue("app_base_url", { defaultValue: DEFAULT_APP_BASE_URL }) || DEFAULT_APP_BASE_URL;
	return {
		appId: resolvedAppId,
		token: getAppParamValue("token", { removeFromUrl: true }) || getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION }),
		appBaseUrl: resolvedBaseUrl,
	}
}

export const appParams = {
	...getAppParams()
}
