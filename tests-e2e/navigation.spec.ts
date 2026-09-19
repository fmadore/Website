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
