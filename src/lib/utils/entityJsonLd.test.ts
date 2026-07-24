import { describe, it, expect } from 'vitest';
import {
	buildPublicationJsonLd,
	buildCommunicationJsonLd,
	buildActivityJsonLd
} from './entityJsonLd';
import type { Publication } from '$lib/types/publication';
import type { Communication } from '$lib/types/communication';
import type { Activity } from '$lib/types/activity';

const BASE = 'https://example.com';

const pub = (over: Partial<Publication>): Publication & { sourceDirType: string } =>
	({
		id: 'pub-1',
		type: 'book',
		title: 'A Book',
		authors: ['Frédérick Madore'],
		date: '2024',
		dateISO: '2024-05-01',
		year: 2024,
		language: 'English',
		sourceDirType: 'books',
		...over
	}) as Publication & { sourceDirType: string };

describe('buildPublicationJsonLd', () => {
	it('builds a Book with schema.org context, url and language', () => {
		const ld = buildPublicationJsonLd(pub({ type: 'book', publisher: 'Brill' }), BASE);
		expect(ld['@context']).toBe('https://schema.org');
		expect(ld['@type']).toBe('Book');
		expect(ld.url).toBe(`${BASE}/publications/pub-1`);
		expect(ld.inLanguage).toBe('English');
	});

	it('uses editor instead of author for an edited volume', () => {
		const ld = buildPublicationJsonLd(
			pub({ type: 'book', isEditedVolume: true, publisher: 'Brill' }),
			BASE
		) as unknown as Record<string, unknown>;
		expect(ld.editor).toBeDefined();
		expect(ld.author).toBeUndefined();
	});

	it('attaches the site URL to the primary author', () => {
		const ld = buildPublicationJsonLd(pub({ authors: ['Frédérick Madore', 'Jane Doe'] }), BASE);
		const authors = ld.author as Array<{ name: string; url?: string }>;
		expect(authors[0]!.url).toBeTruthy();
		expect(authors[1]!.url).toBeUndefined();
	});
});

describe('buildCommunicationJsonLd', () => {
	const comm = (over: Partial<Communication>): Communication =>
		({
			id: 'comm-1',
			type: 'conference',
			title: 'A Talk',
			authors: ['Frédérick Madore'],
			date: '2024',
			dateISO: '2024-03-15',
			year: 2024,
			...over
		}) as Communication;

	it('builds an Event with a start date and url', () => {
		const ld = buildCommunicationJsonLd(comm({}), BASE);
		expect(ld['@type']).toBe('Event');
		expect(ld.url).toBe(`${BASE}/communications/comm-1`);
		expect(ld.startDate).toBeTruthy();
	});

	it('composes a Place from location and country', () => {
		const ld = buildCommunicationJsonLd(comm({ location: 'Lomé', country: 'Togo' }), BASE);
		expect(ld.location).toMatchObject({ '@type': 'Place', name: 'Lomé, Togo' });
	});

	it('takes the first language when given an array', () => {
		const ld = buildCommunicationJsonLd(comm({ language: ['French', 'English'] }), BASE);
		expect(ld.inLanguage).toBe('French');
	});
});

describe('buildActivityJsonLd', () => {
	it('builds a BlogPosting authored by the site owner', () => {
		const activity = {
			id: 'act-1',
			title: 'An Activity',
			dateISO: '2024-02-02',
			date: '2 February 2024',
			year: 2024,
			description: 'Desc'
		} as Activity;
		const ld = buildActivityJsonLd(activity, BASE);
		expect(ld['@type']).toBe('BlogPosting');
		expect(ld.headline).toBe('An Activity');
		expect((ld.author as { jobTitle?: string }).jobTitle).toBeTruthy();
	});
});
