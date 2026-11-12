import { describe, it, expect } from 'vitest';
import { jsonLdLanguage, languageCodes, titleLangAttr } from './languageUtils';
import { allPublicationSummaries } from '#lib/data/publications/summaries.ts';
import { allCommunicationSummaries } from '#lib/data/communications/summaries.ts';

describe('titleLangAttr', () => {
	it('returns a BCP-47 code for a single non-English language', () => {
		expect(titleLangAttr('French')).toBe('fr');
		expect(titleLangAttr('German')).toBe('de');
		expect(titleLangAttr(['French'])).toBe('fr');
	});

	it('is case-insensitive and trims whitespace', () => {
		expect(titleLangAttr('  french ')).toBe('fr');
	});

	it('returns undefined for English (the page default)', () => {
		expect(titleLangAttr('English')).toBeUndefined();
		expect(titleLangAttr(['English'])).toBeUndefined();
	});

	it('returns undefined for multilingual items (ambiguous title language)', () => {
		expect(titleLangAttr('English, French')).toBeUndefined();
		expect(titleLangAttr(['English', 'French'])).toBeUndefined();
	});

	it('returns undefined for unknown or empty values', () => {
		expect(titleLangAttr('Klingon')).toBeUndefined();
		expect(titleLangAttr('')).toBeUndefined();
		expect(titleLangAttr(undefined)).toBeUndefined();
	});
});

describe('languageCodes', () => {
	it('maps the names records store to BCP 47 codes, in order and without repeats', () => {
		expect(languageCodes('French')).toEqual(['fr']);
		expect(languageCodes('English, French')).toEqual(['en', 'fr']);
		expect(languageCodes(['French', 'English', 'french'])).toEqual(['fr', 'en']);
		expect(languageCodes(' German ')).toEqual(['de']);
	});

	it('passes a bare tag through and drops a name it does not know', () => {
		expect(languageCodes('en')).toEqual(['en']);
		expect(languageCodes('Klingon, French')).toEqual(['fr']);
		expect(languageCodes(undefined)).toEqual([]);
		expect(languageCodes('')).toEqual([]);
	});

	// The corpus is the oracle: a language a record uses that the map lacks
	// would silently vanish from inLanguage, citation_language and DC.language.
	it('knows every language a publication or talk is recorded in', () => {
		const fields = [
			...allPublicationSummaries.map((p) => p.language),
			...allCommunicationSummaries.map((c) => c.language)
		];
		const names = new Set(
			fields.flatMap((field) =>
				(typeof field === 'string' ? field.split(',') : (field ?? [])).map((n) => n.trim())
			)
		);
		names.delete('');
		expect(names.size).toBeGreaterThanOrEqual(2);
		for (const name of names) expect(languageCodes(name), name).toHaveLength(1);
	});
});

describe('jsonLdLanguage', () => {
	it('is a string for one language, an array for several, undefined for none', () => {
		expect(jsonLdLanguage('French')).toBe('fr');
		expect(jsonLdLanguage('English, French')).toEqual(['en', 'fr']);
		expect(jsonLdLanguage(['English', 'French'])).toEqual(['en', 'fr']);
		expect(jsonLdLanguage('Klingon')).toBeUndefined();
	});
});
