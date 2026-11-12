import { describe, expect, it } from 'vitest';
import { duplicateTitles, extractTitle, isTitleExempt } from './check-structured-data-titles.mjs';

const page = (path, title, extra = '') => ({
	path,
	html: `<html><head>${extra}${title === undefined ? '' : `<title>${title}</title>`}</head></html>`
});

describe('extractTitle', () => {
	it('decodes the entities Svelte writes and collapses whitespace', () => {
		expect(extractTitle('<title>\n  Islam &amp; Politics &#39;x&#39; | Site </title>')).toBe(
			"Islam & Politics 'x' | Site"
		);
	});

	it('is undefined for a page with no title', () => {
		expect(extractTitle('<meta http-equiv="refresh" content="0;url=/x">')).toBeUndefined();
	});
});

describe('isTitleExempt', () => {
	it('exempts the 404 and offline pages and redirect stubs, nothing else', () => {
		expect(isTitleExempt('/404.html', '')).toBe(true);
		expect(isTitleExempt('/offline.html', '')).toBe(true);
		expect(isTitleExempt('/old.html', '<meta http-equiv="refresh" content="0;url=/new">')).toBe(
			true
		);
		expect(isTitleExempt('/publications/x.html', '<title>X</title>')).toBe(false);
	});
});

describe('duplicateTitles', () => {
	it('groups the pages that share a title, and only those', () => {
		const result = duplicateTitles([
			page('/publications/a.html', 'Beyond Keywords… | Site'),
			page('/publications/b.html', 'Beyond Keywords… | Site'),
			page('/communications/c.html', 'Beyond Keywords… | Talk, March 2026 | Site'),
			page('/activities/d.html', 'Unique | Activity | Site')
		]);
		expect([...result]).toEqual([
			['Beyond Keywords… | Site', ['/publications/a.html', '/publications/b.html']]
		]);
	});

	it('ignores exempt pages and pages with no title', () => {
		const result = duplicateTitles([
			page('/404.html', 'Page not found | Site'),
			page('/offline.html', 'Page not found | Site'),
			page('/a.html', undefined, '<meta http-equiv="refresh" content="0;url=/b">'),
			page('/b.html', undefined)
		]);
		expect(result.size).toBe(0);
	});
});
