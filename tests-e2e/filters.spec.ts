import type { Locator, Page } from '@playwright/test';
import { test, expect, ready } from './fixtures';

/**
 * Filter-system E2E: the /publications index wires the runed
 * EntityFilterSystem to the urlFilterSync action. These tests exercise the
 * full loop in a real browser: chip click -> narrowed list + URL query;
 * clear -> everything restored; deep link with a query -> filters applied.
 */

const bibItems = 'ol.bib-list > li';

test('narrowing from page two resets pagination and preserves search on reload', async ({
	page
}) => {
	await page.goto('/publications');
	await ready(page);
	await page.getByRole('button', { name: 'Page 2', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Page 2', exact: true })).toHaveAttribute(
		'aria-current',
		'page'
	);
	await page.getByRole('button', { name: /^Books/ }).click();
	await page.getByRole('searchbox').fill('Islam');
	await expect(page).toHaveURL(/q=Islam/);
	const count = await page.locator(bibItems).count();
	expect(count).toBeGreaterThan(0);
	await expect(page.getByRole('button', { name: 'Page 2', exact: true })).toHaveCount(0);
	await page.reload();
	await ready(page);
	await expect(page.getByRole('searchbox')).toHaveValue('Islam');
	await expect(page.locator(bibItems)).toHaveCount(count);
});

test('repeated type parameters and search survive back and forward', async ({ page }) => {
	await page.goto('/publications?type=book&type=chapter&q=Islam');
	await ready(page);
	await expect(page.getByRole('button', { name: /^Books/ })).toHaveClass(/chip--selected/);
	await expect(page.getByRole('button', { name: /^Chapters/ })).toHaveClass(/chip--selected/);
	const original = page.url();
	await page.getByRole('link', { name: 'CV', exact: true }).first().click();
	await expect(page).toHaveURL(/\/cv$/);
	await page.goBack();
	await expect(page).toHaveURL(original);
	await expect(page.getByRole('searchbox')).toHaveValue('Islam');
	await expect(page.getByRole('button', { name: /^Chapters/ })).toHaveClass(/chip--selected/);
	await page.goForward();
	await expect(page).toHaveURL(/\/cv$/);
});

test('conference filters support search, type selection, and reload', async ({ page }) => {
	await page.goto('/conference-activity');
	await ready(page);
	const chip = page.locator('.type-chips button').nth(1);
	await chip.click();
	await expect(chip).toHaveClass(/chip--selected/);
	await page.getByRole('searchbox').fill('Islam');
	await expect(page).toHaveURL(/q=Islam/);
	const selected = await chip.getAttribute('title');
	await page.reload();
	await ready(page);
	await expect(page.getByRole('searchbox')).toHaveValue('Islam');
	await expect(page.locator('.type-chips .chip--selected')).toHaveAttribute('title', selected!);
});

/**
 * Clicks the "Books" type chip until the URL reflects the filter. The first
 * click on a freshly loaded page can land before hydration attaches the
 * handler (there is no DOM marker for that moment), so retry — guarded by the
 * URL state so an applied filter is never toggled straight back off.
 */
async function selectBooksChip(page: Page, booksChip: Locator): Promise<void> {
	await expect(async () => {
		if (!page.url().includes('type=book')) await booksChip.click();
		await expect(page).toHaveURL(/\?type=book$/, { timeout: 1000 });
	}).toPass({ timeout: 15_000 });
}

test('clicking a type chip narrows the list and syncs the URL; clearing restores', async ({
	page
}) => {
	await page.goto('/publications');
	await ready(page);

	const items = page.locator(bibItems);
	const initialCount = await items.count();
	expect(initialCount).toBeGreaterThan(0);

	// The "Books" type chip carries its own facet count — use it as the oracle.
	const booksChip = page.getByRole('button', { name: /^Books/ });
	const expected = Number(await booksChip.locator('.chip-count').innerText());
	expect(expected).toBeGreaterThan(0);
	expect(expected).toBeLessThan(initialCount);

	// URL picks up the filter (one entry per value, replaceState).
	await selectBooksChip(page, booksChip);
	// The visible bibliography shrinks to the facet count.
	await expect(items).toHaveCount(expected);
	// The live summary reports the active filter.
	await expect(page.getByText(/1 filter active/)).toBeVisible();

	// Clear all restores the unfiltered list and drops the query string.
	await page.getByRole('button', { name: /Clear all/ }).click();
	await expect(page).toHaveURL(/\/publications$/);
	await expect(items).toHaveCount(initialCount);
	await expect(page.getByText(/\d+ entries/)).toBeVisible();
});

test('toggling the same chip off restores the list and URL', async ({ page }) => {
	await page.goto('/publications');
	await ready(page);
	const items = page.locator(bibItems);
	const initialCount = await items.count();

	const booksChip = page.getByRole('button', { name: /^Books/ });
	await selectBooksChip(page, booksChip);
	await expect(booksChip).toHaveClass(/chip--selected/);

	// The app is hydrated by now — a single plain click toggles the filter off.
	await booksChip.click();
	await expect(page).toHaveURL(/\/publications$/);
	await expect(booksChip).not.toHaveClass(/chip--selected/);
	await expect(items).toHaveCount(initialCount);
});

test('a deep link with a filter query applies the filter on load', async ({ page }) => {
	await page.goto('/publications?type=book');
	await ready(page);

	const booksChip = page.getByRole('button', { name: /^Books/ });
	// Hydration + urlFilterSync apply the URL state to the filter system.
	await expect(booksChip).toHaveClass(/chip--selected/);
	const expected = Number(await booksChip.locator('.chip-count').innerText());
	await expect(page.locator(bibItems)).toHaveCount(expected);
	await expect(page.getByText(/1 filter active/)).toBeVisible();
});

test('type counts remain selectable totals when another type is active', async ({ page }) => {
	await page.goto('/publications');
	await ready(page);

	const booksChip = page.getByRole('button', { name: /^Books/ });
	const chaptersChip = page.getByRole('button', { name: /^Chapters/ });
	const bookCount = Number(await booksChip.locator('.chip-count').innerText());
	const chapterCount = Number(await chaptersChip.locator('.chip-count').innerText());
	await selectBooksChip(page, booksChip);

	// Counts within a facet are disjunctive: the chapter count describes what
	// selecting Chapters would add, rather than collapsing to zero under Books.
	await expect(chaptersChip.locator('.chip-count')).toHaveText(String(chapterCount));
	await chaptersChip.click();
	await expect(page).toHaveURL(/type=book/);
	await expect(page).toHaveURL(/type=chapter/);
	const combinedCount = bookCount + chapterCount;
	await expect(page.locator('.facet-summary-stat')).toContainText(`${combinedCount} of`);
	// The bibliography paginates at 12 while the summary reports the complete set.
	await expect(page.locator(bibItems)).toHaveCount(Math.min(combinedCount, 12));
});

test('a talk that has happened since the build leaves the upcoming block after hydration', async ({
	page,
	request
}) => {
	// Prerendered with the build's date, the page carries an "Upcoming" block
	// while any talk lies ahead of the build. A reader whose today is past every
	// talk must see it fold back into the record: no block, and the newest talk
	// heading the chronological list.
	const { items } = (await (await request.get('/api/communications.json')).json()) as {
		items: { title: string; dateISO?: string }[];
	};
	const newest = items.reduce((a, b) => ((b.dateISO ?? '') > (a.dateISO ?? '') ? b : a));
	const plain = (text: string) => text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');

	await page.clock.setFixedTime(new Date('2100-01-01T12:00:00'));
	await page.goto('/conference-activity');
	await ready(page);
	await expect(page.getByRole('heading', { name: 'Upcoming', exact: true })).toHaveCount(0);
	await expect
		.poll(async () => plain(await page.locator('main .bib-list .bib-row').first().innerText()))
		.toContain(plain(newest.title));
});

test('the activities log "All" chips print what clearing their row returns', async ({ page }) => {
	await page.goto('/activities');
	await ready(page);
	const types = page.getByRole('group', { name: 'Types' });
	const tags = page.getByRole('group', { name: 'Tags' });
	const countOf = async (chip: Locator) =>
		Number((await chip.locator('.chip-count').innerText()).trim());

	// A type narrows the log; clearing the (empty) tag row returns that
	// narrowed log, not the whole of it.
	await types.getByRole('button').nth(1).click();
	await expect(types.getByRole('button').nth(1)).toHaveAttribute('aria-pressed', 'true');
	const readout = page.locator('.filter-note-count');
	await expect(readout).toContainText('active');
	const shown = Number(/(\d+)\s+of\s+\d+/i.exec(await readout.innerText())?.[1]);
	expect(shown).toBeGreaterThan(0);
	const allTags = tags.getByRole('button', { name: /^All \d+$/ });
	await expect(allTags).toHaveAttribute('aria-pressed', 'true');
	expect(await countOf(allTags)).toBe(shown);
});
