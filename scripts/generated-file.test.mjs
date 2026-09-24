import { expect, it } from 'vitest';
import { staleOutputs } from './lib/generated-file.mjs';
import { projectSummary } from './lib/summary-projection.mjs';
import { ABSTRACT_EXCERPT_LENGTH } from '../src/lib/data/publications/summaryConfig.ts';

it('reports drifted and missing files as stale, current ones not', () => {
	const committed = { 'a.ts': 'same', 'b.ts': 'old' };
	const read = (file) => committed[file] ?? null;
	expect(
		staleOutputs(
			[
				['a.ts', 'same'],
				['b.ts', 'new'],
				['c.ts', 'anything']
			],
			read
		)
	).toEqual(['b.ts', 'c.ts']);
});

it('drops the heavy fields and keeps one character past the excerpt contract', () => {
	const abstract = 'x'.repeat(ABSTRACT_EXCERPT_LENGTH + 50);
	const summary = projectSummary({ id: 'r', title: 'T', abstract, citedBy: [1] }, [
		'abstract',
		'citedBy'
	]);
	expect(summary).toEqual({
		id: 'r',
		title: 'T',
		abstractExcerpt: 'x'.repeat(ABSTRACT_EXCERPT_LENGTH + 1)
	});
});

it('keeps a short abstract whole and adds no excerpt without one', () => {
	expect(projectSummary({ id: 'r', abstract: 'Short.' }, ['abstract'])).toEqual({
		id: 'r',
		abstractExcerpt: 'Short.'
	});
	expect(projectSummary({ id: 'r', abstract: '' }, ['abstract'])).toEqual({ id: 'r' });
});
