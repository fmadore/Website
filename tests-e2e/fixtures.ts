import { test as base, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Unhandled application errors fail interaction tests even if the static HTML
 * looks correct — and so does anything the Content Security Policy blocks: the
 * policy allows no inline script but the hashed ones, so a blocked script is a
 * broken page, in whichever engine reports it.
 */
export const test = base.extend({
	page: async ({ page }, use) => {
		const errors: string[] = [];
		const cspViolations: string[] = [];
		page.on('pageerror', (error) => errors.push(error.message));
		page.on('console', (message) => {
			if (/content[- ]security[- ]policy/i.test(message.text())) {
				cspViolations.push(message.text());
			}
		});
		await use(page);
		expect(errors, 'Unhandled browser errors').toEqual([]);
		expect(cspViolations, 'Content Security Policy violations').toEqual([]);
	}
});
export { expect };
export async function ready(page: Page) {
	await expect(page.locator('html')).toHaveAttribute('data-app-ready', 'true');
}

/**
 * The WCAG conformance tags every scan runs: the stable A/AA sets, not the
 * advisory best-practice rules. WCAG 2.2 AA is the target recorded in
 * PRODUCT.md, so wcag22aa is included — it enforces target size (2.5.8) and
 * focus not obscured (2.4.11).
 */
export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * An axe scan of the page at the site's conformance target, plus Label in
 * Name (SC 2.5.3, Level A). axe ships that rule as experimental and off even
 * under the wcag21a tag, which is how an "All" chip whose aria-label ("All
 * types") did not contain its visible text ("All 44") passed 76 clean scans:
 * a speech-input user saying what they see could not press it.
 */
export function wcagScan(page: Page): AxeBuilder {
	return new AxeBuilder({ page })
		.withTags(WCAG_TAGS)
		.options({ rules: { 'label-content-name-mismatch': { enabled: true } } });
}
