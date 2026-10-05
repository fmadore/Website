import { describe, expect, it } from 'vitest';
import {
	affiliationAppliesInYear,
	buildCommunicationCollaborators,
	buildPublicationCollaborators
} from './collaboratorAggregation';
import type { Communication } from '$lib/types/communication';
import type { Contributor } from '$lib/types/contributor';
import type { Institution, Person, PersonAffiliation } from '$lib/types/person';
import type { Publication } from '$lib/types/publication';

const OWNER = 'Frédérick Madore';
const SOURCE = { label: 'Dated publisher affiliation', url: 'https://example.org/article' };

const campuses: [Institution, Institution] = [
	{
		id: 'alpha',
		name: 'Alpha University',
		aliases: ['Université Alpha'],
		city: 'Alpha City',
		country: 'Canada',
		coordinates: { latitude: 46.78, longitude: -71.28 },
		sources: [SOURCE]
	},
	{
		id: 'beta',
		name: 'Beta University',
		city: 'Beta City',
		country: 'Germany',
		coordinates: { latitude: 52.43, longitude: 13.2 },
		sources: [SOURCE]
	}
];

function observation(
	institutionId: string,
	years: number[],
	confidence: PersonAffiliation['confidence'] = 'verified'
): PersonAffiliation {
	return {
		institutionId,
		institution: campuses.find((entry) => entry.id === institutionId)?.name ?? institutionId,
		years,
		confidence,
		sources: [SOURCE]
	};
}

function person(id: string, affiliations: PersonAffiliation[], aliases: string[] = []): Person {
	return { id, name: id === 'alice' ? 'Alice Roë' : 'Bob Bencherif', aliases, affiliations };
}

function publication(id: string, year: number, authors: Contributor[]): Publication {
	return {
		id,
		title: `Publication ${id}`,
		type: 'article',
		authors,
		date: String(year),
		dateISO: String(year),
		year,
		language: 'English'
	};
}

function communication(overrides: Partial<Communication> = {}): Communication {
	return {
		id: 'conference',
		title: 'Conference',
		authors: [OWNER],
		date: '2024',
		dateISO: '2024-06-01',
		year: 2024,
		conference: 'Annual meeting',
		location: 'The event venue is not an affiliation',
		country: 'France',
		coordinates: { latitude: 48.86, longitude: 2.35 },
		...overrides
	};
}

describe('affiliation evidence dates', () => {
	it('uses only the observed years without filling historical gaps', () => {
		const affiliation = observation('alpha', [2019, 2021]);
		expect(affiliationAppliesInYear(affiliation, 2019)).toBe(true);
		expect(affiliationAppliesInYear(affiliation, 2021)).toBe(true);
		expect(affiliationAppliesInYear(affiliation, 2020)).toBe(false);
		expect(affiliationAppliesInYear(affiliation, 2026)).toBe(false);
	});

	it('honours an explicitly sourced appointment range and both boundaries', () => {
		const affiliation: PersonAffiliation = {
			institution: 'Alpha University',
			confidence: 'verified',
			sources: [SOURCE],
			startYear: 2018,
			endYear: 2020
		};
		expect(
			[2017, 2018, 2019, 2020, 2021].map((year) => affiliationAppliesInYear(affiliation, year))
		).toEqual([false, true, true, true, false]);
	});

	it('does not turn undated or end-only evidence into a lifetime appointment', () => {
		const undated: PersonAffiliation = {
			institution: 'Alpha University',
			confidence: 'uncertain',
			sources: [SOURCE]
		};
		expect(affiliationAppliesInYear(undated, 2024)).toBe(false);
		expect(affiliationAppliesInYear({ ...undated, endYear: 2024 }, 2000)).toBe(false);
		expect(affiliationAppliesInYear({ ...undated, endYear: 2024 }, 2024)).toBe(true);
		expect(affiliationAppliesInYear({ ...undated, years: [], startYear: 2000 }, 2024)).toBe(false);
	});
});

describe('publication collaborators', () => {
	it('counts unique people at a campus and preserves each person’s distinct publication links', () => {
		const people = [
			person('alice', [observation('alpha', [2024])], ['A. Roë']),
			person('bob', [observation('alpha', [2024])])
		];
		const publications = [
			publication('one', 2024, [
				OWNER,
				'Alice Roe',
				'A Roe',
				{ name: 'Historical byline', personId: 'alice' },
				'Bob Bencherif'
			]),
			publication('two', 2024, ['Alice Roë', 'Frederick Madore'])
		];
		const result = buildPublicationCollaborators(publications, people, campuses);
		expect(result.totalPeople).toBe(2);
		expect(result.mappedPeople).toBe(2);
		expect(result.locations).toHaveLength(1);
		expect(result.locations[0]?.count).toBe(2);
		expect(result.locations[0]?.items?.map((item) => item.href)).toEqual([
			'/publications/one',
			'/publications/two'
		]);
		const alice = result.locations[0]?.collaborators?.find((entry) => entry.id === 'alice');
		expect(alice?.name).toBe('Alice Roë');
		expect(alice?.items).toHaveLength(2);
		expect(alice?.sources).toEqual([SOURCE]);
		expect(result.unresolved).toEqual([]);
	});

	it('does not rescue an invalid explicit person reference by merging a matching name', () => {
		const people = [person('alice', [observation('alpha', [2024])])];
		const result = buildPublicationCollaborators(
			[publication('one', 2024, [{ name: 'Alice Roë', personId: 'missing-person' }])],
			people,
			campuses
		);
		expect(result.locations).toEqual([]);
		expect(result.totalPeople).toBe(1);
		expect(result.unresolved[0]?.id).toBe('missing-person');
		expect(result.unresolved[0]?.reason).toContain('reference could not be resolved');
	});

	it('selects the affiliation supported in the publication year after a move', () => {
		const people = [person('alice', [observation('alpha', [2020]), observation('beta', [2024])])];
		const publications = [
			publication('old', 2020, ['Alice Roe']),
			publication('new', 2024, ['Alice Roe'])
		];
		const result = buildPublicationCollaborators(publications, people, campuses, 2020);
		expect(result.locations.map((location) => location.id)).toEqual(['alpha']);
		expect(result.locations[0]?.items?.map((item) => item.id)).toEqual(['old']);
		expect(
			buildPublicationCollaborators(publications, people, campuses, 2024).locations[0]?.id
		).toBe('beta');
	});

	it('keeps an unsupported historical year visible when the same person is mapped in a later year', () => {
		const people = [person('alice', [observation('alpha', [2024])])];
		const publications = [
			publication('unknown', 2018, ['Alice Roe']),
			publication('known', 2024, ['Alice Roe'])
		];
		const result = buildPublicationCollaborators(publications, people, campuses, undefined, true);
		expect(result.totalPeople).toBe(1);
		expect(result.mappedPeople).toBe(1);
		expect(result.locations[0]?.items?.map((item) => item.id)).toEqual(['known']);
		expect(result.unresolved).toHaveLength(1);
		expect(result.unresolved[0]?.reason).toContain('2018');
		expect(result.unresolved[0]?.items.map((item) => item.id)).toEqual(['unknown']);
	});

	it('excludes uncertain observations by default and never hides an included historical uncertainty', () => {
		const people = [
			person('alice', [observation('alpha', [2018], 'uncertain'), observation('alpha', [2024])])
		];
		const publications = [
			publication('old', 2018, ['Alice Roe']),
			publication('new', 2024, ['Alice Roe'])
		];
		const defaults = buildPublicationCollaborators(publications, people, campuses);
		expect(defaults.locations[0]?.items?.map((item) => item.id)).toEqual(['new']);
		expect(defaults.uncertainPeople).toBe(1);
		expect(defaults.unresolved[0]?.reason).toContain('Uncertain affiliation for 2018');
		for (const records of [publications, [...publications].reverse()]) {
			const included = buildPublicationCollaborators(records, people, campuses, undefined, true);
			expect(included.locations[0]?.collaborators?.[0]?.confidence).toBe('uncertain');
			expect(included.locations[0]?.collaborators?.[0]?.items).toHaveLength(2);
			expect(included.unresolved).toEqual([]);
		}
	});

	it('supersedes duplicate uncertainty without discarding a conflicting institutional claim', () => {
		const people = [
			person('alice', [
				observation('alpha', [2024], 'uncertain'),
				observation('alpha', [2024]),
				observation('beta', [2024], 'uncertain')
			])
		];
		const publications = [publication('one', 2024, ['Alice Roe'])];
		const defaults = buildPublicationCollaborators(publications, people, campuses);
		expect(defaults.locations.map((location) => location.id)).toEqual(['alpha']);
		expect(defaults.locations[0]?.collaborators?.[0]?.confidence).toBe('verified');
		expect(defaults.unresolved[0]?.reason).toContain('Beta University');
		const included = buildPublicationCollaborators(publications, people, campuses, undefined, true);
		expect(included.locations.map((location) => location.id).sort()).toEqual(['alpha', 'beta']);
		expect(included.mappedPeople).toBe(1);
	});

	it('preserves the caveats from each historical observation in an all-years view', () => {
		const olderNote = 'The 2018 publisher lists a visiting appointment only.';
		const laterNote = 'The 2024 affiliation remains disputed by another source.';
		const people = [
			person('alice', [
				{ ...observation('alpha', [2018]), note: olderNote },
				{ ...observation('alpha', [2024], 'uncertain'), note: laterNote }
			])
		];
		const publications = [
			publication('old', 2018, ['Alice Roe']),
			publication('new', 2024, ['Alice Roe'])
		];
		for (const records of [publications, [...publications].reverse()]) {
			const result = buildPublicationCollaborators(records, people, campuses, undefined, true);
			const collaborator = result.locations[0]?.collaborators?.[0];
			expect(collaborator?.note).toContain(olderNote);
			expect(collaborator?.note).toContain(laterNote);
		}
	});

	it('shows simultaneous verified affiliations while counting the person once', () => {
		const people = [person('alice', [observation('alpha', [2024]), observation('beta', [2024])])];
		const result = buildPublicationCollaborators(
			[publication('one', 2024, ['Alice Roe'])],
			people,
			campuses
		);
		expect(result.locations.map((location) => location.count)).toEqual([1, 1]);
		expect(result.totalPeople).toBe(1);
		expect(result.mappedPeople).toBe(1);
	});

	it('leaves unavailable and invalid institutional coordinates unresolved', () => {
		const invalidCampuses = [
			{ ...campuses[0], id: 'invalid-latitude', coordinates: { latitude: 91, longitude: 0 } },
			{ ...campuses[0], id: 'invalid-longitude', coordinates: { latitude: 0, longitude: -181 } },
			{ ...campuses[0], id: 'not-finite', coordinates: { latitude: Number.NaN, longitude: 0 } }
		];
		const people = [
			person(
				'alice',
				['missing-campus', 'invalid-latitude', 'invalid-longitude', 'not-finite'].map((id) =>
					observation(id, [2024])
				)
			)
		];
		const result = buildPublicationCollaborators(
			[publication('one', 2024, ['Alice Roe'])],
			people,
			invalidCampuses,
			undefined,
			true
		);
		expect(result.locations).toEqual([]);
		expect(result.mappedPeople).toBe(0);
		expect(result.totalPeople).toBe(1);
		expect(result.unresolved[0]?.reason).toContain('no campus location recorded yet');
	});

	it('does not assign a point to an affiliation deliberately lacking a verified institution reference', () => {
		const people = [
			person('alice', [
				{
					institution: 'Alpha University',
					years: [2024],
					confidence: 'verified',
					sources: [SOURCE],
					note: 'The campus could not be established from this source.'
				}
			])
		];
		const result = buildPublicationCollaborators(
			[publication('one', 2024, ['Alice Roe'])],
			people,
			campuses
		);
		expect(result.locations).toEqual([]);
		expect(result.unresolved[0]?.reason).toContain('The campus could not be established');
	});

	it('shows reader notes and never the curator review notes', () => {
		const people = [
			{
				...person('alice', [
					{ ...observation('alpha', [2024]), reviewNote: 'Curator trail: HTTP 403.' },
					{
						institution: 'Gamma Institute',
						years: [2024],
						confidence: 'verified' as const,
						sources: [SOURCE],
						reviewNote: 'Curator trail: no campus.'
					}
				]),
				reviewNote: 'Curator trail: identity checked.'
			},
			{
				...person('bob', []),
				note: 'Listed as an unaffiliated scholar.',
				reviewNote: 'Curator trail: programme.'
			}
		];
		const result = buildPublicationCollaborators(
			[publication('one', 2024, ['Alice Roe', 'Bob Bencherif'])],
			people,
			campuses
		);
		const shown = JSON.stringify(result);
		expect(shown).not.toContain('Curator trail');
		expect(result.unresolved.map((entry) => entry.reason)).toEqual([
			'Gamma Institute: no campus location recorded yet.',
			'No sourced affiliation for 2024. Listed as an unaffiliated scholar.'
		]);
	});

	it('returns an empty result for no records, no selected year, or owner-only credits', () => {
		const people = [person('alice', [observation('alpha', [2024])])];
		const expected = {
			locations: [],
			unresolved: [],
			totalPeople: 0,
			mappedPeople: 0,
			uncertainPeople: 0
		};
		expect(buildPublicationCollaborators([], people, campuses)).toEqual(expected);
		expect(
			buildPublicationCollaborators(
				[publication('one', 2024, ['Alice Roe'])],
				people,
				campuses,
				1900
			)
		).toEqual(expected);
		expect(
			buildPublicationCollaborators(
				[publication('solo', 2024, [OWNER, 'Frederick Madore'])],
				people,
				campuses
			)
		).toEqual(expected);
	});

	it('excludes the owner after resolving an alias or explicit person reference', () => {
		const owner: Person = {
			id: 'frederick-madore',
			name: OWNER,
			aliases: ['F. Madore'],
			affiliations: [observation('alpha', [2024])]
		};
		const result = buildPublicationCollaborators(
			[publication('solo', 2024, ['F. Madore', { name: 'F Madore', personId: owner.id }])],
			[owner],
			campuses
		);
		expect(result.totalPeople).toBe(0);
		expect(result.locations).toEqual([]);
		expect(result.unresolved).toEqual([]);
	});
});

describe('communication collaborators', () => {
	it('deduplicates paper authors, participants, and top-level authors by resolved person', () => {
		const people = [person('alice', [observation('alpha', [2024])], ['A. Roë'])];
		const event = communication({
			authors: [OWNER, 'Alice Roë'],
			papers: [
				{ title: 'First paper', authors: [{ name: OWNER }, { name: 'A Roe' }] },
				{ title: 'Second paper', authors: [{ name: 'Historical byline', personId: 'alice' }] }
			],
			participants: [{ name: 'Alice Roe', affiliation: 'Alpha University' }, { name: OWNER }]
		});
		const result = buildCommunicationCollaborators([event], people, campuses);
		expect(result.totalPeople).toBe(1);
		expect(result.locations[0]?.count).toBe(1);
		expect(result.locations[0]?.collaborators?.[0]?.items.map((item) => item.href)).toEqual([
			'/communications/conference'
		]);
	});

	it('uses an exact institution alias only as an explicitly enabled uncertain event affiliation', () => {
		const event = communication({
			participants: [{ name: 'New Person', affiliation: 'Universite Alpha' }]
		});
		const defaults = buildCommunicationCollaborators([event], [], campuses);
		expect(defaults.locations).toEqual([]);
		expect(defaults.uncertainPeople).toBe(1);
		const included = buildCommunicationCollaborators([event], [], campuses, undefined, true);
		expect(included.locations[0]?.id).toBe('alpha');
		expect(included.locations[0]?.collaborators?.[0]?.confidence).toBe('uncertain');
		expect(included.locations[0]?.coordinates).toEqual({ lat: 46.78, lng: -71.28 });
	});

	it('never substitutes the conference venue for an unknown institutional location', () => {
		const event = communication({
			participants: [{ name: 'New Person', affiliation: 'Unverified project location' }]
		});
		const result = buildCommunicationCollaborators([event], [], campuses, undefined, true);
		expect(result.locations).toEqual([]);
		expect(result.totalPeople).toBe(1);
		expect(result.mappedPeople).toBe(0);
		expect(result.unresolved[0]?.items[0]?.href).toBe('/communications/conference');
	});

	it('keeps a later participant affiliation when the same paper author has none', () => {
		const event = communication({
			papers: [{ title: 'Paper', authors: [{ name: 'New Person' }] }],
			participants: [{ name: 'New Person', affiliation: 'Alpha University' }]
		});
		const result = buildCommunicationCollaborators([event], [], campuses, undefined, true);
		expect(result.totalPeople).toBe(1);
		expect(result.mappedPeople).toBe(1);
		expect(result.locations[0]?.id).toBe('alpha');
		expect(result.unresolved).toEqual([]);
	});

	it('preserves distinct simultaneous event affiliations while deduplicating person counts', () => {
		const event = communication({
			papers: [
				{ title: 'Paper', authors: [{ name: 'New Person', affiliation: 'Alpha University' }] }
			],
			participants: [{ name: 'New Person', affiliation: 'Beta University' }]
		});
		const result = buildCommunicationCollaborators([event], [], campuses, undefined, true);
		expect(result.locations.map((location) => location.id).sort()).toEqual(['alpha', 'beta']);
		expect(result.mappedPeople).toBe(1);
		expect(result.uncertainPeople).toBe(1);
	});

	it('can show an uncertain event observation even when a registry stub has no affiliation evidence', () => {
		const event = communication({
			participants: [{ name: 'Alice Roe', affiliation: 'Alpha University' }]
		});
		const result = buildCommunicationCollaborators(
			[event],
			[person('alice', [])],
			campuses,
			undefined,
			true
		);
		expect(result.locations[0]?.id).toBe('alpha');
		expect(result.locations[0]?.collaborators?.[0]?.confidence).toBe('uncertain');
	});
});
