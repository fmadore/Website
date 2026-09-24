import { test, expect, ready, wcagScan } from './fixtures';

// Network failure injection must not be bypassed by the service-worker cache.
test.use({ serviceWorkers: 'block' });

test('a failed chart chunk leaves readable data and a recovery action', async ({ page }, info) => {
	await page.route('**/app/immutable/chunks/*.js', async (route) => {
		const response = await route.fetch();
		const body = await response.text();
		if (body.length > 150000 && /echartsInstance|zrender/.test(body)) await route.abort();
		else await route.fulfill({ response });
	});
	await page.goto('/publications/visualisations');
	await ready(page);
	await page.locator('.stacked-chart').first().scrollIntoViewIfNeeded();
	const retry = page.getByRole('button', { name: 'Retry chart', exact: true }).first();
	await expect(retry).toBeVisible();
	const card = page.locator('section').filter({ has: retry }).last();
	// Keep evidence for the error state at both shipped viewport classes.
	for (const width of [1280, 375]) {
		await page.setViewportSize({ width, height: 900 });
		await retry.scrollIntoViewIfNeeded();
		const status = card.locator('[role="status"]').filter({ has: retry });
		const noteBox = await status.boundingBox();
		const reloadBox = await status
			.getByRole('button', { name: 'Reload page', exact: true })
			.boundingBox();
		expect(reloadBox!.y + reloadBox!.height).toBeLessThanOrEqual(noteBox!.y + noteBox!.height);
		await page.screenshot({ path: info.outputPath(`chart-error-${width}.png`) });
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true
		);
	}
	{
		await card.locator('details.chart-table summary').first().click();
		await expect(card.locator('tbody tr').first()).toBeVisible();
	}
	await page.unroute('**/app/immutable/chunks/*.js');
	await retry.click();
	// Browsers may cache a failed module evaluation for this document.
	await card.getByRole('button', { name: 'Reload page', exact: true }).click();
	await ready(page);
	await page.locator('.stacked-chart').first().scrollIntoViewIfNeeded();
	await expect(page.locator('.echarts-container canvas').first()).toBeVisible();
});

test('facet combobox supports keyboard selection and accessible open state', async ({ page }) => {
	await page.goto('/publications');
	await ready(page);
	const field = page.getByRole('combobox', { name: /tags/ });
	await field.fill('Islam');
	await field.press('ArrowDown');
	await expect(field).toHaveAttribute('aria-activedescendant', /.+/);
	await field.press('Enter');
	await expect(page).toHaveURL(/tag=/);
	await field.press('Escape');
	await expect(field).toBeFocused();
	await field.click();
	const results = await wcagScan(page).include('.facet-combobox').analyze();
	expect(results.violations).toEqual([]);
});
