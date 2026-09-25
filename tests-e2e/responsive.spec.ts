import { test, expect, ready } from './fixtures';

test('mobile navigation is usable without horizontal overflow', async ({ page, isMobile }) => {
	test.skip(!isMobile, 'Covered by the mobile Chromium project');

	await page.goto('/');
	await ready(page);
	const menuButton = page.getByRole('button', { name: /navigation menu/i });
	await expect(menuButton).toBeVisible();
	// 44x44 is the platform touch-target guideline (WCAG 2.2 SC 2.5.8 requires
	// only 24x24; this is deliberately above the floor for the primary nav).
	await expect(menuButton).toHaveCSS('width', '44px');
	await expect(menuButton).toHaveCSS('height', '44px');
	await menuButton.click();
	await expect(page.getByRole('navigation', { name: /mobile/i })).toBeVisible();

	// The touch targets are keyed to the input method (`--touch` in media.css,
	// i.e. `(hover: none), (pointer: coarse)`), not to the viewport width, so a
	// narrow window alone proves nothing about them. Pin the emulation first —
	// a device profile that stopped reporting a coarse pointer would silently
	// turn every assertion below into a check of the desktop layout — then
	// measure one chip: 44px tall, its label centred in the box rather than
	// sitting on the top edge (the defect baseline alignment produced).
	await page.goto('/publications');
	await ready(page);
	expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
	const chip = page.getByRole('group', { name: 'Type' }).getByRole('button').first();
	await expect(chip).toHaveCSS('min-height', '44px');
	const centring = await chip.evaluate((el) => {
		const box = el.getBoundingClientRect();
		const range = document.createRange();
		range.selectNodeContents(el);
		const text = range.getBoundingClientRect();
		return Math.abs(box.top + box.height / 2 - (text.top + text.height / 2));
	});
	expect(centring, 'chip label should be vertically centred').toBeLessThanOrEqual(1);

	for (const path of ['/', '/publications', '/cv', '/publications/visualisations']) {
		await page.goto(path);
		await ready(page);
		await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - document.documentElement.clientWidth
		);
		expect(overflow, `${path} should not overflow horizontally`).toBeLessThanOrEqual(1);
	}
});

/**
 * The second tier. Every sweep of the touch floor used to reach the index and
 * record templates and stop at the plate chrome one click away: toolbars at
 * 36px, zoom buttons at 32, the data-table disclosure at 32, the viz search
 * field at 37 (the September 2026 design audit). The visualisation pages are
 * first-class templates, so their controls are measured here like the chips.
 */
const TOUCH_FLOOR = 43.5;
const vizChrome: Record<string, { selector: string; square?: boolean }[]> = {
	'/publications/visualisations': [
		{ selector: '.toolbar-btn', square: true },
		{ selector: '.toggle-btn' },
		{ selector: '.chart-table > summary' },
		{ selector: '.breadcrumb-link' },
		{ selector: '.map-mode-toggle button' },
		{ selector: '.maplibregl-ctrl-group button', square: true }
	],
	'/conference-activity/visualisations': [
		{ selector: '.toolbar-btn', square: true },
		{ selector: '.viz-zoom-btn', square: true },
		{ selector: '.search-input' },
		{ selector: '.chart-table > summary' }
	]
};

for (const [path, controls] of Object.entries(vizChrome)) {
	test(`${path}: plate chrome takes the 44px touch floor`, async ({ page, isMobile }) => {
		test.skip(!isMobile, 'Covered by the mobile Chromium project');
		test.setTimeout(60_000);
		await page.goto(path);
		await ready(page);
		expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
		// The plates mount as they scroll into view; walk the page so every one does.
		await page.evaluate(async () => {
			for (let y = 0; y < document.body.scrollHeight; y += 500) {
				scrollTo(0, y);
				await new Promise((resolve) => setTimeout(resolve, 80));
			}
		});
		for (const { selector, square } of controls) {
			const targets = page.locator(selector);
			await expect(targets.first(), `${selector} on ${path}`).toBeAttached({ timeout: 15_000 });
			const undersized = await targets.evaluateAll(
				(nodes, [floor, needsWidth]) =>
					nodes
						.map((node) => node.getBoundingClientRect())
						.filter((box) => box.width > 0 && box.height > 0)
						.filter((box) => box.height < floor || (needsWidth && box.width < floor))
						.map((box) => `${box.width.toFixed(1)}×${box.height.toFixed(1)}`),
				[TOUCH_FLOOR, Boolean(square)] as const
			);
			expect(undersized, `${selector} on ${path}`).toEqual([]);
		}
	});
}
