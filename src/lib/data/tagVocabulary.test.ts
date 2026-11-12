import { describe, it, expect } from 'vitest';

import {
	TAG_ALIASES,
	SKILL_ALIASES,
	canonicalTag,
	canonicalSkill,
	vocabularyFoldKey
} from './tagVocabulary.ts';

describe.each([
	{ name: 'TAG_ALIASES', aliases: TAG_ALIASES },
	{ name: 'SKILL_ALIASES', aliases: SKILL_ALIASES }
])('$name', ({ aliases }) => {
	it('never maps a value to an alias (no chains)', () => {
		const chained = Object.entries(aliases).filter(([, canonical]) =>
			Object.hasOwn(aliases, canonical)
		);
		expect(chained).toEqual([]);
	});

	it('never maps a value to itself', () => {
		expect(Object.entries(aliases).filter(([alias, canonical]) => alias === canonical)).toEqual([]);
	});
});

describe('canonicalTag', () => {
	it('maps an alias to its canonical tag', () => {
		expect(canonicalTag('AI')).toBe('Artificial Intelligence');
		expect(canonicalTag('Named-Entity Recognition')).toBe('Named Entity Recognition');
		expect(canonicalTag('Securitization')).toBe('Securitisation');
	});

	it('returns any other tag unchanged', () => {
		expect(canonicalTag('Islam')).toBe('Islam');
		expect(canonicalTag('Artificial Intelligence')).toBe('Artificial Intelligence');
	});

	it('does not read inherited properties as aliases', () => {
		expect(canonicalTag('toString')).toBe('toString');
		expect(canonicalTag('constructor')).toBe('constructor');
	});
});

describe('canonicalSkill', () => {
	it('maps a skill to its Title Case form', () => {
		expect(canonicalSkill('Data visualisation')).toBe('Data Visualisation');
		expect(canonicalSkill('Python')).toBe('Python');
	});
});

describe('vocabularyFoldKey', () => {
	it('folds case, diacritics, punctuation and spacing', () => {
		expect(vocabularyFoldKey('Named-Entity Recognition')).toBe(
			vocabularyFoldKey('named entity recognition')
		);
		expect(vocabularyFoldKey('Côte d’Ivoire')).toBe(vocabularyFoldKey("Cote d'Ivoire"));
		expect(vocabularyFoldKey('Data visualisation')).toBe(vocabularyFoldKey('Data Visualisation'));
	});

	it('keeps distinct words apart', () => {
		expect(vocabularyFoldKey('Decoloniality')).not.toBe(vocabularyFoldKey('Decolonisation'));
	});
});
