import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { hash } from './wikidata.mjs';
import { validateReport, validateDecisions, planEdits } from './wikidata-workflow.mjs';
import { candidate, classify, doi, insertQid, lookupQuery, client } from './wikidata.mjs';

const publication = {
	id: 'test-publication',
	title: 'Une étude',
	type: 'article',
	dateISO: '2024',
	language: 'French',
	authors: ['Frédérick Madore', { name: 'Other Author' }],
	doi: 'https://doi.org/10.1234/ABC'
};
const match = {
	qid: 'Q123',
	reasons: ['doi'],
	labels: { fr: 'Une étude' },
	titles: [],
	dois: ['10.1234/abc']
};
it('excludes forthcoming publications regardless of DOI, projected date or an old match', () => {
	for (const date of ['Forthcoming', '  forthcoming ', 'À paraître', 'a paraitre']) {
		const p = { ...publication, date, dateISO: '2020-01-01' };
		expect(lookupQuery([p])).toBeNull();
		expect(classify(p, [match]).status).toBe('excluded-forthcoming');
		const rows = new Map([[p.id, { status: 'exact', suggestedQid: 'Q123' }]]);
		expect(
			planEdits(
				[{ file: 'must-not-be-read.ts', record: p }],
				rows,
				{ [p.id]: { qid: 'Q123' } },
				true
			)
		).toEqual([]);
	}
});

it('blocks stale/incomplete audits, changed sources, duplicate assignments and unknown decisions', () => {
	const directory = mkdtempSync(join(tmpdir(), 'wikidata-test-'));
	try {
		const file = join(directory, 'record.ts');
		const source = "export const p = { id: 'test-publication' };";
		writeFileSync(file, source);
		const entries = [{ file, record: publication }];
		const report = {
			version: 1,
			complete: true,
			errors: [],
			generatedAt: new Date().toISOString(),
			publications: [
				{ id: publication.id, sourceHash: hash(source), status: 'exact', suggestedQid: 'Q123' }
			]
		};
		const rows = validateReport(report, entries);
		expect(
			validateReport(report, [{ file, record: { ...publication, date: 'Forthcoming' } }]).size
		).toBe(0);
		expect(planEdits(entries, rows, {}, true)).toHaveLength(1);
		expect(planEdits(entries, rows, { [publication.id]: {} }, true)).toHaveLength(0);
		expect(() => validateReport({ ...report, complete: false }, entries)).toThrow('complete');
		expect(() => validateReport({ ...report, generatedAt: '2020-01-01' }, entries)).toThrow(
			'stale'
		);
		expect(() => validateDecisions({ missing: { qid: 'Q123' } }, rows)).toThrow('missing');
		expect(() =>
			validateDecisions({ [publication.id]: { qid: 'Q123', create: true } }, rows)
		).toThrow('Choose');
		expect(() =>
			planEdits(
				[...entries, { file, record: { ...publication, id: 'other', wikidataId: 'Q123' } }],
				rows,
				{},
				true
			)
		).toThrow('both');
		writeFileSync(file, source + '\n');
		expect(() => validateReport(report, entries)).toThrow('Source changed');
	} finally {
		rmSync(directory, { recursive: true });
	}
});

describe('reconciliation', () => {
	it('normalizes DOI URLs and searches both canonical cases', () => {
		expect(doi(' doi: 10.1234/ABC ')).toBe('10.1234/ABC');
		const query = lookupQuery([publication]);
		expect(query).toContain('"10.1234/ABC"');
		expect(query).toContain('"10.1234/abc"');
	});
	it('never identifies a record by a DOI it shares with others (its container)', () => {
		const chapter = { ...publication, type: 'chapter', doi: '10.58144/20241107-000' };
		const book = { ...chapter, id: 'the-book', type: 'book' };
		const shared = new Set(['10.58144/20241107-000']);
		expect(lookupQuery([chapter], shared)).toBeNull();
		expect(lookupQuery([book], shared)).toContain('"10.58144/20241107-000"');
		expect(lookupQuery([chapter])).toContain('"10.58144/20241107-000"');
	});
	it('requires a unique DOI plus title; refuses ambiguous IDs and title-only matches', () => {
		expect(classify(publication, [match]).status).toBe('exact');
		expect(classify(publication, [match, { ...match, qid: 'Q124' }]).status).toBe('review');
		expect(classify(publication, [{ ...match, labels: { en: 'Different work' } }]).status).toBe(
			'review'
		);
		expect(classify(publication, [{ ...match, reasons: ['search-fr'] }]).status).toBe('review');
		expect(
			classify(publication, [{ ...match, dois: ['10.1234/abc', '10.1234/other'] }]).status
		).toBe('review');
		expect(classify(publication, []).status).toBe('unmatched');
	});
	it('preserves existing QIDs and ignores deprecated metadata', () => {
		expect(classify({ ...publication, wikidataId: 'Q999' }, [match]).suggestedQid).toBe('Q999');
		const c = candidate(
			{
				id: 'Q123',
				claims: { P356: [{ rank: 'deprecated', mainsnak: { datavalue: { value: 'old' } } }] }
			},
			['doi']
		);
		expect(c.dois).toEqual([]);
	});
	it('patches only the publication object, preserving comments, nested records and CRLF', () => {
		const source =
			"// comment\r\nexport const p: Publication = {\r\n\tid: 'test-publication',\r\n\tcitedBy: [{ title: 'Other', wikidataId: 'Q77' }]\r\n};\r\n";
		const result = insertQid(source, publication.id, 'Q123');
		expect(result.replace("\r\n\twikidataId: 'Q123',", '')).toBe(source);
		expect(result).toContain("\tid: 'test-publication',\r\n\twikidataId: 'Q123',");
		expect(insertQid(result, publication.id, 'Q123')).toBe(result);
		expect(() => insertQid(result, publication.id, 'Q456')).toThrow('replace');
		expect(() => insertQid(source, 'absent', 'Q123')).toThrow('unique');
		expect(() => insertQid(source, publication.id, 'Q0')).toThrow('Invalid');
	});
	it('keeps a comment on the id line with the id', () => {
		const source =
			"export const p: Publication = {\n\tid: 'test-publication', // URL-friendly ID\n\ttype: 'article'\n};\n";
		expect(insertQid(source, publication.id, 'Q123')).toBe(
			"export const p: Publication = {\n\tid: 'test-publication', // URL-friendly ID\n\twikidataId: 'Q123',\n\ttype: 'article'\n};\n"
		);
	});
	it('rejects HTTP/API errors, retries throttling, and never makes a write request', async () => {
		const urls = [];
		let calls = 0;
		const request = client(
			async (url, options) => {
				urls.push(url.href);
				expect(options.method).toBeUndefined();
				return ++calls === 1 ? new Response('', { status: 429 }) : Response.json({ search: [] });
			},
			async () => {}
		);
		expect(
			await request('https://www.wikidata.org/w/api.php', { action: 'wbsearchentities' })
		).toEqual({ search: [] });
		expect(urls).toHaveLength(2);
		await expect(
			client(
				async () => Response.json({ error: { code: 'failure', info: 'unavailable' } }),
				async () => {}
			)('https://www.wikidata.org', {})
		).rejects.toThrow('failure');
	});
});
