import { env } from '$env/dynamic/private';
import { GoogleGenerativeAI } from '@google/generative-ai';
import puppeteer from 'puppeteer';
import { get_roast, set_roast } from './db';

export const supported_langs = { id: 'Indonesia' }; // TODO: support more languages
export const default_lang = Object.entries(supported_langs)[0];

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Generate roast text using Gemini
 *
 * @param {string} username
 * @param {keyof supported_langs} lang
 * @returns {Promise<string>}
 */
export async function roast_threads_user(username, lang) {
	const cached = await get_roast(username, lang);
	if (cached?.result) return cached.result;

	const content = await get_threads_user_profile(username);
	if (!content) throw new Error(`Failed to retrieve Threads user information`);

	const prompt =
		`Gunakan bahasa ${supported_langs[lang] || default_lang[1]}, berikan roasting singkat ` +
		`dengan kejam dan menyindir dalam bahasa gaul untuk profile ` +
		`Threads berikut: ${username}. Berikut detail dan ` +
		`beberapa thread-nya: ${content}`;

	const result = await model.generateContent(prompt);
	const text = result.response.text();
	set_roast({ username, lang, result: text });
	return text;
}

/**
 * Scrap Threads user profile by username. Using scaping method for
 * now because Threads API required complicated steps
 *
 * @param {string} username
 * @returns {Promise<string | null>}
 */
export async function get_threads_user_profile(username) {
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
