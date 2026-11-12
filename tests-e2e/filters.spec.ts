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

test('back from a record restores a filter set by a chip click', async ({ page }) => {
	await page.goto('/publications');
	await ready(page);
	const items = page.locator(bibItems);
	const booksChip = page.getByRole('button', { name: /^Books/ });
	const expected = Number(await booksChip.locator('.chip-count').innerText());

	// The chip writes `?type=book` with a shallow replaceState, which leaves the
	// history entry's stored page URL on the plain index: Back must still read
	// the address, not that stored URL.
	await selectBooksChip(page, booksChip);
	await expect(items).toHaveCount(expected);

	await items.first().locator('.bib-title-link').click();
	await expect(page).toHaveURL(/\/publications\/[^/?#]+$/);
	await page.goBack();
	await expect(page).toHaveURL(/\/publications\?type=book$/);
	await expect(booksChip).toHaveAttribute('aria-pressed', 'true');
	await expect(items).toHaveCount(expected);
	await expect(page.getByText(/1 filter active/)).toBeVisible();

	// And again after Forward and Back.
	await page.goForward();
	await expect(page).toHaveURL(/\/publications\/[^/?#]+$/);
	await page.goBack();
	await expect(page).toHaveURL(/\/publications\?type=book$/);
	await expect(booksChip).toHaveAttribute('aria-pressed', 'true');
	await expect(items).toHaveCount(expected);
});

test('Clear all hands focus to the search box rather than dropping it', async ({ page }) => {
	await page.goto('/publications');
	await ready(page);
	await selectBooksChip(page, page.getByRole('button', { name: /^Books/ }));
	const clearAll = page.getByRole('button', { name: /Clear all/ });
	await clearAll.focus();
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/\/publications$/);
	await expect(clearAll).toHaveCount(0);
	await expect(page.getByRole('searchbox')).toBeFocused();
});

test('a deep link folds case and repeats onto the vocabulary and ignores unknown values', async ({
	page
}) => {
	await page.goto('/publications?type=BOOK&type=book&type=nonexistent');
	await ready(page);
	const booksChip = page.getByRole('button', { name: /^Books/ });
	await expect(booksChip).toHaveAttribute('aria-pressed', 'true');
	const expected = Number(await booksChip.locator('.chip-count').innerText());
	await expect(page.locator(bibItems)).toHaveCount(expected);
	await expect(page.getByText(/1 filter active/)).toBeVisible();
	await expect(page.locator('.facet-summary-active')).not.toContainText(/nonexistent/i);
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
	// heading the chronological list. An undated "Forthcoming" entry has no date
	// to pass, so it keeps the head of the list (sortUtils: forthcoming first,
	// by title) and is what the reader sees first when one exists.
	const { items } = (await (await request.get('/api/communications.json')).json()) as {
		items: { title: string; date?: string; dateISO?: string }[];
	};
	const forthcoming = items
		.filter((item) => /^(forthcoming|à paraître|a paraitre)$/i.test((item.date ?? '').trim()))
		.sort((a, b) => a.title.localeCompare(b.title));
	const newest =
		forthcoming[0] ?? items.reduce((a, b) => ((b.dateISO ?? '') > (a.dateISO ?? '') ? b : a));
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
	const readout = page.locator('.facet-summary-stat');
	await expect(readout).toContainText('active');
	const shown = Number(/(\d+)\s+of\s+\d+/i.exec(await readout.innerText())?.[1]);
	expect(shown).toBeGreaterThan(0);
	const allTags = tags.getByRole('button', { name: /^All \d+$/ });
	await expect(allTags).toHaveAttribute('aria-pressed', 'true');
	expect(await countOf(allTags)).toBe(shown);
});

test('the chip counts and "All" narrow with the search, and the tally says so', async ({
	page
}) => {
	await page.goto('/publications');
	await ready(page);
	const typeAll = page.getByRole('group', { name: 'Type' }).getByRole('button', { name: /^All/ });
	const corpus = Number(await typeAll.locator('.chip-count').innerText());
	await page.getByRole('searchbox').fill('togo');
	await expect(page).toHaveURL(/q=togo/);
	const stat = page.locator('.facet-summary-stat');
	await expect(stat).toContainText('1 filter active');
	const shown = Number(/(\d+)\s+of\s+\d+/i.exec(await stat.innerText())?.[1]);
	expect(shown).toBeGreaterThan(0);
	expect(shown).toBeLessThan(corpus);
	// "All" prints exactly what clicking it produces: the searched list.
	await expect(typeAll.locator('.chip-count')).toHaveText(String(shown));
	await expect(stat).toBeInViewport();
	await expect(page.locator('.facet-summary-active')).toContainText(/Search: “togo”/i);
});

test('a search-only empty state offers exactly one clear control', async ({ page }) => {
	await page.goto('/publications');
	await ready(page);
	await page.getByRole('searchbox').fill('zzzzqqxx');
	await expect(page.getByText(/No entries match/)).toBeVisible();
	await expect(page.getByRole('button', { name: /^Clear/ })).toHaveCount(1);
	await page.getByRole('button', { name: 'Clear search' }).click();
	await expect(page).toHaveURL(/\/publications$/);
	await expect(page.getByRole('searchbox')).toHaveValue('');
});

test('the facet grid is closed by default and opens for a deep link into it', async ({ page }) => {
	await page.goto('/publications');
	await ready(page);
	const toggle = page.getByRole('button', { name: /^More filters/ });
	const grid = page.getByRole('region', { name: 'More filters' });
	await expect(toggle).toHaveAttribute('aria-expanded', 'false');
	await expect(grid).toBeHidden();
	await expect(page.locator(bibItems).first()).toBeInViewport();
	await toggle.click();
	await expect(grid).toBeVisible();

	await page.goto('/publications?tag=Islam&country=togo');
	await ready(page);
	await expect(toggle).toHaveAttribute('aria-expanded', 'true');
	await expect(grid).toBeVisible();
	await expect(grid.getByRole('button', { name: /^Islam/ })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await expect(page.locator('.facet-summary-active')).toContainText(/Countries studied: Togo/i);
});

test('an old tag spelling in a shared link selects the renamed tag', async ({ page }) => {
	await page.goto('/publications?tag=AI');
	await ready(page);
	await expect(page.locator('.facet-summary-active')).toContainText(/Artificial Intelligence/i);
	await expect(page.locator('.facet-summary-stat')).toContainText('1 filter active');
});

test('the sort rides in the URL and Back from a record returns to the same page', async ({
	page
}) => {
	await page.goto('/publications');
	await ready(page);
	await expect(async () => {
		if (!page.url().includes('sort=citations'))
			await page.getByRole('button', { name: /^Cited/ }).click();
		await expect(page).toHaveURL(/\?sort=citations$/, { timeout: 1000 });
	}).toPass({ timeout: 15_000 });
	await expect(page.getByRole('button', { name: /^Cited/ })).toHaveAttribute(
		'aria-pressed',
		'true'
	);

	await page.getByRole('button', { name: 'Page 2', exact: true }).click();
	const first = page.locator(bibItems).first().locator('.bib-title-link');
	const title = await first.innerText();
	await first.click();
	await expect(page).toHaveURL(/\/publications\/[^/?#]+$/);
	await page.goBack();
	await expect(page).toHaveURL(/\/publications\?sort=citations$/);
	await expect(page.getByRole('button', { name: 'Page 2', exact: true })).toHaveAttribute(
		'aria-current',
		'page'
	);
	await expect(page.locator(bibItems).first().locator('.bib-title-link')).toHaveText(title);

	// A deep link with the sort applies it; the default order writes no parameter.
	await page.goto('/publications?sort=title');
	await ready(page);
	await expect(page.getByRole('button', { name: 'A–Z' })).toHaveAttribute('aria-pressed', 'true');
	await page.getByRole('button', { name: /^Date/ }).click();
	await expect(page).toHaveURL(/\/publications$/);
});

test('the activities log searches through ?q= like the sibling indexes', async ({ page }) => {
	await page.goto('/activities?q=workshop');
	await ready(page);
	await expect(page.getByRole('searchbox', { name: 'Filter activities' })).toHaveValue('workshop');
	await expect(page.locator('.facet-summary-stat')).toContainText('1 filter active');
	await page.getByRole('searchbox', { name: 'Filter activities' }).fill('zzzzqqxx');
	await expect(page).toHaveURL(/q=zzzzqqxx/);
	await expect(page.getByRole('button', { name: /^Clear/ })).toHaveCount(1);
});
