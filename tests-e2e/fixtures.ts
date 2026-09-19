import { test as base, expect, type Page } from '@playwright/test';

/** Unhandled application errors fail interaction tests even if the static HTML looks correct. */
export const test = base.extend({
	page: async ({ page }, use) => {
		const errors: string[] = [];
		page.on('pageerror', (error) => errors.push(error.message));
		await use(page);
		expect(errors, 'Unhandled browser errors').toEqual([]);
	}
});
export { expect };
export async function ready(page: Page) {
	await expect(page.locator('html')).toHaveAttribute('data-app-ready', 'true');
}
