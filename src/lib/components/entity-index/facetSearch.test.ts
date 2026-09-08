import { describe, it, expect } from 'vitest';
import {
	foldFacetText,
	matchFacetOptions,
	rankFacetOptions,
	visibleFacetOptions
} from './facetSearch';

describe('foldFacetText', () => {
	it('strips diacritics so a typed ASCII query reaches the accented value', () => {
		expect(foldFacetText("Côte d'Ivoire")).toBe("cote d'ivoire");
		expect(foldFacetText('Éducation')).toBe('education');
		expect(foldFacetText('Ouagadougou')).toBe('ouagadougou');
	});

	it('folds typographic apostrophes to the typed one', () => {
		expect(foldFacetText('Côte d’Ivoire')).toBe("cote d'ivoire");
		expect(foldFacetText('Union des ’ulama')).toBe("union des 'ulama");
	});

	it('leaves a plain ASCII string alone but for case', () => {
		expect(foldFacetText('Islam')).toBe('islam');
	});
});

describe('matchFacetOptions', () => {
	const options = ["Côte d'Ivoire", 'Burkina Faso', 'Bénin', 'Togo', 'Niger'];
	const counts = { "Côte d'Ivoire": 12, 'Burkina Faso': 30, Bénin: 12, Togo: 4, Niger: 1 };

	it('matches case- and diacritic-insensitively', () => {
		expect(matchFacetOptions(options, 'cote', counts)).toEqual(["Côte d'Ivoire"]);
		expect(matchFacetOptions(options, 'BENIN', counts)).toEqual(['Bénin']);
		expect(matchFacetOptions(options, 'côte', counts)).toEqual(["Côte d'Ivoire"]);
	});

	it('matches a curly apostrophe in the query against a straight one in the data', () => {
		expect(matchFacetOptions(options, 'd’ivoire', counts)).toEqual(["Côte d'Ivoire"]);
	});

	it('matches anywhere in the value, not only at the start', () => {
		expect(matchFacetOptions(options, 'faso', counts)).toEqual(['Burkina Faso']);
	});

	it('ranks by count descending, then alphabetically on a tie', () => {
		expect(matchFacetOptions(options, '', counts)).toEqual([
			'Burkina Faso',
			'Bénin',
			"Côte d'Ivoire",
			'Togo',
			'Niger'
		]);
	});

	it('treats a missing count as zero rather than dropping the option', () => {
		expect(matchFacetOptions(['Mali', 'Niger'], '', { Niger: 3 })).toEqual(['Niger', 'Mali']);
	});

	it('ignores surrounding whitespace in the query', () => {
		expect(matchFacetOptions(options, '  togo  ', counts)).toEqual(['Togo']);
	});

	it('returns nothing when nothing matches', () => {
		expect(matchFacetOptions(options, 'zzz', counts)).toEqual([]);
	});

	it('never mutates the option array it was given', () => {
		const original = [...options];
		matchFacetOptions(options, '', counts);
		expect(options).toEqual(original);
	});
});

describe('rankFacetOptions', () => {
	it('orders ties alphabetically', () => {
		expect(rankFacetOptions(['Zaria', 'Abidjan', 'Lomé'], {})).toEqual([
			'Abidjan',
			'Lomé',
			'Zaria'
		]);
	});
});

describe('visibleFacetOptions', () => {
	const options = ['a', 'b', 'c', 'd', 'e'];

	it('caps the list at the limit when nothing is selected', () => {
		expect(visibleFacetOptions(options, 3, [])).toEqual(['a', 'b', 'c']);
	});

	it('appends a selected value that the cut would have hidden', () => {
		expect(visibleFacetOptions(options, 3, ['e'])).toEqual(['a', 'b', 'c', 'e']);
	});

	it('keeps appended values in option order', () => {
		expect(visibleFacetOptions(options, 2, ['e', 'd'])).toEqual(['a', 'b', 'd', 'e']);
	});

	it('does not duplicate a selected value already inside the head', () => {
		expect(visibleFacetOptions(options, 3, ['b'])).toEqual(['a', 'b', 'c']);
	});

	it('ignores a selected value that is not an option at all', () => {
		expect(visibleFacetOptions(options, 3, ['zzz'])).toEqual(['a', 'b', 'c']);
	});

	it('returns the whole list when it is shorter than the limit', () => {
		expect(visibleFacetOptions(options, 10, ['e'])).toEqual(options);
	});
});
