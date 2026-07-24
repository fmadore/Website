import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Automated accessibility smoke: run axe-core against a representative page of
 * each shape — the home page, a filtered list index, and a content detail
 * page — and assert zero WCAG 2 A/AA violations. Catches regressions like
 * missing labels, contrast failures, and broken heading order that the
 * unit/smoke suites can't see.
 *
 * Scoped to the stable wcag2a/wcag2aa/wcag21a/wcag21aa tag set (not
 * best-practice rules, which are advisory and noisier).
 */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const pages: { name: string; path: string }[] = [
	{ name: 'home', path: '/' },
	{ name: 'publications list', path: '/publications' },
	{ name: 'CV', path: '/cv' }
];

for (const { name, path } of pages) {
	test(`${name} has no WCAG A/AA violations`, async ({ page }) => {
		await page.goto(path);
		// Wait for the primary heading so we scan the hydrated page, not a shell.
		await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

		const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

		expect(
			results.violations,
			results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`).join('\n')
		).toEqual([]);
	});
}
