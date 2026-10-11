import { expect, it } from 'vitest';
import { validateDecisions } from './wikidata-workflow.mjs';

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
