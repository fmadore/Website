import { expect, it } from 'vitest';
import {
	haystackMatches,
	matchesSearchTerms,
	normalizeSearchText,
	parseSearchQuery,
	searchHaystack,
	searchTerms
} from './searchText';
import { foldFacetText } from '#lib/components/entity-index/facetSearch.ts';
import { normalise } from './apiSearch';

it.each(['Côte d’Ivoire', "CÔTE D'IVOIRE", 'Côte dʼIvoire'])(
	'shares the same accent/apostrophe policy for %s across the site and the agent tools',
	(value) => {
		expect(normalizeSearchText(value)).toBe("cote d'ivoire");
		expect(foldFacetText(value)).toBe(normalise(value));
		expect(matchesSearchTerms([value], "cote d'ivoire")).toBe(true);
	}
);
it('matches all terms across fields regardless of order, preserving raw labels', () => {
	const fields = ['Éducation', 'Frédérick Madore'];
	expect(matchesSearchTerms(fields, 'madore education')).toBe(true);
	expect(matchesSearchTerms(fields, 'madore absent')).toBe(false);
	expect(matchesSearchTerms(fields, '   ')).toBe(true);
	expect(searchTerms(' Éducation  Madore ')).toEqual(['education', 'madore']);
	expect(fields).toEqual(['Éducation', 'Frédérick Madore']);
});

it('reads a quoted run as one phrase, in straight or typographic quotes', () => {
	expect(parseSearchQuery('"religious authority" Togo')).toEqual(['religious authority', 'togo']);
	expect(parseSearchQuery('“Religious   authority”')).toEqual(['religious authority']);
	expect(parseSearchQuery('"open phrase runs on')).toEqual(['open phrase runs on']);
	expect(parseSearchQuery('stray"quote "" ')).toEqual(['stray', 'quote']);
	expect(parseSearchQuery('   ')).toEqual([]);
});

it('matches a phrase as written, within one field and never across two', () => {
	const fields = ['Religious authority in Togo', 'Islam'];
	expect(matchesSearchTerms(fields, '"religious authority"')).toBe(true);
	expect(matchesSearchTerms(fields, '"authority religious"')).toBe(false);
	expect(matchesSearchTerms(fields, 'authority religious')).toBe(true);
	expect(matchesSearchTerms(fields, '"togo islam"')).toBe(false);
	expect(matchesSearchTerms(['Religious\n  authority'], '"religious authority"')).toBe(true);
});

it('keeps accent and apostrophe folding inside a phrase', () => {
	expect(matchesSearchTerms(['La Côte d’Ivoire'], '"cote d\'ivoire"')).toBe(true);
	expect(searchHaystack(['  Éducation ', '', 'Bénin'])).toBe('education\nbenin');
	expect(haystackMatches('anything', [])).toBe(true);
});

it('spells out the ligatures NFD leaves whole, and leaves umlauts to NFD', () => {
	expect(normalizeSearchText('Œuvre Cæsar Straße')).toBe('oeuvre caesar strasse');
	expect(matchesSearchTerms(['Une œuvre'], 'oeuvre')).toBe(true);
	expect(matchesSearchTerms(['Schönfeld'], 'schonfeld')).toBe(true);
});
