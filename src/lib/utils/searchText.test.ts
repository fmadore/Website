import { expect, it } from 'vitest';
import { matchesSearchTerms, normalizeSearchText, searchTerms } from './searchText';
import { foldFacetText } from '$lib/components/entity-index/facetSearch';
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
