import type { Locator } from '@playwright/test';
import { test, expect, ready, wcagScan } from './fixtures';

test.use({ serviceWorkers: 'block' });

/** Institutions drawn on the map, read from each marker's accessible name. */
const markerInstitutions = (section: Locator) =>
	section
		.locator('.location-marker')
		.evaluateAll((markers) =>
			markers
				.map((marker) => (marker.getAttribute('aria-label') ?? '').replace(/: \d+ \w+.*$/, ''))
				.sort()
		);

/** Institutions listed in the open data table under the map. */
const tableInstitutions = (section: Locator) =>
	section
		.locator('table tbody tr td:first-child')
		.evaluateAll((cells) =>
			[...new Set(cells.map((cell) => cell.childNodes[0]?.textContent?.trim() ?? ''))].sort()
		);

for (const view of [
	{
		path: '/publications/visualisations',
		section: '#publisher-locations',
		locations: 'Publishers',
		dataset: 'publications',
		theme: 'light'
	},
	{
		path: '/conference-activity/visualisations',
		section: '#venue-locations',
		locations: 'Venues',
		dataset: 'communications',
		theme: 'dark'
	}
] as const) {
	test(`${view.locations} and collaborators share one map with dated affiliations`, async ({
		page,
		request
	}, info) => {
		test.setTimeout(60_000);
		await page.emulateMedia({ colorScheme: view.theme, reducedMotion: 'reduce' });
		// Keep the application's real map and controls; external tile availability
		// is independent of dataset switching and must not make this test flaky.
		await page.route('**://basemaps.cartocdn.com/**/style.json', (route) =>
			route.fulfill({ json: { version: 8, sources: {}, layers: [] } })
		);
		await page.goto(view.path);
		await ready(page);
		await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${view.theme}\\b`));
		const section = page.locator(view.section);
		await section.scrollIntoViewIfNeeded();
		const canvas = page.locator('.maplibregl-canvas');
		await expect(canvas).toHaveCount(1, { timeout: 15_000 });
		await expect(canvas).toBeVisible();
		const originalCanvas = await canvas.elementHandle();
		expect(originalCanvas).not.toBeNull();

		const shading = section.getByRole('button', { name: 'Country shading', exact: true });
		await shading.click();
		await expect(shading).toHaveAttribute('aria-pressed', 'true');
		await expect(section.locator('.choropleth-legend')).toBeVisible();
		await section.getByRole('button', { name: 'Collaborators', exact: true }).click();
		await expect(section.locator('.affiliation-summary')).toContainText('collaborators mapped', {
			timeout: 15_000
		});
		await expect(shading).toHaveCount(0);
		await expect(section.locator('.location-marker').first()).toBeVisible();
		await expect(
			section.locator('.location-marker[aria-label*="uncertain affiliation"]')
		).toHaveCount(0);

		const tableToggle = section.locator('summary').filter({ hasText: /^Data table$/ });
		await tableToggle.click();
		const table = section.getByRole('table');
		await expect(table.getByRole('row').nth(1)).toBeVisible();
		await expect(table.getByText('Uncertain affiliation', { exact: true })).toHaveCount(0);
		// Affiliations are stated, not sourced: no provenance links in the table.
		await expect(table.locator('a[target="_blank"]')).toHaveCount(0);
		const unresolved = section.locator('.unresolved-affiliations');
		await unresolved.locator('summary').click();
		await expect(unresolved.locator('.unresolved-list > li').first()).toBeVisible();
		await expect(unresolved.getByRole('link').first()).toHaveAttribute(
			'href',
			new RegExp(`^/${view.dataset}/`)
		);
		await unresolved.locator('summary').click();

		await section.getByRole('checkbox', { name: 'Include uncertain affiliations' }).check();
		await expect(table.getByText('Uncertain affiliation', { exact: true }).first()).toBeVisible();
		await expect(
			section.locator('.location-marker[aria-label*="uncertain affiliation"]').first()
		).toBeVisible();
		const scan = await wcagScan(page).include(view.section).analyze();
		expect(scan.violations).toEqual([]);

		// Every linked work in a filtered table must belong to the selected year.
		// Read years from the public API so this survives new records and counts.
		const response = await request.get(`/api/${view.dataset}.json`);
		expect(response.ok()).toBe(true);
		const { items }: { items: { id: string; year: number }[] } = await response.json();
		const latestYear = Math.max(...items.map((item) => item.year));
		await section.getByRole('combobox', { name: 'Collaboration year' }).selectOption({
			label: String(latestYear)
		});
		const sharedWorks = table.locator('.work-list a');
		await expect(sharedWorks.first()).toBeVisible();
		const allowed = new Set(
			items.filter((item) => item.year === latestYear).map((item) => `/${view.dataset}/${item.id}`)
		);
		for (const href of await sharedWorks.evaluateAll((links) =>
			links.map((a) => a.getAttribute('href'))
		))
			expect(allowed.has(href ?? ''), href ?? 'missing work URL').toBe(true);
		// The map draws the same institutions the table lists for that year.
		await expect.poll(() => markerInstitutions(section)).toEqual(await tableInstitutions(section));

		await tableToggle.click();
		await info.attach(`collaborators-${view.theme}`, {
			body: await section.screenshot(),
			contentType: 'image/png'
		});
		await section.getByRole('button', { name: view.locations, exact: true }).click();
		await expect(shading).toHaveAttribute('aria-pressed', 'true');
		await expect(section.locator('.choropleth-legend')).toBeVisible();
		await expect(canvas).toHaveCount(1);
		expect(
			await originalCanvas!.evaluate(
				(element) => element === document.querySelector('.maplibregl-canvas')
			)
		).toBe(true);
	});
}

test('markers settle on the last selected year while tiles are still loading', async ({ page }) => {
	test.setTimeout(60_000);
	await page.emulateMedia({ reducedMotion: 'reduce' });
	// A basemap with real (GeoJSON) tiles: every fitBounds leaves the style briefly
	// unloaded while they cut, which is when a dropped change used to strand the
	// previous year's markers on the map.
	await page.route('**://basemaps.cartocdn.com/**/style.json', (route) =>
		route.fulfill({
			json: {
				version: 8,
				sources: {
					land: {
						type: 'geojson',
						data: {
							type: 'Feature',
							properties: {},
							geometry: {
								type: 'Polygon',
								coordinates: [
									[
										[-170, -60],
										[170, -60],
										[170, 75],
										[-170, 75],
										[-170, -60]
									]
								]
							}
						}
					}
				},
				layers: [{ id: 'land', type: 'fill', source: 'land' }]
			}
		})
	);
	await page.goto('/publications/visualisations');
	await ready(page);
	const section = page.locator('#publisher-locations');
	await section.scrollIntoViewIfNeeded();
	await expect(page.locator('.maplibregl-canvas')).toHaveCount(1, { timeout: 15_000 });
	await section.getByRole('button', { name: 'Collaborators', exact: true }).click();
	await expect(section.locator('.affiliation-summary')).toContainText('collaborators mapped', {
		timeout: 15_000
	});
	await section
		.locator('summary')
		.filter({ hasText: /^Data table$/ })
		.click();
	const year = section.getByRole('combobox', { name: 'Collaboration year' });
	const years = (await year.locator('option').allTextContents()).filter((text) =>
		/^\d{4}$/.test(text)
	);
	expect(years.length).toBeGreaterThan(3);
	// A reader arrowing through the list: no pause for the map between choices.
	for (const label of years) await year.selectOption({ label });
	await year.selectOption({ label: 'All years' });
	await expect.poll(() => markerInstitutions(section)).toEqual(await tableInstitutions(section));
	expect((await tableInstitutions(section)).length).toBeGreaterThan(0);
	const uncertain = section.getByRole('checkbox', { name: 'Include uncertain affiliations' });
	await uncertain.check();
	await uncertain.uncheck();
	await uncertain.check();
	await expect.poll(() => markerInstitutions(section)).toEqual(await tableInstitutions(section));
});
