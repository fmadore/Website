import { describe, it, expect } from 'vitest';
import {
	announcedTwin,
	brokenLlmsLinks,
	checkMarkdownTwins,
	pagePathOf,
	twinPathOf
} from './lib/markdown-twins.mjs';

const ORIGIN = 'https://www.example.org';
const head = (twin) =>
	`<html><head><link rel="canonical" href="${ORIGIN}/x">${
		twin ? `<link rel="alternate" type="text/markdown" href="${twin}">` : ''
	}<link rel="alternate" type="application/rss+xml" href="${ORIGIN}/rss.xml"></head></html>`;

describe('announcedTwin', () => {
	it('reads the Markdown alternate and ignores the feeds', () => {
		expect(announcedTwin(head(`${ORIGIN}/a.md`))).toBe(`${ORIGIN}/a.md`);
		expect(announcedTwin(head())).toBeNull();
		expect(
			announcedTwin(`<link href='/b.md' type='text/markdown; charset=utf-8' rel='alternate'>`)
		).toBe('/b.md');
	});
});

describe('page and twin paths', () => {
	it('map build files to page paths and page paths to twins', () => {
		expect(pagePathOf('index.html')).toBe('/');
		expect(pagePathOf('publications\\x.html')).toBe('/publications/x');
		expect(pagePathOf('cv/index.html')).toBe('/cv');
		expect(twinPathOf('/')).toBe('/index.md');
		expect(twinPathOf('/cv')).toBe('/cv.md');
	});
});

describe('checkMarkdownTwins', () => {
	const build = {
		'index.html': head(`${ORIGIN}/index.md`),
		'index.md': '# Home',
		'publications.html': head(`${ORIGIN}/publications.md`),
		'publications/a.html': head(`${ORIGIN}/publications/a.md`),
		'publications/a.md': '# A',
		'publications/b.md': '# B',
		'publications/b.html': head(),
		'publications/visualisations.html': head(),
		'other.html': head('https://elsewhere.org/other.md'),
		'data/README.md': '# Not a twin'
	};
	const result = checkMarkdownTwins({
		files: Object.keys(build),
		read: (file) => build[file],
		origin: ORIGIN
	});

	it('finds an announced twin the build did not ship', () => {
		expect(result.missing).toEqual([{ page: '/publications', href: `${ORIGIN}/publications.md` }]);
	});

	it('finds a shipped twin its page does not announce, but not a stray Markdown file', () => {
		expect(result.unannounced).toEqual(['/publications/b.md']);
	});

	it('finds an alternate pointing off the site', () => {
		expect(result.foreign).toEqual([{ page: '/other', href: 'https://elsewhere.org/other.md' }]);
		expect(result.announced).toBe(3);
	});
});

describe('brokenLlmsLinks', () => {
	it('reports only site links that resolve to nothing', () => {
		const text = [
			`- [Home](${ORIGIN}/index.md)`,
			`- [Page](${ORIGIN}/teaching): web page`,
			`- [Root](${ORIGIN}/)`,
			`- [Gone](${ORIGIN}/gone.md)`,
			'- [External](https://github.com/x)'
		].join('\n');
		expect(
			brokenLlmsLinks({ text, files: ['index.md', 'index.html', 'teaching.html'], origin: ORIGIN })
		).toEqual([`${ORIGIN}/gone.md`]);
	});
});
