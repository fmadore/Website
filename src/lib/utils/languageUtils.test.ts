import { describe, it, expect } from 'vitest';
import { titleLangAttr } from './languageUtils';

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
