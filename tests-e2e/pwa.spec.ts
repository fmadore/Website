import { test, expect, ready } from './fixtures';

test('the app owns exactly one service-worker registration', async ({ page }) => {
	await page.goto('/');
	await ready(page);
	await page.waitForFunction(async () => {
		if (!('serviceWorker' in navigator)) return false;
		await navigator.serviceWorker.ready;
		return true;
	});

	const registrations = await page.evaluate(async () => {
		const items = await navigator.serviceWorker.getRegistrations();
		return items.map(({ scope }) => scope);
	});
	expect(registrations).toEqual([new URL(page.url()).origin + '/']);
});

test('visited pages reload offline and unvisited pages show the offline document', async ({
	page,
	context
}) => {
	await page.goto('/');
	await ready(page);
	await page.waitForFunction(() => !!navigator.serviceWorker.controller);
	await page.goto('/publications?type=book');
	await ready(page);
	await expect(page.getByRole('button', { name: /^Books/ })).toHaveClass(/chip--selected/);
	await page.waitForFunction(async () => !!(await caches.match(location.href)));
	await context.setOffline(true);
	await page.reload();
	await ready(page);
	await expect(page.getByRole('button', { name: /^Books/ })).toHaveClass(/chip--selected/);
	await page.goto('/not-previously-visited-offline');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('offline');
});

/** Exercise the update prompt deterministically; caching itself uses a real worker above. */
async function waitingUpdate(page: import('@playwright/test').Page) {
	await page.addInitScript(() => {
		const manager = Object.assign(new EventTarget(), { controller: {} });
		const registration = Object.assign(new EventTarget(), {
			installing: null,
			waiting: sessionStorage.getItem('update-accepted')
				? null
				: {
						postMessage(message: { type: string }) {
							if (message.type === 'SKIP_WAITING') {
								sessionStorage.setItem('update-accepted', 'true');
								manager.dispatchEvent(new Event('controllerchange'));
							}
						}
					}
		});
		Object.assign(manager, { register: async () => registration });
		Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: manager });
	});
	await page.goto('/');
	await ready(page);
	await expect(page.getByRole('heading', { name: 'Update available' })).toBeVisible();
}

test('deferring an update keeps the page and reoffers it after navigation', async ({ page }) => {
	await waitingUpdate(page);
	await page.getByRole('button', { name: 'Later', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Update available' })).toHaveCount(0);
	await page.getByRole('link', { name: 'Publications', exact: true }).first().click();
	await expect(page).toHaveURL(/\/publications$/);
	await expect(page.getByRole('heading', { name: 'Update available' })).toBeVisible();
});

test('accepting an update activates the worker and reloads the document', async ({ page }) => {
	await waitingUpdate(page);
	const navigated = page.waitForEvent('framenavigated', (frame) => frame === page.mainFrame());
	await page.getByRole('button', { name: 'Reload', exact: true }).click();
	await navigated;
	await ready(page);
	expect(await page.evaluate(() => sessionStorage.getItem('update-accepted'))).toBe('true');
	await expect(page.getByRole('heading', { name: 'Update available' })).toHaveCount(0);
});
