import { test, expect } from '@playwright/test';

/**
 * Smoke tests: confirm the key prerendered routes load and render their core
 * content. Intentionally light — guards against build/route regressions
 * without coupling to copy or markup details.
 */

test('home page loads with the author name', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/Frédérick Madore/i);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('main list pages load with a top-level heading', async ({ page }) => {
	// Note: the communications list lives at /conference-activity; /communications
	// only has detail routes (/communications/[id]).
	for (const path of ['/publications', '/conference-activity', '/activities']) {
		const response = await page.goto(path);
		expect(response?.status(), `${path} should respond 200`).toBe(200);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	}
});

test('visualisation pages render their network graphs and controls', async ({ page }) => {
	const cases = [
		{ path: '/publications/visualisations', heading: 'Author Collaboration Network' },
		{ path: '/conference-activity/visualisations', heading: 'Co-presenter network' }
	];
	for (const { path, heading } of cases) {
		await page.goto(path);
		const section = page.locator('section').filter({ hasText: heading }).first();
		await section.scrollIntoViewIfNeeded();
		// The graph renders to a canvas, and the accessible node list is populated.
		await expect(section.locator('canvas')).toBeVisible();
		await expect(section.locator('ul.sr-only li').first()).toBeAttached();
		// Controls: the search box filters the graph; typing updates its value.
		const search = section.locator('.network-controls input[type="search"]');
		await expect(search).toBeVisible();
		await search.fill('a');
		await expect(search).toHaveValue('a');
	}
});

test('rss.xml is served and is a well-formed feed', async ({ page, request }) => {
	const response = await request.get('/rss.xml');
	expect(response.status()).toBe(200);
	const xml = await response.text();
	// Parse in the browser (Node has no DOMParser); the page starts blank.
	const parsed = await page.evaluate((xmlText) => {
		const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
		return {
			hasParseError: doc.getElementsByTagName('parsererror').length > 0,
			root: doc.documentElement.nodeName,
			itemCount: doc.getElementsByTagName('item').length,
			channelTitle: doc.querySelector('channel > title')?.textContent ?? ''
		};
	}, xml);
	expect(parsed.hasParseError).toBe(false);
	expect(parsed.root).toBe('rss');
	expect(parsed.itemCount).toBeGreaterThanOrEqual(10);
	expect(parsed.channelTitle).toContain('Frédérick Madore');
});

test('sitemap.xml is served and is a well-formed urlset', async ({ page, request }) => {
	const response = await request.get('/sitemap.xml');
	expect(response.status()).toBe(200);
	const xml = await response.text();
	const parsed = await page.evaluate((xmlText) => {
		const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
		const locs = Array.from(doc.getElementsByTagName('loc')).map((el) => el.textContent ?? '');
		return {
			hasParseError: doc.getElementsByTagName('parsererror').length > 0,
			root: doc.documentElement.nodeName,
			urlCount: doc.getElementsByTagName('url').length,
			firstLoc: locs[0] ?? ''
		};
	}, xml);
	expect(parsed.hasParseError).toBe(false);
	expect(parsed.root).toBe('urlset');
	expect(parsed.urlCount).toBeGreaterThanOrEqual(50);
	expect(parsed.firstLoc).toContain('frederickmadore.com');
});

test('an unknown path renders the static 404 page', async ({ page }) => {
	const response = await page.goto('/this-page-does-not-exist');
	// `serve` (like GitHub Pages) responds with the prerendered 404.html and a
	// real 404 status. The content assertions are the primary guard in case a
	// different static server maps the error page to another status.
	expect(response?.status()).toBe(404);
	await expect(page).toHaveTitle(/Page not found/i);
	await expect(page.getByRole('heading', { level: 1 })).toContainText(/couldn.t be found/i);
});

test('a publication detail page injects JSON-LD structured data', async ({ page }) => {
	await page.goto('/publications');
	// Follow the first real publication item through to its detail page,
	// excluding the visualisations link which also lives under /publications/.
	const firstItem = page
		.locator('main a[href*="/publications/"]:not([href*="visualisations"])')
		.first();
	await firstItem.click();
	await expect(page).toHaveURL(/\/publications\/[^/]+$/);
	// At least one JSON-LD block (layout-level site schema + the page's own).
	const jsonLd = page.locator('script[type="application/ld+json"]');
	expect(await jsonLd.count()).toBeGreaterThan(0);
});
