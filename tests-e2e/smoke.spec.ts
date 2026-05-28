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
