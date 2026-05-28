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

test('main navigation links reach their list pages', async ({ page }) => {
	for (const path of ['/publications', '/communications', '/activities']) {
		const response = await page.goto(path);
		expect(response?.status(), `${path} should respond 200`).toBe(200);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	}
});

test('a publication detail page injects JSON-LD structured data', async ({ page }) => {
	await page.goto('/publications');
	// Follow the first publication link through to its detail page.
	const firstItem = page.locator('a[href*="/publications/"]').first();
	await firstItem.click();
	await expect(page).toHaveURL(/\/publications\/.+/);
	const jsonLd = page.locator('script[type="application/ld+json"]');
	await expect(jsonLd.first()).toHaveCount(1);
});
