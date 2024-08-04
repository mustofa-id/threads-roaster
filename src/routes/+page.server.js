import { default_lang, roast_threads_user, supported_langs } from '$lib/server/api.js';

export async function load({ url }) {
	const username = url.searchParams.get('u');

	let lang = /** @type {keyof supported_langs} */ (url.searchParams.get('l') || default_lang[0]);
	let message = '';
	let result = '';

	if (!Object.keys(supported_langs).includes(lang)) {
		lang = default_lang[0];
	}

	if (username) {
		if (is_username_valid(username)) {
			try {
				result = await roast_threads_user(username, lang);
			} catch (error) {
				console.error({ username, lang, error });
				message = 'Server error! Tidak dapat melakukan roasting sekarang';
			}
		} else {
			message = 'Username tidak valid';
		}
	}

	return {
		supported_langs,
		setup: { username, lang },
		message,
		result
	};
}

/**
 * Based on this SO https://stackoverflow.com/a/17087528
 *
 * @param {string} username
 * @returns {boolean}
 */
function is_username_valid(username) {
	// TODO: allow @ char
	return /^[a-zA-Z0-9._]{1,30}$/.test(username);
}
