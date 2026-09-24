import { test, expect, ready } from './fixtures';

for (const dataset of ['publications', 'communications']) {
	test(`${dataset}: related-record navigation replaces the document and metadata`, async ({
		page,
		request
	}) => {
		const payload = await (await request.get(`/api/${dataset}.json`)).json();
		const records = payload.items as { id: string; project?: string }[];
		const first = records.find(
			(item) =>
				item.project &&
				records.some((other) => other.id !== item.id && other.project === item.project)
		)!;
		await page.goto(`/${dataset}/${first.id}`);
		await ready(page);
		await page.evaluate(() => {
			(window as Window & { navigationMarker?: number }).navigationMarker = 42;
		});
		const related = page.locator('a.related-item').first();
		const href = await related.getAttribute('href');
		expect(href).toBeTruthy();
		await related.click();
		await expect(page).toHaveURL(new RegExp(`${href}$`));
		await expect(page.locator('main h1')).toHaveCount(1);
		await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			'href',
			`https://www.frederickmadore.com${href}`
		);
		await expect(
			page.locator(`script#${dataset === 'publications' ? 'publication' : 'communication'}-json-ld`)
		).toHaveCount(1);
		expect(
			await page.evaluate(() => (window as Window & { navigationMarker?: number }).navigationMarker)
		).toBe(42);
		await page.goBack();
		await expect(page).toHaveURL(new RegExp(`/${first.id}$`));
		await page.goForward();
		await expect(page).toHaveURL(new RegExp(`${href}$`));
	});
}

/**
 * The activity and digital-humanities records load on the server, so a
 * client-side visit fetches the record's prerendered `__data.json` rather than
 * running a universal load over the whole dataset. Enter each from the page
 * that links it and check the record arrives whole, without a document reload.
 */
for (const { from, family, jsonLd } of [
	{ from: '/', family: 'activities', jsonLd: 'activity-json-ld' },
	{ from: '/digital-humanities', family: 'digital-humanities', jsonLd: 'dh-project-json-ld' }
]) {
	test(`${family}: a client-side visit renders the record from its server data`, async ({
		page
	}) => {
		await page.goto(from);
		await ready(page);
		await page.evaluate(() => {
			(window as Window & { navigationMarker?: number }).navigationMarker = 42;
		});
		const link = page.locator(`main a[href^="/${family}/"]:not([href*="/year/"])`).first();
		const href = await link.getAttribute('href');
		expect(href).toMatch(new RegExp(`^/${family}/[^/]+$`));
		await link.click();
		await expect(page).toHaveURL(new RegExp(`${href}$`));
		await expect(page.locator('main h1')).toHaveCount(1);
		await expect(page.locator('main h1')).not.toBeEmpty();
		await expect(page.locator(`script#${jsonLd}`)).toHaveCount(1);
		expect(
			await page.evaluate(() => (window as Window & { navigationMarker?: number }).navigationMarker)
		).toBe(42);
	});
}

/**
 * Inline citations resolve from the entries each page's server load sends
 * (`$lib/server/references`), not from a client-side copy of the index — so
 * they must resolve on a first load and again after a client-side navigation,
 * when `page.data` is replaced. An unresolved citation prints its raw id.
 */
test('inline citations resolve on load and after client-side navigation', async ({ page }) => {
	const expectResolved = async (id: string) => {
		const references = page.locator('main .item-reference');
		expect(await references.count()).toBeGreaterThan(0);
		await expect(page.locator('main')).not.toContainText(id);
		await references.first().locator('a').first().focus();
		await page.keyboard.press('Enter');
		await expect(page.locator('[role="dialog"] .card-title').first()).not.toBeEmpty();
		await page.keyboard.press('Escape');
	};

	await page.goto('/');
	await ready(page);
	await expectResolved('religious-activism-campuses');

	await page.goto('/research');
	await ready(page);
	await page.locator('main a[href="/research/dh-ai-african-studies"]').first().click();
	await expect(page).toHaveURL(/\/research\/dh-ai-african-studies$/);
	await expectResolved('stias-dh-ai-african-studies-workshop-2026');
});
