import { test, expect } from './fixtures';

/**
 * The Markdown twins (llms.txt v2): every content page announces a
 * prerendered Markdown version of itself and the llms.txt that maps the site.
 * The announced addresses are absolute on the production origin, so the twin
 * is fetched by its path from the build under test, not from the live site.
 */

const markdownAlternate = 'link[rel="alternate"][type="text/markdown"]';
// A publication page carries two `describedby` links: this one (llms.txt v2)
// and FAIR Signposting's metadata record (the `.bib`), told apart by type.
const llmsTxtDescribedBy = 'link[rel="describedby"][type="text/plain"]';

test('a record page announces its Markdown twin, which carries the record', async ({
	page,
	request
}) => {
	await page.goto('/publications/religious-activism-campuses');

	const alternate = page.locator(markdownAlternate);
	await expect(alternate).toHaveCount(1);
	const href = await alternate.getAttribute('href');
	expect(href).toBe('https://www.frederickmadore.com/publications/religious-activism-campuses.md');
	await expect(page.locator(llmsTxtDescribedBy)).toHaveAttribute(
		'href',
		'https://www.frederickmadore.com/llms.txt'
	);
	await expect(
		page.locator('link[rel="describedby"][type="application/x-bibtex"]')
	).toHaveAttribute(
		'href',
		'https://www.frederickmadore.com/publications/religious-activism-campuses.bib'
	);

	const response = await request.get(new URL(href!).pathname);
	expect(response.ok()).toBe(true);
	expect(response.headers()['content-type']).toMatch(/^text\/markdown/);
	const markdown = await response.text();

	// The record's own title, as the page's masthead prints it, heads the twin.
	const title = (await page.getByRole('heading', { level: 1 }).textContent())!.trim();
	expect(markdown.split('\n')[0]).toBe(`# ${title}`);
	expect(markdown).toContain('## Abstract');
	expect(markdown).toContain('```bibtex\n@book{religious-activism-campuses,');
});

test('index pages announce complete twins; pages without one announce none', async ({
	page,
	request
}) => {
	await page.goto('/');
	await expect(page.locator(markdownAlternate)).toHaveAttribute(
		'href',
		'https://www.frederickmadore.com/index.md'
	);

	await page.goto('/publications');
	await expect(page.locator(markdownAlternate)).toHaveAttribute(
		'href',
		'https://www.frederickmadore.com/publications.md'
	);
	// The HTML index shows a page at a time; its twin lists every publication.
	const api = await (await request.get('/api/publications.json')).json();
	const list = await (await request.get('/publications.md')).text();
	expect(list.match(/^- \[/gm)).toHaveLength(api.count);

	await page.goto('/publications/visualisations');
	await expect(page.locator(markdownAlternate)).toHaveCount(0);
	await expect(page.locator('link[rel="describedby"]')).toHaveCount(1);
	await expect(page.locator(llmsTxtDescribedBy)).toHaveCount(1);
});

test('llms.txt links the Markdown twins, and every one resolves', async ({ request }) => {
	const response = await request.get('/llms.txt');
	expect(response.ok()).toBe(true);
	const text = await response.text();
	expect(text).toMatch(/^# \S/);

	const twins = [...text.matchAll(/\]\((https:\/\/www\.frederickmadore\.com\/[^)]+\.md)\)/g)].map(
		([, url]) => new URL(url!).pathname
	);
	expect(twins).toEqual(expect.arrayContaining(['/index.md', '/publications.md', '/cv.md']));
	for (const path of twins) {
		const twin = await request.get(path);
		expect(twin.ok(), path).toBe(true);
		expect(await twin.text(), path).toMatch(/^# \S/);
	}
});
