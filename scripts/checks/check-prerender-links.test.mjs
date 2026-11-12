import { describe, it, expect } from 'vitest';
import {
	anchorHrefs,
	findOrphans,
	normalisePath,
	resolveHref,
	servedPathOf
} from './check-prerender-links.mjs';

const ORIGIN = 'https://www.example.org';

describe('anchorHrefs', () => {
	it('reads every anchor href, in any quoting, and skips anchors without one', () => {
		const html = `<a href="./a">A</a><a class="x" href='../b?x=1&amp;y=2'>B</a>
			<a name="top"></a><a href=c>C</a><link rel="alternate" href="/d.md"><area href="/e">`;
		expect(anchorHrefs(html)).toEqual(['./a', '../b?x=1&y=2', 'c']);
	});

	it('does not mistake other tags or attributes for an anchor href', () => {
		expect(anchorHrefs('<abbr title="x">y</abbr><a data-href="/x" href="/y">z</a>')).toEqual([
			'/y'
		]);
	});
});

describe('servedPathOf', () => {
	it('serves a directory index with its trailing slash, a page file without', () => {
		expect(servedPathOf('index.html')).toBe('/');
		expect(servedPathOf('cv.html')).toBe('/cv');
		expect(servedPathOf('cv/index.html')).toBe('/cv/');
		expect(servedPathOf('publications\\x.html')).toBe('/publications/x');
	});
});

describe('normalisePath', () => {
	it('drops trailing slashes and decodes escapes', () => {
		expect(normalisePath('/')).toBe('/');
		expect(normalisePath('')).toBe('/');
		expect(normalisePath('/cv/')).toBe('/cv');
		expect(normalisePath('/tags/%C3%A9t%C3%A9')).toBe('/tags/été');
		expect(normalisePath('/bad/%E0%A4%A')).toBe('/bad/%E0%A4%A');
	});
});

describe('resolveHref', () => {
	it('resolves paths.relative hrefs against the page they sit on', () => {
		expect(resolveHref('./publications/x', '/cv', ORIGIN)).toBe('/publications/x');
		expect(resolveHref('../communications/y', '/publications/x', ORIGIN)).toBe('/communications/y');
		expect(resolveHref('./x', '/cv/', ORIGIN)).toBe('/cv/x');
		expect(resolveHref('.', '/publications/x', ORIGIN)).toBe('/publications');
		expect(resolveHref('/teaching/', '/cv', ORIGIN)).toBe('/teaching');
	});

	it('drops the query and the fragment', () => {
		expect(resolveHref('./publications?type=book#list', '/cv', ORIGIN)).toBe('/publications');
	});

	it('keeps absolute links to the site and ignores everything off it', () => {
		expect(resolveHref(`${ORIGIN}/cv`, '/publications/x', ORIGIN)).toBe('/cv');
		expect(resolveHref('https://doi.org/10.1/x', '/cv', ORIGIN)).toBeNull();
		expect(resolveHref('//cdn.example.com/a', '/cv', ORIGIN)).toBeNull();
		expect(resolveHref('mailto:a@example.org', '/cv', ORIGIN)).toBeNull();
		expect(resolveHref('#cv-publications', '/cv', ORIGIN)).toBeNull();
		expect(resolveHref('  ', '/cv', ORIGIN)).toBeNull();
	});
});

describe('findOrphans', () => {
	const urls = ['/', '/cv', '/publications', '/publications/a', '/publications/b', '/teaching'].map(
		(path) => `${ORIGIN}${path}`
	);
	const check = (build, options = {}) =>
		findOrphans({
			urls,
			files: Object.keys(build),
			read: (file) => build[file],
			origin: ORIGIN,
			...options
		});

	it('reports advertised pages no other advertised page links to', () => {
		const build = {
			'index.html': '<a href="./cv">CV</a><a href="./publications">Publications</a>',
			'cv.html': '<a href="./publications/a">A</a><a href="https://doi.org/10.1/b">doi</a>',
			'publications.html': '<a href="./publications/a?x#y">A</a>',
			'publications/a.html': '<a href="./a">self</a><a href="..">Home</a>',
			'publications/b.html': '<a href="./b">self</a>',
			'teaching.html': '',
			'publications/a.bib': '<a href="./b">not a page</a>'
		};
		// b links only to itself; teaching is linked from nowhere; the home page
		// is exempt although nothing but a/ links to it.
		expect(check(build)).toEqual(['/publications/b', '/teaching']);
	});

	it('does not count links from pages the sitemap does not list', () => {
		const build = {
			'index.html': '<a href="./cv">CV</a><a href="./publications">P</a>',
			'cv.html': '<a href="./publications/a">A</a><a href="./publications/b">B</a>',
			'publications.html': '',
			'publications/a.html': '',
			'publications/b.html': '',
			'404.html': '<a href="./teaching">Teaching</a>',
			'teaching.html': ''
		};
		expect(check(build)).toEqual(['/teaching']);
	});

	it('honours the exemptions, and reports the home page once it is not exempt', () => {
		const build = { 'index.html': '', 'cv.html': '' };
		expect(check(build, { exempt: ['/', '/teaching'] })).toEqual([
			'/cv',
			'/publications',
			'/publications/a',
			'/publications/b'
		]);
		expect(check(build, { exempt: [] })).toContain('/');
	});
});
