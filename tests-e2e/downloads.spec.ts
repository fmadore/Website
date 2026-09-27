import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFile } from 'node:fs/promises';
import { test, expect, ready } from './fixtures';

// Network failure injection must not be bypassed by the service-worker cache.
test.use({ serviceWorkers: 'block' });

test('BibTeX export contains the selected record', async ({ page }) => {
	await page.goto('/publications/beninese-imam-election-2022');
	await ready(page);
	const downloaded = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Download BibTeX', exact: true }).click();
	const file = await downloaded;
	expect(file.suggestedFilename()).toBe('beninese-imam-election-2022.bib');
	const text = await readFile((await file.path())!, 'utf8');
	expect(text).toMatch(/^@\w+\{/);
	expect(text).toContain('title');
	expect(text).toMatch(/imam/i);
});

for (const fontMode of ['loaded', 'failed', 'stalled'] as const) {
	test(`CV PDF preserves content with ${fontMode} fonts`, async ({ page }) => {
		test.setTimeout(60000);
		if (fontMode === 'failed') await page.route('**/fonts/pdf/**', (route) => route.abort());
		if (fontMode === 'stalled') await page.route('**/fonts/pdf/**', () => {});
		await page.goto('/cv');
		await ready(page);
		expect(await page.locator('#cv-content .cv-section-wrapper').count()).toBeGreaterThan(15);
		const downloaded = page.waitForEvent('download');
		await page.getByRole('button', { name: 'Download PDF', exact: true }).click();
		const file = await downloaded;
		const bytes = await readFile((await file.path())!);
		expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
		expect(bytes.toString('latin1')).toContain('%%EOF');
		expect(bytes.toString('latin1').match(/\/Type \/Page\b/g)!.length).toBeGreaterThan(3);
		expect(bytes.length).toBeGreaterThan(20000);
		const loadingTask = getDocument({
			data: new Uint8Array(bytes),
			verbosity: 0,
			useSystemFonts: true
		});
		const pdf = await loadingTask.promise;
		try {
			const text: string[] = [];
			const urls: string[] = [];
			for (let i = 1; i <= pdf.numPages; i++) {
				const pdfPage = await pdf.getPage(i);
				const content = await pdfPage.getTextContent();
				text.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '));
				const annotations = await pdfPage.getAnnotations();
				urls.push(...annotations.flatMap((item) => (item.url ? [String(item.url)] : [])));
			}
			const exported = text.join(' ').replace(/\s+/g, ' ');
			expect(exported).toContain('Frédérick Madore');
			expect(exported).toMatch(/Publications/i);
			expect(exported).toContain('Religious Activism');
			expect(exported).toMatch(/Teaching/i);
			expect(exported).toContain('2026');
			expect(urls.some((url) => url.includes('frederickmadore.com'))).toBe(true);
		} finally {
			await loadingTask.destroy();
		}

		await expect(page.getByRole('button', { name: 'Download PDF', exact: true })).toBeEnabled();
	});
}

test('PNG export works for canvas and SVG charts', async ({ page }) => {
	await page.goto('/publications/visualisations');
	await ready(page);
	for (const selector of ['section:has(.stacked-chart)', 'section:has(svg.arc-svg)']) {
		const section = page.locator(selector).first();
		await section.scrollIntoViewIfNeeded();
		const button = section.getByRole('button', { name: 'Download chart as PNG' }).first();
		await expect(button).toBeEnabled();
		const downloaded = page.waitForEvent('download');
		await button.click();
		const bytes = await readFile((await (await downloaded).path())!);
		expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
		expect(bytes.readUInt32BE(16)).toBeGreaterThan(100);
		expect(bytes.length).toBeGreaterThan(1000);
	}
});

test('clipboard denial reports failure and leaves the reference selectable', async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(navigator, 'clipboard', {
			value: {
				writeText: async () => {
					throw new Error('denied');
				}
			}
		});
		document.execCommand = () => false;
	});
	await page.goto('/publications/beninese-imam-election-2022');
	await ready(page);
	await page.getByRole('button', { name: 'Copy reference', exact: true }).click();
	await expect(
		page.getByRole('button', { name: 'Copy failed. Select the text above.' })
	).toBeVisible();
});
