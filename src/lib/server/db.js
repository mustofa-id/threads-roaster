import { env } from '$env/dynamic/private';

const db_url = `https://${env.SUPABASE_PROJECT_REF}.supabase.co/rest/v1`;

/** @type {Map<string, ThreadsRoast>} */
const cached_roast = new Map();

/**
 *
 * @param {string} username
 * @param {keyof import('./api').supported_langs} lang
 * @returns {Promise<ThreadsRoast | undefined>}
 */
export async function get_roast(username, lang) {
	try {
		const cache_key = `${username}:${String(lang)}`;
		const cached = cached_roast.get(cache_key);
		if (cached) return cached;

		const params = new URLSearchParams({
			select: 'result,created_at',
			username: `eq.${username}`,
			lang: `eq.${String(lang)}`
		});
		const response = await fetch(`${db_url}/threads_roast?${params}`, {
			method: 'GET',
			headers: {
				apikey: env.SUPABASE_ANON_KEY,
				Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
				Range: '0-9'
			}
		});
		const data = await response.json();
		if (data[0]) cached_roast.set(cache_key, data[0]);
		return data[0];
	} catch (error) {
		console.error(error);
	}
}

/**
 * @param {Omit<ThreadsRoast, 'created_at'>} roast
 */
export async function set_roast(roast) {
	try {
		const response = await fetch(`${db_url}/threads_roast`, {
			method: 'POST',
			headers: {
				apikey: env.SUPABASE_ANON_KEY,
				Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
				'Content-Type': 'application/json',
				Prefer: 'return=minimal'
			},
			body: JSON.stringify(roast)
		});
		if (!response.ok) {
			const data = await response.text();
			throw new Error(`status: ${response.status} | ${data}`);
		}
	} catch (error) {
		console.error(error);
	}
}
