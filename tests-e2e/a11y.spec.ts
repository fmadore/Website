import { test, expect, ready, wcagScan } from './fixtures';

/**
 * Automated accessibility smoke: run axe-core against a representative page of
 * each shape — the home page, a filtered list index, and a content detail
 * page — and assert zero WCAG 2 A/AA violations. Catches regressions like
 * missing labels, contrast failures, and broken heading order that the
 * unit/smoke suites can't see.
 *
 * The rule set is `wcagScan` in fixtures.ts: the WCAG A/AA tags plus the
 * Label in Name rule axe leaves off by default.
 */

const pages: { name: string; path: string }[] = [
	{ name: 'home', path: '/' },
	{ name: 'publications list', path: '/publications' },
	// The other two indexes: the same facet apparatus in two further
	// configurations, where the "All" chips' Label in Name failure also shipped.
	{ name: 'talks index', path: '/conference-activity' },
	{ name: 'activities log', path: '/activities' },
	{ name: 'CV', path: '/cv' },
	// A content detail page — the citation path, and the only page family
	// carrying the accent CTA.
	{ name: 'publication detail', path: '/publications/beninese-imam-election-2022' },
	// The densest chrome on the site: charts, the SVG network graph with its
	// focusable nodes, sliders, chips and a datalist-backed search field.
	{ name: 'publication visualisations', path: '/publications/visualisations' }
];

/**
 * Midnight is a designed pass, not an inversion, so it is scanned as its own
 * theme rather than assumed to inherit daylight's results. The detail page is
 * included deliberately: a paper-on-accent contrast failure on the primary CTA
 * once shipped precisely because dark mode was only ever scanned on the home
 * page, where that button does not appear.
 */
const darkPages: { name: string; path: string }[] = [
	{ name: 'home', path: '/' },
	{ name: 'publication detail', path: '/publications/beninese-imam-election-2022' },
	{ name: 'publications list', path: '/publications' }
];

for (const { name, path } of pages) {
	test(`${name} has no WCAG A/AA violations`, async ({ page }) => {
		test.setTimeout(path.includes('visualisations') ? 60_000 : 30_000);
		await page.goto(path);
		await ready(page);
		// Readiness above proves hydration; the heading establishes the page being scanned.
		await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

		const results = await wcagScan(page).analyze();

		expect(
			results.violations,
			results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`).join('\n')
		).toEqual([]);
	});
}

for (const { name, path } of darkPages) {
	test(`${name} has no WCAG A/AA violations in dark mode`, async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'dark' });
		await page.goto(path);
		await ready(page);
		await expect(page.locator('html')).toHaveClass(/\bdark\b/);
		await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

		const results = await wcagScan(page).analyze();
		expect(
			results.violations,
			results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`).join('\n')
		).toEqual([]);
	});
}

/**
 * The axe scans above run at one viewport, and WCAG 2.5.8 lets an undersized
 * target pass on the space around it — so a cloud of small targets can clear
 * the scan at 1280px and fail at 1240px, on whichever pair of terms happened
 * to wrap together. The key-terms cloud did exactly that, failing ten of a
 * seventeen-width sweep. Measure the targets themselves instead: every term
 * that links to a filtered index must clear 24px on its own, whatever the
 * frequency scale does to its type size.
 */
test('key-terms cloud targets clear the WCAG 2.5.8 floor', async ({ page }) => {
	test.setTimeout(60_000);
	await page.goto('/publications/visualisations');
	await ready(page);
	await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

	const terms = page.locator('.key-terms a');
	await expect(terms.first()).toBeVisible();

	for (const width of [1280, 1024, 768, 480]) {
		await page.setViewportSize({ width, height: 900 });
		const undersized = await terms.evaluateAll((nodes) =>
			nodes
				.map((node) => ({ term: node.textContent, box: node.getBoundingClientRect() }))
				.filter(({ box }) => box.height < 24 || box.width < 24)
				.map(({ term, box }) => `${term} (${box.width.toFixed(1)}×${box.height.toFixed(1)})`)
		);
		expect(undersized, `undersized targets at ${width}px`).toEqual([]);
	}
});
