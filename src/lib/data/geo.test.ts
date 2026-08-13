import { describe, expect, it } from 'vitest';
import { allCommunications } from '$lib/data/communications';
import { COUNTRY_COORDINATES } from './geo';

describe('country map coverage', () => {
	it('maps every country represented in conference activity data', () => {
		const countries = new Set(
			allCommunications
				.map((communication) => communication.country?.trim())
				.filter((country): country is string => Boolean(country))
		);
		const missingCountries = [...countries]
			.filter((country) => !COUNTRY_COORDINATES[country])
			.sort((a, b) => a.localeCompare(b));

		expect(missingCountries).toEqual([]);
	});
});
