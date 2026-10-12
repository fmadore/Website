import { expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateDecisions, planEdits, reviewIds } from './wikidata-workflow.mjs';

const rows = new Map([['chapter-2023', { id: 'chapter-2023', status: 'review' }]]);

it('accepts decisions for audited records', () => {
	expect(() => validateDecisions({ 'chapter-2023': { qid: 'Q1' } }, rows)).not.toThrow();
});

it('refuses an unknown ID unless it is marked as a work the site does not list', () => {
	expect(() => validateDecisions({ 'chapter-2032': { qid: 'Q1' } }, rows)).toThrow(
		'Decision missing'
	);
	expect(() =>
		validateDecisions({ 'yearbook-2025': { qid: 'Q2', notOnSite: true } }, rows)
	).not.toThrow();
});

it('refuses a decision that both matches and creates', () => {
	expect(() =>
		validateDecisions({ 'chapter-2023': { qid: 'Q1', action: 'create' } }, rows)
	).toThrow('Choose match or create');
});

it('accepts decisions for the reviews a record lists', () => {
	const reviews = new Set(['chapter-2023--review-falen-2026']);
	expect(() =>
		validateDecisions({ 'chapter-2023--review-falen-2026': { qid: 'Q3' } }, rows, reviews)
	).not.toThrow();
	expect(() =>
		validateDecisions({ 'chapter-2023--review-other-2026': { qid: 'Q3' } }, rows, reviews)
	).toThrow('Decision missing');
});

it('writes a record’s QID and its reviews’ into one file, each edit building on the last', () => {
	const directory = mkdtempSync(join(tmpdir(), 'wikidata-reviews-'));
	try {
		const file = join(directory, 'book.ts');
		const source = `export const p = {\n\tid: 'book',\n\treviewedBy: [\n\t\t{\n\t\t\tauthor: 'Douglas J. Falen',\n\t\t\tyear: 2026,\n\t\t\ttitle: 'Review',\n\t\t\turl: 'https://doi.org/10.1017/asr.2025.10172'\n\t\t}\n\t]\n};\n`;
		writeFileSync(file, source);
		const record = {
			id: 'book',
			dateISO: '2023',
			reviewedBy: [
				{
					author: 'Douglas J. Falen',
					year: 2026,
					title: 'Review',
					url: 'https://doi.org/10.1017/asr.2025.10172'
				}
			]
		};
		const edits = planEdits(
			[{ file, record }],
			new Map([['book', { status: 'review' }]]),
			{ book: { qid: 'Q1' }, 'book--review-falen-2026': { qid: 'Q2' } },
			false
		);
		expect(edits.map((e) => [e.id, e.qid, e.doi])).toEqual([
			['book', 'Q1', undefined],
			['book--review-falen-2026', 'Q2', '10.1017/ASR.2025.10172']
		]);
		expect(edits.every((e) => e.source === source && e.updated === edits[0].updated)).toBe(true);
		expect(edits[0].updated).toContain("\tid: 'book',\n\twikidataId: 'Q1',");
		expect(edits[0].updated).toContain(
			"\t\t{\n\t\t\twikidataId: 'Q2',\n\t\t\tauthor: 'Douglas J. Falen',"
		);
		expect(() =>
			planEdits(
				[{ file, record }],
				new Map(),
				{ book: { qid: 'Q1' }, 'book--review-falen-2026': { qid: 'Q1' } },
				false
			)
		).toThrow('assigned to both');
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
});

it('writes a citing work’s QID on every record that lists it', () => {
	const directory = mkdtempSync(join(tmpdir(), 'wikidata-citing-'));
	try {
		const citing = (title) => ({
			authors: ['Sebastian Elischer'],
			year: 2021,
			title,
			url: 'https://doi.org/10.1017/9781108909549'
		});
		const entries = ['a', 'b'].map((id, i) => {
			const title = i ? 'Salafism and political order' : 'Salafism and Political Order in Africa';
			const file = join(directory, `${id}.ts`);
			writeFileSync(
				file,
				`export const p = {\n\tid: '${id}',\n\tcitedBy: [\n\t\t{\n\t\t\tauthors: ['Sebastian Elischer'],\n\t\t\tyear: 2021,\n\t\t\ttitle: '${title}'\n\t\t}\n\t]\n};\n`
			);
			return { file, record: { id, dateISO: '2020', citedBy: [citing(title)] } };
		});
		const id = 'citing--elischer-2021-salafism-and-political-order-in';
		expect([...reviewIds(entries)]).toEqual([id]);
		expect(() =>
			validateDecisions({ [id]: { qid: 'Q5' } }, new Map(), reviewIds(entries))
		).not.toThrow();
		const edits = planEdits(entries, new Map(), { [id]: { qid: 'Q5' } }, false);
		expect(edits.map((e) => [e.file, e.id, e.qid, e.doi])).toEqual([
			[entries[0].file, id, 'Q5', '10.1017/9781108909549'],
			[entries[1].file, id, 'Q5', '10.1017/9781108909549']
		]);
		for (const edit of edits)
			expect(edit.updated).toContain(
				"\t\t{\n\t\t\twikidataId: 'Q5',\n\t\t\tauthors: ['Sebastian Elischer'],"
			);
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
});
