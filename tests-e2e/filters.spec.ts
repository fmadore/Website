import { test, expect, type Locator, type Page } from '@playwright/test';

/**
 * Filter-system E2E: the /publications index wires the runed
 * EntityFilterSystem to the urlFilterSync action. These tests exercise the
 * full loop in a real browser: chip click -> narrowed list + URL query;
 * clear -> everything restored; deep link with a query -> filters applied.
 */

const bibItems = 'ol.bib-list > li';

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

	const booksChip = page.getByRole('button', { name: /^Books/ });
	// Hydration + urlFilterSync apply the URL state to the filter system.
	await expect(booksChip).toHaveClass(/chip--selected/);
	const expected = Number(await booksChip.locator('.chip-count').innerText());
	await expect(page.locator(bibItems)).toHaveCount(expected);
	await expect(page.getByText(/1 filter active/)).toBeVisible();
});

test('type counts remain selectable totals when another type is active', async ({ page }) => {
	await page.goto('/publications');

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
	await expect(page.locator('.facet-summary-stat')).toContainText(`${combinedCount} matches`);
	// The bibliography paginates at 12 while the summary reports the complete set.
	await expect(page.locator(bibItems)).toHaveCount(Math.min(combinedCount, 12));
});
