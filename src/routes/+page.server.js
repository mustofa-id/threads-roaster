import { default_lang, roast_threads_user, supported_langs } from '$lib/server/api.js';
import { isHttpError, redirect } from '@sveltejs/kit';

export async function load({ url }) {
	const username = url.searchParams.get('u');
	const lang = /** @type {keyof supported_langs} */ (url.searchParams.get('l'));

	if (!Object.keys(supported_langs).includes(lang)) {
		const target = new URL(url);
		target.searchParams.set('l', default_lang[0]);
		redirect(307, target);
	}

	let result = '';
	let message = '';

	if (username) [result, message] = await start_roasting(username, lang);

	return {
		supported_langs,
		setup: { username, lang },
		result,
		message
	};
}

/**
 *
 * @param {string} username
 * @param {keyof supported_langs} lang
 * @returns {Promise<[string, string]>}
 */
async function start_roasting(username, lang) {
	if (!is_username_valid(username)) return ['', 'Username tidak valid'];
	try {
		const result = await roast_threads_user(username, lang);
		return [result, ''];
	} catch (error) {
		console.error({ username, lang, error });
		const message = isHttpError(error)
			? error.body?.message || 'Error tidak dikenal'
			: 'Server error! Tidak dapat melakukan roasting sekarang';
		return ['', message];
	}
}

/**
 * Based on https://stackoverflow.com/a/17087528
 *
 * @param {string} username
 * @returns {boolean}
 */
function is_username_valid(username) {
	// TODO: allow @ char
	return /^[a-zA-Z0-9._]{1,30}$/.test(username);
}
