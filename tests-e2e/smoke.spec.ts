import { test, expect } from '@playwright/test';

/**
 * Smoke tests: confirm the key prerendered routes load and render their core
 * content. Intentionally light — guards against build/route regressions
 * without coupling to copy or markup details.
 */

test('home page loads with the author name', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/Frédérick Madore/i);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('main list pages load with a top-level heading', async ({ page }) => {
	// Note: the communications list lives at /conference-activity; /communications
	// only has detail routes (/communications/[id]).
	for (const path of ['/publications', '/conference-activity', '/activities']) {
		const response = await page.goto(path);
		expect(response?.status(), `${path} should respond 200`).toBe(200);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	}
});

test('visualisation pages render each network view and its controls', async ({ page }) => {
	// Three encodings, each chosen for its data: a ranked arc ledger for the
	// egocentric networks, a seriated matrix for the co-occurrence corpora, and
	// a force graph only where spatial clustering is the actual question.
	const cases = [
		{
			path: '/publications/visualisations',
			heading: 'Author Collaboration Network',
			mark: 'svg.arc-svg .arc-row'
		},
		{
			path: '/publications/visualisations',
			heading: 'Keyword co-occurrence matrix',
			mark: 'svg.matrix-svg .matrix-cell'
		},
		{
			path: '/conference-activity/visualisations',
			heading: 'Co-presenter network',
			mark: 'svg.arc-svg .arc-row'
		},
		{
			path: '/conference-activity/visualisations',
			heading: 'Institution network',
			mark: 'svg.network-svg .nodes .node'
		}
	];
	for (const { path, heading, mark } of cases) {
		await page.goto(path);
		const section = page.locator('section').filter({ hasText: heading }).first();
		await section.scrollIntoViewIfNeeded();

		// Inline SVG (never a canvas), so every mark is a real element.
		await expect(section.locator(mark).first()).toBeVisible({ timeout: 15_000 });

		const search = section.locator('.network-controls .search-input');
		await expect(search).toBeVisible({ timeout: 15_000 });
		await search.fill('a');
		await expect(search).toHaveValue('a');
	}
});

test('the arc diagram ranks collaborators and omits the centre', async ({ page }) => {
	// The egocentric centre is joined to everyone by construction, so it is not
	// a data point — dropping it is the whole reason this is not a node-link map.
	await page.goto('/publications/visualisations');
	const section = page
		.locator('section')
		.filter({ hasText: 'Author Collaboration Network' })
		.first();
	await section.scrollIntoViewIfNeeded();

	const counts = await section
		.locator('svg.arc-svg .arc-row .arc-count')
		.evaluateAll((els) => els.map((e) => Number(e.textContent)));
	expect(counts.length).toBeGreaterThan(3);
	// Ranked, heaviest first.
	expect([...counts].sort((a, b) => b - a)).toEqual(counts);

	const names = await section
		.locator('svg.arc-svg .arc-row .arc-name')
		.evaluateAll((els) => els.map((e) => e.textContent?.trim()));
	expect(names).not.toContain('Frédérick Madore');

	// Arcs join collaborators to each other, not to a hub.
	await expect(section.locator('svg.arc-svg .arcs path').first()).toBeAttached();
});

test('the co-occurrence matrix renders a labelled, seriated grid', async ({ page }) => {
	await page.goto('/publications/visualisations');
	const section = page
		.locator('section')
		.filter({ hasText: 'Keyword co-occurrence matrix' })
		.first();
	await section.scrollIntoViewIfNeeded();

	// Both triangles are drawn, so either axis can be scanned.
	const cells = section.locator('svg.matrix-svg .matrix-cell');
	expect(await cells.count()).toBeGreaterThan(10);
	await expect(section.locator('svg.matrix-svg .matrix-label').first()).toBeVisible();

	// The accessible reading of a matrix is a table.
	await expect(section.locator('table.sr-only tbody tr').first()).toBeAttached();

	// Dispatch directly to a readable half-matrix cell. The SVG can be scaled
	// below a one-pixel physical hit area in headless browsers, making a
	// coordinate-based hover unreliable even though the handler is functional.
	const readableCell = section.locator('svg.matrix-svg .matrix-cell[tabindex="0"]').first();
	const tooltip = section.locator('.viz-tooltip');
	await expect(async () => {
		await readableCell.dispatchEvent('pointerenter', { clientX: 200, clientY: 200 });
		await expect(tooltip).toBeVisible({ timeout: 1_000 });
	}).toPass({ timeout: 15_000 });
	await expect(section.locator('svg.matrix-svg .matrix-label--hit').first()).toBeAttached();
});

test('the matrix draws the same grid on every load', async ({ page }) => {
	// Spectral seriation is deterministic: an archive should not reshuffle its
	// rows between visits.
	const read = async () => {
		await page.goto('/publications/visualisations');
		const section = page
			.locator('section')
			.filter({ hasText: 'Keyword co-occurrence matrix' })
			.first();
		await section.scrollIntoViewIfNeeded();
		await expect(section.locator('svg.matrix-svg .matrix-label').first()).toBeVisible();
		return section
			.locator('svg.matrix-svg .matrix-label')
			.evaluateAll((els) => els.map((e) => e.textContent).join('|'));
	};
	const first = await read();
	expect(first.length).toBeGreaterThan(0);
	expect(await read()).toBe(first);
});

test('searching a network dims marks without moving them', async ({ page }) => {
	// Regression guard for the ECharts behaviour this replaced: every option
	// change discarded the node positions and restarted the force simulation,
	// so the whole graph rescaled on each keystroke.
	await page.goto('/conference-activity/visualisations');
	const section = page.locator('section').filter({ hasText: 'Institution network' }).first();
	await section.scrollIntoViewIfNeeded();

	const positions = () =>
		section
			.locator('svg.network-svg .nodes circle')
			.evaluateAll((els) =>
				els.map((e) => `${e.getAttribute('cx')},${e.getAttribute('cy')}`).join('|')
			);

	await expect(section.locator('svg.network-svg .nodes circle').first()).toBeVisible({
		timeout: 15_000
	});
	const before = await positions();
	expect(before.length).toBeGreaterThan(0);

	await section.locator('.network-controls .search-input').fill('uni');
	await expect(section.locator('svg.network-svg .node--dim').first()).toBeAttached();
	expect(await positions()).toBe(before);
});

test('network marks are keyboard focusable', async ({ page }) => {
	// The canvas series this replaced could only be read via the sr-only list.
	await page.goto('/publications/visualisations');
	const section = page
		.locator('section')
		.filter({ hasText: 'Author Collaboration Network' })
		.first();
	await section.scrollIntoViewIfNeeded();

	const row = section.locator('svg.arc-svg .arc-row').first();
	await expect(row).toBeVisible();
	await expect(row).toHaveAttribute('tabindex', '0');
	await expect(row).toHaveAttribute('aria-label', /.+/);

	// The whole ledger is prerendered, so every assertion above is satisfied by
	// the static markup and none of them waits for hydration. A focus landing
	// before the handler is attached is lost for good — `focus` does not fire
	// again on an already-focused element — so retry through blur/refocus until
	// the page is live rather than racing it once.
	const tooltip = section.locator('.viz-tooltip');
	await expect(async () => {
		await row.blur();
		await row.focus();
		await expect(tooltip).toBeVisible({ timeout: 1_000 });
	}).toPass({ timeout: 15_000 });
});

test('rss.xml is served and is a well-formed feed', async ({ page, request }) => {
	const response = await request.get('/rss.xml');
	expect(response.status()).toBe(200);
	const xml = await response.text();
	// Parse in the browser (Node has no DOMParser); the page starts blank.
	const parsed = await page.evaluate((xmlText) => {
		const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
		return {
			hasParseError: doc.getElementsByTagName('parsererror').length > 0,
			root: doc.documentElement.nodeName,
			itemCount: doc.getElementsByTagName('item').length,
			channelTitle: doc.querySelector('channel > title')?.textContent ?? ''
		};
	}, xml);
	expect(parsed.hasParseError).toBe(false);
	expect(parsed.root).toBe('rss');
	expect(parsed.itemCount).toBeGreaterThanOrEqual(10);
	expect(parsed.channelTitle).toContain('Frédérick Madore');
});

test('publications/rss.xml is served and is a well-formed publications feed', async ({
	page,
	request
}) => {
	const response = await request.get('/publications/rss.xml');
	expect(response.status()).toBe(200);
	const xml = await response.text();
	const parsed = await page.evaluate((xmlText) => {
		const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
		return {
			hasParseError: doc.getElementsByTagName('parsererror').length > 0,
			root: doc.documentElement.nodeName,
			itemCount: doc.getElementsByTagName('item').length,
			channelTitle: doc.querySelector('channel > title')?.textContent ?? '',
			firstLink: doc.querySelector('item > link')?.textContent ?? ''
		};
	}, xml);
	expect(parsed.hasParseError).toBe(false);
	expect(parsed.root).toBe('rss');
	expect(parsed.itemCount).toBeGreaterThanOrEqual(10);
	expect(parsed.channelTitle).toContain('Publications');
	expect(parsed.firstLink).toContain('/publications/');
});

test('sitemap.xml is served and is a well-formed urlset', async ({ page, request }) => {
	const response = await request.get('/sitemap.xml');
	expect(response.status()).toBe(200);
	const xml = await response.text();
	const parsed = await page.evaluate((xmlText) => {
		const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
		const locs = Array.from(doc.getElementsByTagName('loc')).map((el) => el.textContent ?? '');
		return {
			hasParseError: doc.getElementsByTagName('parsererror').length > 0,
			root: doc.documentElement.nodeName,
			urlCount: doc.getElementsByTagName('url').length,
			firstLoc: locs[0] ?? ''
		};
	}, xml);
	expect(parsed.hasParseError).toBe(false);
	expect(parsed.root).toBe('urlset');
	expect(parsed.urlCount).toBeGreaterThanOrEqual(50);
	expect(parsed.firstLoc).toContain('frederickmadore.com');
});

test('every top-level section path in the sitemap resolves (no advertised 404s)', async ({
	request
}) => {
	// Guards against a hardcoded sitemap entry with no matching route (e.g. a
	// /communications index that never existed — the list is /conference-activity).
	// Scoped to single-segment section paths, the hand-maintained ones where
	// this bug class lives; deeper [id] detail URLs are data-driven and valid
	// by construction (and covered by the JSON-LD detail test above).
	const response = await request.get('/sitemap.xml');
	const xml = await response.text();
	const paths = [...xml.matchAll(/<loc>https:\/\/www\.frederickmadore\.com([^<]*)<\/loc>/g)]
		.map((m) => m[1])
		.filter((p): p is string => !!p)
		.filter((p) => p !== '' && !p.endsWith('.xml') && p.split('/').filter(Boolean).length === 1);

	// Sanity: we actually collected the section paths, not an empty set.
	expect(paths.length).toBeGreaterThan(3);

	for (const path of paths) {
		const res = await request.get(path, { maxRedirects: 0 });
		expect(res.status(), `${path} should not be a 404`).not.toBe(404);
	}
});

test('an unknown path renders the static 404 page', async ({ page }) => {
	const response = await page.goto('/this-page-does-not-exist');
	// `serve` (like GitHub Pages) responds with the prerendered 404.html and a
	// real 404 status. The content assertions are the primary guard in case a
	// different static server maps the error page to another status.
	expect(response?.status()).toBe(404);
	await expect(page).toHaveTitle(/Page not found/i);
	await expect(page.getByRole('heading', { level: 1 })).toContainText(/couldn.t be found/i);
});

test('a publication detail page injects JSON-LD structured data', async ({ page }) => {
	await page.goto('/publications');
	// Follow the first real publication item through to its detail page,
	// excluding the visualisations link which also lives under /publications/.
	const firstItem = page
		.locator('main a[href*="/publications/"]:not([href*="visualisations"])')
		.first();
	await firstItem.click();
	await expect(page).toHaveURL(/\/publications\/[^/]+$/);
	// At least one JSON-LD block (layout-level site schema + the page's own).
	const jsonLd = page.locator('script[type="application/ld+json"]');
	await expect(jsonLd.first()).toBeAttached({ timeout: 15_000 });
});
