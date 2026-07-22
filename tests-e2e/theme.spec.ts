import { test, expect } from '@playwright/test';

/**
 * Theme E2E: the masthead toggle flips daylight <-> midnight by swapping the
 * `light`/`dark` class on <html> and persisting the choice to localStorage.
 */

test('theme toggle switches to dark and persists across navigation', async ({ page }) => {
	// Pin the OS preference so the initial theme is deterministic.
	await page.emulateMedia({ colorScheme: 'light' });
	await page.goto('/');

	const html = page.locator('html');
	await expect(html).not.toHaveClass(/\bdark\b/);

	// The toggle only works once the app has hydrated, and there is no DOM
	// marker for that moment — so retry the click until the class flips,
	// guarded so an already-applied toggle is never clicked twice.
	await expect(async () => {
		const isDark = await html.evaluate((el) => el.classList.contains('dark'));
		if (!isDark) await page.getByRole('button', { name: 'Switch to dark theme' }).click();
		await expect(html).toHaveClass(/\bdark\b/, { timeout: 1000 });
	}).toPass({ timeout: 15_000 });
	// The toggle's accessible name flips with the theme.
	await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible();

	// Client-side navigation keeps the class (same document, SvelteKit router).
	await page.locator('header').getByRole('link', { name: 'Activities', exact: true }).click();
	await expect(page).toHaveURL(/\/activities$/);
	await expect(html).toHaveClass(/\bdark\b/);

	// A full reload restores it from localStorage.
	await page.reload();
	await expect(html).toHaveClass(/\bdark\b/);

	// And it toggles back.
	await page.getByRole('button', { name: 'Switch to light theme' }).click();
	await expect(html).not.toHaveClass(/\bdark\b/);
});
