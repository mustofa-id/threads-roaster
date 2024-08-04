import { env } from '$env/dynamic/private';
import { GoogleGenerativeAI } from '@google/generative-ai';
import puppeteer from 'puppeteer';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const supported_langs = { id: 'Indonesia' }; // TODO: support more languages
const default_lang = Object.entries(supported_langs)[0];

export async function load({ url }) {
	const username = url.searchParams.get('u');
	const lang = /** @type {keyof supported_langs} */ (url.searchParams.get('l') || default_lang[0]);

	let message = '';
	let result = '';

	if (username) {
		if (is_username_valid(username)) {
			try {
				result = await roast_threads_user(username, lang);
			} catch (error) {
				console.error(error);
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
 * Generate roast text using Gemini
 *
 * @param {string} username
 * @param {keyof supported_langs} lang
 * @returns {Promise<string>}
 */
async function roast_threads_user(username, lang) {
	const content = await get_threads_user_profile(username);
	if (!content) throw new Error(`Failed to retrieve Threads user information`);

	const prompt =
		`Gunakan bahasa ${supported_langs[lang] || default_lang[1]}, berikan roasting singkat ` +
		`dengan kejam dan menyindir dalam bahasa gaul untuk profile ` +
		`Threads berikut: ${username}. Berikut detail dan ` +
		`beberapa thread-nya: ${content}`;

	const result = await model.generateContent(prompt);
	return result.response.text();
}

/**
 * Scrap Threads user profile by username. Using scaping method for
 * now because Threads API required complicated steps
 *
 * @param {string} username
 * @returns {Promise<string | null>}
 */
async function get_threads_user_profile(username) {
	let browser;
	try {
		username = username.startsWith('@') ? username : '@' + username;
		browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.goto(`https://www.threads.net/${username}`);
		await page.waitForNetworkIdle();
		const content = await page.evaluate(() => {
			const layout = document.querySelector(`div#barcelona-page-layout`);
			if (!layout) return null;
			for (let i = 0; i < 3; i++) {
				if (layout.lastChild) layout.removeChild(layout.lastChild);
			}
			return layout.textContent;
		});
		return (
			content
				?.replace('threads.net', ' ')
				?.replace(RegExp(username.slice(1), 'g'), ' ')
				?.replace(/Like\d*Comment\d*Repost\d*Share\d*/g, '')
				?.replace(/(?<!\s)More(?!\s)/g, ' ') || null
		);
	} finally {
		await browser?.close();
	}
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
