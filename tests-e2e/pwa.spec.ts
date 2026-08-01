import { test, expect } from '@playwright/test';

test('the app owns exactly one service-worker registration', async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(async () => {
		if (!('serviceWorker' in navigator)) return false;
		await navigator.serviceWorker.ready;
		return true;
	});

	const registrations = await page.evaluate(async () => {
		const items = await navigator.serviceWorker.getRegistrations();
		return items.map(({ scope }) => scope);
	});
	expect(registrations).toEqual(['http://localhost:4173/']);
});
