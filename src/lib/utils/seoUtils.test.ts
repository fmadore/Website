import { describe, it, expect } from 'vitest';
import {
	createPublicationSEODescription,
	createPublicationSEOKeywords,
	createCommunicationSEODescription,
	createCommunicationSEOKeywords,
	createActivitySEODescription,
	createActivitySEOKeywords,
	truncateTitle
} from './seoUtils';
import { author } from '$lib/data/siteConfig';
import type { Publication } from '$lib/types/publication';
import type { Communication } from '$lib/types/communication';
import type { Activity } from '$lib/types/activity';

// Minimal fixtures: cast through `unknown` (same style as jsonLdSchemas.test.ts)
// so tests can omit or blank out required fields the builders guard against.
const pub = (over: Record<string, unknown>): Publication =>
	({
		id: 'sample',
		type: 'article',
		title: 'Sample Title',
		year: 2021,
		...over
	}) as unknown as Publication;

const act = (over: Record<string, unknown>): Activity =>
	({
		id: 'sample',
		title: 'Sample Activity',
		date: '1 January 2024',
		dateISO: '2024-01-01',
		year: 2024,
		description: '',
		...over
	}) as unknown as Activity;

const comm = (over: Record<string, unknown>): Communication =>
	({
		id: 'sample',
		type: 'conference',
		title: 'Sample Talk',
		year: 2023,
		...over
	}) as unknown as Communication;

describe('createPublicationSEODescription', () => {
	it('front-loads "Label: Title" and appends the venue sentence when it fits', () => {
		const result = createPublicationSEODescription(
			pub({
				type: 'book',
				title: 'Islam and Politics',
				publisher: 'Brill',
				placeOfPublication: 'Leiden',
				year: 2021
			})
		);
		expect(result).toBe('Book: Islam and Politics Published in Brill, Leiden, 2021.');
	});

	it('uses the journal as venue for articles', () => {
		const result = createPublicationSEODescription(
			pub({ type: 'article', title: 'Salafism in Benin', journal: 'Islamic Africa', year: 2019 })
		);
		expect(result).toBe('Journal article: Salafism in Benin Published in Islamic Africa, 2019.');
	});

	it('uses the containing book as the venue for chapters', () => {
		const result = createPublicationSEODescription(
			pub({ type: 'chapter', title: 'A Chapter', book: 'An Edited Volume', year: 2020 })
		);
		expect(result).toBe('Book chapter: A Chapter Published in An Edited Volume, 2020.');
	});

	it('falls back to the compact venue when the lead is short but the full sentence overflows', () => {
		const title = 'Muslim Activism and the Politics of Belonging in Francophone West Africa';
		const journal = 'Journal of Religious Movements in Contemporary Francophone Africa';
		const lead = `Journal article: ${title}`;
		const sentence = ` Published in ${journal}, 2021.`;
		// Preconditions that select the compact branch:
		expect(lead.length).toBeLessThan(100);
		expect(lead.length + sentence.length).toBeGreaterThan(160);
		expect(lead.length + ` (${journal})`.length).toBeLessThanOrEqual(160);

		const result = createPublicationSEODescription(pub({ title, journal, year: 2021 }));
		expect(result).toBe(`${lead} (${journal})`);
	});

	it('drops the venue entirely when the lead is 100+ chars and the sentence overflows', () => {
		const title =
			'Religious Activism on University Campuses in Togo and Benin: A Longitudinal Study of Muslim and Christian Student Associations';
		const journal = 'Journal of Religious Movements in Contemporary Francophone Africa';
		const lead = `Journal article: ${title}`;
		expect(lead.length).toBeGreaterThanOrEqual(100);
		expect(lead.length + ` Published in ${journal}, 2021.`.length).toBeGreaterThan(160);

		const result = createPublicationSEODescription(pub({ title, journal, year: 2021 }));
		expect(result).toBe(lead);
	});

	it('fills remaining space with the abstract when the description is under 120 chars', () => {
		const result = createPublicationSEODescription(
			pub({
				type: 'book',
				title: 'Islam in Benin',
				publisher: 'Brill',
				year: 2021,
				abstract: 'Examines Muslim student activism on university campuses.'
			})
		);
		expect(result).toBe(
			'Book: Islam in Benin Published in Brill, 2021. Examines Muslim student activism on university campuses.'
		);
	});

	it('skips abstract previews of 20 chars or fewer', () => {
		const result = createPublicationSEODescription(
			pub({
				type: 'book',
				title: 'Islam in Benin',
				publisher: 'Brill',
				year: 2021,
				abstract: 'Too short.'
			})
		);
		expect(result).toBe('Book: Islam in Benin Published in Brill, 2021.');
	});

	it('caps the description at 160 chars via smart truncation', () => {
		const title =
			'An Extremely Long Publication Title That Keeps Going On and On About Muslim Politics, ' +
			'Media, and Public Religion in Francophone West Africa Since the Democratic Transitions of the Nineties';
		const result = createPublicationSEODescription(pub({ title }));
		expect(result.length).toBeLessThanOrEqual(160);
		expect(result.startsWith('Journal article: An Extremely Long Publication Title')).toBe(true);
	});

	it('uses the "Label by Author" fallback when the title is empty and nothing else fits', () => {
		const result = createPublicationSEODescription(
			pub({ title: '', year: undefined, authors: ['Jane Doe'] })
		);
		expect(result).toBe('Journal article by Jane Doe');
	});
});

describe('createCommunicationSEODescription', () => {
	it('front-loads "Label: Title" and appends conference, location, country and year', () => {
		const result = createCommunicationSEODescription(
			comm({
				title: 'Salafism on Campus',
				conference: 'ECAS 2023',
				location: 'Cologne',
				country: 'Germany',
				year: 2023
			})
		);
		expect(result).toBe(
			'Conference paper: Salafism on Campus Presented at ECAS 2023, Cologne, Germany, 2023.'
		);
	});

	it('skips the country when the location already contains it, and skips location equal to conference', () => {
		const withCountryInLocation = createCommunicationSEODescription(
			comm({
				title: 'Salafism on Campus',
				conference: 'ECAS 2023',
				location: 'Cologne, Germany',
				country: 'Germany',
				year: 2023
			})
		);
		expect(withCountryInLocation).toBe(
			'Conference paper: Salafism on Campus Presented at ECAS 2023, Cologne, Germany, 2023.'
		);

		const locationEqualsConference = createCommunicationSEODescription(
			comm({ title: 'A Talk', conference: 'RSA Panel', location: 'RSA Panel', year: 2020 })
		);
		expect(locationEqualsConference).toBe('Conference paper: A Talk Presented at RSA Panel, 2020.');
	});

	it('labels unknown types as "Academic presentation"', () => {
		const result = createCommunicationSEODescription(
			comm({ type: 'podcast', title: 'On Archives', year: 2022 })
		);
		expect(result).toBe('Academic presentation: On Archives Presented at 2022.');
	});

	it('falls back to the compact " at <conference>" when the full sentence overflows a short lead', () => {
		const title = 'Muslim Activism and the Politics of Belonging in Francophone West Africa';
		const conference = 'European Conference on African Studies and Digital Humanities';
		const lead = `Conference paper: ${title}`;
		const sentence = ` Presented at ${conference}, 2023.`;
		// Preconditions that select the compact branch:
		expect(lead.length).toBeLessThan(100);
		expect(lead.length + sentence.length).toBeGreaterThan(160);
		expect(lead.length + ` at ${conference}`.length).toBeLessThanOrEqual(160);

		const result = createCommunicationSEODescription(comm({ title, conference, year: 2023 }));
		expect(result).toBe(`${lead} at ${conference}`);
	});

	it('fills remaining space with the abstract when the description is under 120 chars', () => {
		const result = createCommunicationSEODescription(
			comm({
				title: 'On Archives',
				conference: 'ECAS 2023',
				year: 2023,
				abstract: 'A talk about digitised newspaper corpora in West Africa.'
			})
		);
		expect(result).toBe(
			'Conference paper: On Archives Presented at ECAS 2023, 2023. A talk about digitised newspaper corpora in West Africa.'
		);
	});

	it('uses the fallback string when the title is empty and there is no context', () => {
		const result = createCommunicationSEODescription(
			comm({
				title: '',
				type: undefined,
				conference: undefined,
				location: undefined,
				country: undefined,
				year: undefined,
				authors: ['Jane Doe']
			})
		);
		expect(result).toBe('Academic presentation by Jane Doe');
	});
});

describe('truncateTitle', () => {
	it('returns short titles unchanged', () => {
		expect(truncateTitle('Islam in Benin')).toBe('Islam in Benin');
	});

	it('breaks at a colon when one occurs before the limit', () => {
		expect(
			truncateTitle('Religious Activism: Muslim Students and State Politics in Togo and Benin')
		).toBe('Religious Activism...');
	});

	it('truncates at a word boundary when there is no colon', () => {
		expect(truncateTitle('The Politics of Islamic Associations in Contemporary Burkina Faso')).toBe(
			'The Politics of Islamic Associations in...'
		);
	});

	it('hard-truncates when no acceptable word boundary exists', () => {
		expect(truncateTitle('A'.repeat(60))).toBe('A'.repeat(47) + '...');
	});

	it('honours a custom maxLength', () => {
		expect(truncateTitle('one two three four', 10)).toBe('one two...');
	});
});

// The blocks below lock representative per-entity outputs so future refactors
// of the shared config-driven builders can be verified against exact strings.

describe('createActivitySEODescription', () => {
	it('uses a 50+ char description as-is and appends the type-specific CTA', () => {
		const description = 'A hands-on workshop on mapping Islamic associations in Benin.';
		const result = createActivitySEODescription(act({ type: 'workshop', description }));
		expect(result).toBe(`${description} Read insights →`);
	});

	it('synthesizes a publication-update lead when the description is too short', () => {
		const result = createActivitySEODescription(
			act({ type: 'publication', title: 'New Article Out', description: 'Short.' })
		);
		expect(result).toBe('Latest publication update (2024): New Article Out Read details →');
	});

	it('synthesizes a funding-news lead for grants', () => {
		const result = createActivitySEODescription(act({ type: 'grant' }));
		expect(result).toBe('Research funding news (2024): Sample Activity Discover details →');
	});

	it('uses the "<label> from <title>" form for conference-like types', () => {
		const result = createActivitySEODescription(act({ type: 'conference', title: 'ECAS 2025' }));
		expect(result).toBe('Conference insights from ECAS 2025 (2024) Read insights →');
	});

	it('falls back to "Academic update" for unknown types', () => {
		const result = createActivitySEODescription(act({ type: 'something-else' }));
		expect(result).toBe('Academic update (2024): Sample Activity Learn more →');
	});

	it('appends up to two subject-matter tags as "Topics:" when they fit', () => {
		const description = 'An extended report on recent fieldwork among Muslim student associations.';
		const result = createActivitySEODescription(
			act({ description, tags: ['Islam in Benin', 'West Africa press', 'Other topic'] })
		);
		expect(result).toBe(`${description} Topics: Islam in Benin, West Africa press. Learn more →`);
	});

	it('caps overlong descriptions at 160 chars via smart truncation', () => {
		const description =
			'A very long activity description that keeps going on about newspapers, archives, ' +
			'digitisation pipelines, computational text analysis, and the many collaborations ' +
			'that made the work possible across several West African countries.';
		const result = createActivitySEODescription(act({ description }));
		expect(result.length).toBeLessThanOrEqual(160);
		expect(result.startsWith('A very long activity description')).toBe(true);
	});
});

describe('SEO keyword builders', () => {
	it('builds communication keywords in source order, deduped, with static academic terms', () => {
		const result = createCommunicationSEOKeywords(
			comm({
				type: 'conference',
				tags: ['Salafism'],
				authors: ['Jane Doe'],
				country: 'Benin',
				language: ['English', 'French']
			})
		);
		expect(result).toBe(
			'conference, Salafism, Jane Doe, Benin, English, French, academic presentation, ' +
				`conference paper, Islam, West Africa, digital humanities, ${author.name}`
		);
	});

	it('builds publication keywords including venue and project terms', () => {
		const result = createPublicationSEOKeywords(
			pub({
				type: 'article',
				tags: ['Benin'],
				authors: ['Jane Doe'],
				language: 'English',
				journal: 'Islamic Africa',
				project: 'IWAC'
			})
		);
		expect(result).toBe(
			'article, Benin, Jane Doe, English, Islamic Africa, academic publication, ' +
				`journal article, Islam, West Africa, digital humanities, ${author.name}, IWAC`
		);
	});

	it('builds activity keywords from the type map and caps the list at 15', () => {
		const result = createActivitySEOKeywords(
			act({ type: 'conference', tags: ['IWAC'], year: 2025, content: '<p>Full post</p>' })
		);
		expect(result).toBe(
			'conference, academic conference, research presentation, IWAC, blog post, ' +
				`academic blog, research update, ${author.name}, digital humanities, Islam studies, ` +
				'West Africa research, academic researcher, 2025, analysis, insights'
		);
	});

	it('maps unknown activity types to the generic "academic activity" keyword', () => {
		const result = createActivitySEOKeywords(act({ type: 'other' }));
		expect(result.startsWith('academic activity, blog post, academic blog')).toBe(true);
	});
});
