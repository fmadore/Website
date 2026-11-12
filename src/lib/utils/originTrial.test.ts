import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * The WebMCP origin-trial token, and its expiry. A deliberate time bomb.
 *
 * Stock Chrome exposes `document.modelContext` (and with it the site's agent
 * tools) only to pages carrying the token in `src/app.html`. Chrome ignores an
 * expired token *silently*: nothing in the build, the CSP, the console or
 * `check:agentic` (which runs with the experimental flag on) notices, and the
 * tools simply vanish for every visitor. So this test reads the token, proves it
 * is the one registered for this site and feature, and starts failing thirty
 * days before it lapses, while there is still time to renew.
 *
 * Token layout (Chromium `TrialToken`): one version byte, a 64-byte Ed25519
 * signature, a 4-byte big-endian payload length, then the JSON payload.
 *
 * Renewal and removal: CLAUDE.md § WebMCP.
 */

const RENEW_URL = 'https://developer.chrome.com/origintrials/#/register_trial/4163014905550602241';
const WARNING_DAYS = 30;
const DAY_MS = 86_400_000;

const html = readFileSync(fileURLToPath(new URL('../../app.html', import.meta.url)), 'utf8');
const tag = /<meta\s+http-equiv="origin-trial"\s+content="([^"]+)"/.exec(html);

function decode(token: string): { origin: string; feature: string; expiry: number } {
	const bytes = Buffer.from(token, 'base64');
	const length = bytes.readUInt32BE(65);
	return JSON.parse(bytes.subarray(69, 69 + length).toString('utf8'));
}

describe('the WebMCP origin-trial token in src/app.html', () => {
	it('is present', () => {
		expect(
			tag,
			'No origin-trial <meta> in src/app.html. If the trial has ended, delete this test along with the tag and the CLAUDE.md § WebMCP paragraph.'
		).not.toBeNull();
	});

	it('is registered for this site and for WebMCP', () => {
		const payload = decode(tag![1]!);
		expect(payload.origin).toBe('https://www.frederickmadore.com:443');
		expect(payload.feature).toBe('WebMCP');
		expect(Number.isInteger(payload.expiry)).toBe(true);
	});

	it(`does not expire within ${WARNING_DAYS} days`, () => {
		const expiry = decode(tag![1]!).expiry * 1000;
		const daysLeft = Math.floor((expiry - Date.now()) / DAY_MS);
		const date = new Date(expiry).toISOString().slice(0, 10);
		expect(
			daysLeft,
			`The WebMCP origin-trial token expires on ${date} (${daysLeft} days). Chrome drops an expired token silently, and the agent tools disappear for every visitor. Renew it at ${RENEW_URL} (Google's renewal email links there too) and replace the content of the origin-trial <meta> in src/app.html, updating the expiry date in its comment and in CLAUDE.md § WebMCP; or, if the trial has ended, remove the tag and this test.`
		).toBeGreaterThanOrEqual(WARNING_DAYS);
	});
});
