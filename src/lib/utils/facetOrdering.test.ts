import { expect, it } from 'vitest';
import { countOccurrences, byFrequencyThenAlpha } from './facetOrdering';
it('ranks frequent facet values first and breaks ties alphabetically without mutating input', () => {
	const counts = countOccurrences([
		['Islam', 'Education'],
		['Islam', 'Archives']
	]);
	const values = ['Missing', 'Islam', 'Education', 'Archives'];
	expect(byFrequencyThenAlpha(values, counts)).toEqual([
		'Islam',
		'Archives',
		'Education',
		'Missing'
	]);
	expect(values[0]).toBe('Missing');
	expect(counts.get('Islam')).toBe(2);
});
