import { test, expect } from '@playwright/test';

test('mobile navigation is usable without horizontal overflow', async ({ page, isMobile }) => {
	test.skip(!isMobile, 'Covered by the mobile Chromium project');

	await page.goto('/');
	const menuButton = page.getByRole('button', { name: /toggle navigation menu/i });
	await expect(menuButton).toBeVisible();
	// 44x44 is the platform touch-target guideline (WCAG 2.2 SC 2.5.8 requires
	// only 24x24; this is deliberately above the floor for the primary nav).
	await expect(menuButton).toHaveCSS('width', '44px');
	await expect(menuButton).toHaveCSS('height', '44px');
	await menuButton.click();
	await expect(page.getByRole('navigation', { name: /mobile/i })).toBeVisible();

	for (const path of ['/', '/publications', '/cv', '/publications/visualisations']) {
		await page.goto(path);
		await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - document.documentElement.clientWidth
		);
		expect(overflow, `${path} should not overflow horizontally`).toBeLessThanOrEqual(1);
	}
});
