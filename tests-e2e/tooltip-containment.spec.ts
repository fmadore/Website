import { test, expect, ready } from './fixtures';
import type { Locator } from '@playwright/test';

async function contained(tooltip: Locator) {
	await expect(tooltip).toBeVisible();
	await expect
		.poll(async () =>
			tooltip.evaluate((el) => {
				const rect = el.getBoundingClientRect();
				return (
					rect.left >= 11 &&
					rect.top >= 11 &&
					rect.right <= document.documentElement.clientWidth - 11 &&
					rect.bottom <= innerHeight - 11
				);
			})
		)
		.toBe(true);
	// Top-layer rendering escapes the plots' overflow clips.
	if (await tooltip.evaluate((el) => el.hasAttribute('popover'))) {
		expect(await tooltip.evaluate((el) => el.matches(':popover-open'))).toBe(true);
	}
}

for (const width of [1280, 390]) {
	test(`timeline tooltips stay visible at ${width}px, including after scrolling and resizing`, async ({
		page
	}, testInfo) => {
		await page.setViewportSize({ width, height: 640 });
		await page.goto('/cv/timeline');
		await ready(page);
		const marks = page.locator('.mark[data-mark]');
		for (const index of [0, 4, 25, 83, 140]) {
			const mark = marks.nth(index);
			await mark.focus();
			await mark.scrollIntoViewIfNeeded();
			await contained(page.getByRole('tooltip'));
		}
		await page.screenshot({ path: testInfo.outputPath(`timeline-${width}.png`) });
		await page.mouse.wheel(0, 120);
		await contained(page.getByRole('tooltip'));
		await page.setViewportSize({ width: 320, height: 400 });
		await contained(page.getByRole('tooltip'));
	});

	test(`network and chart tooltips stay visible at ${width}px`, async ({ page }, testInfo) => {
		test.setTimeout(90_000);
		await page.setViewportSize({ width, height: 640 });
		await page.route('**://basemaps.cartocdn.com/**/style.json', (route) =>
			route.fulfill({ json: { version: 8, sources: {}, layers: [] } })
		);
		const cases = [
			{
				path: '/publications/visualisations',
				heading: 'Author collaboration network',
				mark: '.arc-row'
			},
			{
				path: '/publications/visualisations',
				heading: 'Keyword co-occurrence matrix',
				mark: '.matrix-cell'
			},
			{
				path: '/conference-activity/visualisations',
				heading: 'Institution network',
				mark: '.nodes .node'
			}
		];
		for (const { path, heading, mark } of cases) {
			await page.goto(path);
			await ready(page);
			const section = page.locator('section').filter({ hasText: heading }).first();
			await section.scrollIntoViewIfNeeded();
			const target = section.locator(mark).last();
			await expect(target).toBeAttached({ timeout: 15_000 });
			await target.focus();
			await target.scrollIntoViewIfNeeded();
			await contained(page.getByRole('tooltip'));
			await page.screenshot({ path: testInfo.outputPath(`${heading}-${width}.png`) });
			await target.hover({ force: true });
			await contained(page.getByRole('tooltip'));
		}
		await page.goto('/publications/visualisations');
		await ready(page);
		const chartSection = page
			.locator('section')
			.filter({ hasText: 'Publications per year, by type' })
			.first();
		await chartSection.scrollIntoViewIfNeeded();
		const chart = page.locator('.echarts-container .chart').first();
		await chart.scrollIntoViewIfNeeded();
		await expect(chart.locator('canvas')).toBeVisible({ timeout: 15_000 });
		const box = (await chart.boundingBox())!;
		await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.5);
		await contained(page.getByRole('tooltip'));
		await page.screenshot({ path: testInfo.outputPath(`chart-${width}.png`) });
		// Updating chart options must retain the viewport positioning callback.
		const pattern = chartSection.getByRole('button', { name: /pattern/i });
		if (await pattern.count()) {
			await pattern.click();
			await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.5);
			await contained(page.getByRole('tooltip'));
		}
	});
}
