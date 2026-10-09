import { describe, it, expect } from 'vitest';
import {
	blocks,
	bullets,
	codeBlock,
	document,
	entries,
	fields,
	groupByYear,
	inline,
	link,
	section
} from './markdown';
import { markdownResponse, markdownUrl, pageUrl, resolveLink, SITE, TWIN_PAGE_PATHS } from './site';
import { allResearchProjects } from '$lib/data/research';
import { componentChildren, pageProseMarkdown, svelteMarkupToHtml } from './svelteProse';

describe('markdown composition', () => {
	it('escapes inline text and link labels', () => {
		expect(inline('  a *b*\n c ')).toBe('a \\*b\\* c');
		expect(link('[x]', 'https://e.org/a b(c)')).toBe('[\\[x\\]](https://e.org/a%20b%28c%29)');
	});

	it('joins blocks, dropping empty ones, and ends a document with one newline', () => {
		expect(blocks('a', '', undefined, false, ' b ')).toBe('a\n\nb');
		expect(document('# T', null, 'body')).toBe('# T\n\nbody\n');
	});

	it('omits a section with nothing in it', () => {
		expect(section('Empty', '', undefined)).toBe('');
		expect(section('Full', 'x')).toBe('## Full\n\nx');
	});

	it('indents continuation lines of a bullet, leaving blank lines blank', () => {
		expect(bullets(['one\ntwo', '', 'three\n\n> quote'])).toBe(
			'- one\n  two\n- three\n\n  > quote'
		);
	});

	it('prints a field list without the empty rows', () => {
		expect(
			fields([
				['Date', '2025'],
				['Pages', ''],
				['DOI', undefined]
			])
		).toBe('- **Date:** 2025');
	});

	it('fences code longer than any backtick run inside it', () => {
		expect(codeBlock('a ``` b\n')).toBe('````\na ``` b\n````');
	});

	it('groups by year, newest first, with undated records last', () => {
		const groups = groupByYear([
			{ dateISO: '2023-01-01' },
			{ year: 2025 },
			{},
			{ dateISO: '2025-05' }
		]);
		expect(groups.map(([year, items]) => [year, items.length])).toEqual([
			['2025', 2],
			['2023', 1],
			['Undated', 1]
		]);
	});

	it('counts entries with the glossary noun', () => {
		expect(entries(1)).toBe('1 entry');
		expect(entries(45)).toBe('45 entries');
	});
});

describe('site addresses', () => {
	it('knows every section and record that has a twin', () => {
		expect(TWIN_PAGE_PATHS.has('/')).toBe(true);
		expect(TWIN_PAGE_PATHS.has('/cv')).toBe(true);
		expect(TWIN_PAGE_PATHS.has('/publications/religious-activism-campuses')).toBe(true);
		expect(TWIN_PAGE_PATHS.has('/publications/visualisations')).toBe(false);
		expect(TWIN_PAGE_PATHS.has('/teaching/guest-lectures')).toBe(true);
		expect(TWIN_PAGE_PATHS.has('/cv/timeline')).toBe(false);
	});

	it('names a twin, and refuses to invent one', () => {
		expect(markdownUrl('/')).toBe(`${SITE}/index.md`);
		expect(markdownUrl('/research')).toBe(`${SITE}/research.md`);
		expect(markdownUrl('/teaching')).toBe(`${SITE}/teaching.md`);
		expect(() => markdownUrl('/cv/timeline')).toThrow(/No Markdown twin/);
		expect(pageUrl('/')).toBe(`${SITE}/`);
	});

	it('points internal links at twins where they exist, and leaves the rest alone', () => {
		expect(resolveLink('/publications/religious-activism-campuses')).toBe(
			`${SITE}/publications/religious-activism-campuses.md`
		);
		expect(resolveLink(`${SITE}/research/`)).toBe(`${SITE}/research.md`);
		expect(resolveLink('/cv/timeline')).toBe(`${SITE}/cv/timeline`);
		expect(resolveLink('images/a.webp')).toBe(`${SITE}/images/a.webp`);
		expect(resolveLink('/publications?type=book')).toBe(`${SITE}/publications?type=book`);
		expect(resolveLink('https://doi.org/10.1/x')).toBe('https://doi.org/10.1/x');
		expect(resolveLink('mailto:a@b.c')).toBe('mailto:a@b.c');
	});

	it('serves a twin as Markdown', async () => {
		const response = markdownResponse('# T\n');
		expect(response.headers.get('content-type')).toBe('text/markdown; charset=utf-8');
		expect(await response.text()).toBe('# T\n');
	});
});

describe('Svelte prose', () => {
	it('finds a component’s children past a multi-line opening tag with expressions', () => {
		const source = '<Layout {...record(\'x\')}\n\tclass="a">\n<p>Body</p>\n</Layout>';
		expect(componentChildren(source, 'Layout').trim()).toBe('<p>Body</p>');
		expect(() => componentChildren('<p></p>', 'Layout')).toThrow(/No <Layout>/);
	});

	it('reduces resolved addresses, citations and dropped components to plain HTML', () => {
		const html = svelteMarkupToHtml(
			`<p><a href={resolve('/research')} data-sveltekit-preload-data>research</a>{' '}
			<ItemReference id="religious-activism-campuses" />
			<ItemReference id="sphere-publique-musulmane" label="that book" />
			<a class:active={x} href={resolve(\`/activities/y\` as \`/activities/\${string}\`)}>y</a></p>
			<!-- <Unknown /> -->
			<p class="cta"><Button href={resolve('/publications')}>View all</Button></p>
			<RelevantGrants projectName="X" />`
		);
		expect(html).toContain('<a href="/research" data-sveltekit-preload-data>research</a> ');
		expect(html).toContain(
			'<a href="/publications/religious-activism-campuses">(Madore, 2025)</a>'
		);
		expect(html).toContain('<a href="/publications/sphere-publique-musulmane">that book</a>');
		expect(html).toContain('<a  href="/activities/y">y</a>');
		expect(html).not.toMatch(/Button|RelevantGrants|View all|Unknown/);
	});

	it('refuses markup it cannot read, rather than dropping prose', () => {
		expect(() => svelteMarkupToHtml('<p>{#if x}a{/if}</p>')).toThrow(/Svelte blocks/);
		expect(() => svelteMarkupToHtml('<Mystery />')).toThrow(/<Mystery>/);
		expect(() => svelteMarkupToHtml('<p>{count}</p>')).toThrow(/expression/);
		expect(() => svelteMarkupToHtml('<a href={url}>x</a>')).toThrow(/address/);
		expect(() => svelteMarkupToHtml('<ItemReference id="no-such-record" />')).toThrow(
			/cites "no-such-record", which the reference index lacks/
		);
	});

	it('reads every research project’s prose, and the home page’s', () => {
		for (const { id } of allResearchProjects) {
			const file = `/src/routes/research/${id}/+page.svelte`;
			expect(pageProseMarkdown(file, 'ResearchProjectLayout').length, file).toBeGreaterThan(500);
		}
		expect(pageProseMarkdown('/src/routes/+page.svelte', 'ContentBody')).toMatch(
			/^I am a Data Curator/
		);
		expect(() => pageProseMarkdown('/src/routes/nowhere/+page.svelte', 'X')).toThrow(
			/No page source/
		);
	});
});
