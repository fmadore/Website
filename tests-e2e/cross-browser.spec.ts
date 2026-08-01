import { test, expect } from '@playwright/test';

test('core content and an embedded project render across browser engines', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

	await page.goto('/publications');
	await expect(page.locator('ol.bib-list > li').first()).toBeVisible();

	await page.goto('/digital-humanities/iwac-sentiment-analysis');
	const iframe = page.locator('#iwac-sentiment-analysis-embed');
	await expect(iframe).toBeAttached();
	await expect(iframe).toHaveAttribute('loading', 'lazy');
	await expect(iframe).toHaveAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
	await expect(iframe).toHaveAttribute('sandbox', /allow-scripts/);
});
