import { browser } from '$app/environment';
import { api } from './rpc';

const KEY = 'freelancer_access_id';
const NAME_KEY = 'freelancer_display_name';

function createAuth() {
	let userId = $state<string | null>(null);
	let verified = $state(false);
	let loading = $state(true);
	let displayName = $state<string | null>(null);

	function initials(name: string) {
		return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
	}

	async function init() {
		if (!browser) return;
		const stored = localStorage.getItem(KEY);
		if (stored) {
			try {
				const valid = await api.verifyUser(stored);
				if (valid) {
					userId = stored;
					verified = true;
					// Load name if not cached
					const cachedName = localStorage.getItem(NAME_KEY);
					if (cachedName) {
						displayName = cachedName;
					} else {
						const user = await api.getUserById(stored);
						if (user?.name) {
							displayName = user.name;
							localStorage.setItem(NAME_KEY, user.name);
						}
					}
				} else {
					localStorage.removeItem(KEY);
					localStorage.removeItem(NAME_KEY);
				}
			} catch {
				userId = stored;
				verified = true;
				displayName = localStorage.getItem(NAME_KEY);
			}
		}
		loading = false;
	}

	function login(id: string, name?: string) {
		if (!browser) return;
		localStorage.setItem(KEY, id);
		userId = id;
		verified = true;
		if (name) {
			displayName = name;
			localStorage.setItem(NAME_KEY, name);
		}
	}

	function logout() {
		if (!browser) return;
		localStorage.removeItem(KEY);
		localStorage.removeItem(NAME_KEY);
		userId = null;
		verified = false;
		displayName = null;
	}

	return {
		get userId() { return userId; },
		get verified() { return verified; },
		get loading() { return loading; },
		get displayName() { return displayName; },
		get avatarInitials() {
			if (displayName) return initials(displayName);
			if (userId) return userId.slice(0, 2).toUpperCase();
			return '??';
		},
		init,
		login,
		logout
	};
}

export const auth = createAuth();
