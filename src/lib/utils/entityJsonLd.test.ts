import { describe, it, expect } from 'vitest';
import {
	buildPublicationJsonLd,
	buildCommunicationJsonLd,
	buildActivityJsonLd,
	buildDhProjectJsonLd
} from './entityJsonLd';
import type { Publication } from '$lib/types/publication';
import type { Communication } from '$lib/types/communication';
import type { Activity } from '$lib/types/activity';
import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';
import { website } from '$lib/data/siteConfig';

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
	it('keeps credited people and the site identity unchanged for linked author references', () => {
		const legacy = pub({ authors: ['Frédérick Madore', 'Jane Doe'] });
		const linked = pub({
			authors: [{ name: 'Frédérick Madore', personId: 'frederick-madore' }, 'Jane Doe']
		});
		expect(buildPublicationJsonLd(linked)).toEqual(buildPublicationJsonLd(legacy));
	});

	it('builds a Book with schema.org context, url and language', () => {
		const ld = buildPublicationJsonLd(pub({ type: 'book', publisher: 'Brill' }));
		expect(ld['@context']).toBe('https://schema.org');
		expect(ld['@type']).toBe('Book');
		expect(ld.url).toBe(`${website.url}/publications/pub-1`);
		expect(ld.inLanguage).toBe('English');
	});

	it('uses editor instead of author for an edited volume', () => {
		const ld = buildPublicationJsonLd(
			pub({ type: 'book', isEditedVolume: true, publisher: 'Brill' })
		) as unknown as Record<string, unknown>;
		expect(ld.editor).toBeDefined();
		expect(ld.author).toBeUndefined();
	});

	it('links the site owner while preserving co-authors', () => {
		const ld = buildPublicationJsonLd(
			pub({ authors: ['Jane Doe', 'Frédérick Madore', 'John Roe'] })
		);
		const authors = ld.author as Array<{ '@id'?: string; name: string; url?: string }>;
		expect(authors.map(({ name }) => name)).toEqual(['Jane Doe', 'Frédérick Madore', 'John Roe']);
		expect(authors[1]).toMatchObject({
			'@id': `${website.url}/#person`,
			url: website.url
		});
		expect(authors[0]!.url).toBeUndefined();
		expect(authors[2]!.url).toBeUndefined();
	});

	// Year- and month-dated records shipped `2017T00:00:00+01:00`, which is not a
	// date in any format.
	it.each(['2017', '2017-05', '2017-05-12'])(
		'publishes the date at the precision the data has (%s)',
		(dateISO) => {
			expect(buildPublicationJsonLd(pub({ dateISO })).datePublished).toBe(dateISO);
		}
	);

	it('drops a date it cannot publish as ISO 8601', () => {
		expect(buildPublicationJsonLd(pub({ dateISO: 'forthcoming' })).datePublished).toBeUndefined();
	});

	it('names itself and the page it is the main entity of', () => {
		const ld = buildPublicationJsonLd(pub({}));
		expect(ld['@id']).toBe(`${website.url}/publications/pub-1#record`);
		expect(ld.mainEntityOfPage).toEqual({ '@id': `${website.url}/publications/pub-1#webpage` });
	});

	it('resolves the cover to an absolute URL, whether or not the path leads with a slash', () => {
		expect(buildPublicationJsonLd(pub({ image: 'images/a.webp' })).image).toBe(
			`${website.url}/images/a.webp`
		);
		expect(buildPublicationJsonLd(pub({ image: '/images/a.webp' })).image).toBe(
			`${website.url}/images/a.webp`
		);
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
		const ld = buildCommunicationJsonLd(comm({}));
		expect(ld['@type']).toBe('Event');
		expect(ld.url).toBe(`${website.url}/communications/comm-1`);
		expect(ld.startDate).toBeTruthy();
	});

	it('composes a Place from location and country', () => {
		const ld = buildCommunicationJsonLd(comm({ location: 'Lomé', country: 'Togo' }));
		expect(ld.location).toMatchObject({ '@type': 'Place', name: 'Lomé, Togo' });
	});

	it('takes the first language when given an array', () => {
		const ld = buildCommunicationJsonLd(comm({ language: ['French', 'English'] }));
		expect(ld.inLanguage).toBe('French');
	});

	it('credits an organisation as an Organization, not a Person', () => {
		const ld = buildCommunicationJsonLd(
			comm({
				authors: [
					{ name: 'CIRAM', kind: 'organisation' },
					{ name: 'Frédérick Madore', personId: 'frederick-madore' }
				]
			})
		);
		expect(ld.performer?.[0]).toEqual({ '@type': 'Organization', name: 'CIRAM' });
		expect(ld.performer?.[1]).toMatchObject({ '@type': 'Person', '@id': `${website.url}/#person` });
	});

	it('features a poster as the PDF it ships, and only when there is one', () => {
		expect(buildCommunicationJsonLd(comm({})).workFeatured).toBeUndefined();

		const ld = buildCommunicationJsonLd(
			comm({
				type: 'poster',
				poster: {
					pdf: 'files/comm-1-poster.pdf',
					image: 'images/communications/comm-1-poster.webp',
					alt: 'The poster.'
				}
			})
		);
		expect(ld.workFeatured).toEqual({
			'@type': 'DigitalDocument',
			name: 'A Talk',
			genre: 'Poster',
			encodingFormat: 'application/pdf',
			url: `${website.url}/files/comm-1-poster.pdf`,
			thumbnailUrl: `${website.url}/images/communications/comm-1-poster.webp`
		});
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
		const ld = buildActivityJsonLd(activity);
		expect(ld['@type']).toBe('BlogPosting');
		expect(ld.headline).toBe('An Activity');
		expect((ld.author as { jobTitle?: string }).jobTitle).toBeTruthy();
	});

	it('carries its own address and the page it is the main entity of', () => {
		const ld = buildActivityJsonLd({
			id: 'act-1',
			title: 'An Activity',
			dateISO: '2024-02-02',
			heroImage: { src: 'images/activities/a.webp', alt: '' }
		} as Activity);
		expect(ld.url).toBe(`${website.url}/activities/act-1`);
		expect(ld.mainEntityOfPage).toEqual({ '@id': `${website.url}/activities/act-1#webpage` });
		expect(ld.datePublished).toBe('2024-02-02');
		expect(ld.image).toBe(`${website.url}/images/activities/a.webp`);
	});
});

describe('buildDhProjectJsonLd', () => {
	const project = (over: Partial<DigitalHumanitiesProject>) =>
		({
			id: 'proj-1',
			title: 'A Project',
			shortDescription: 'Desc',
			imageUrl: '/images/digital-humanities/proj-1.webp',
			...over
		}) as DigitalHumanitiesProject;

	// The DH records store their images with a leading slash, which the old
	// `${base}/${path}` turned into a protocol-relative `//images/…`.
	it('resolves a slash-led image path without doubling the slash', () => {
		expect(buildDhProjectJsonLd(project({})).image).toBe(
			`${website.url}/images/digital-humanities/proj-1.webp`
		);
	});

	it('keeps an external project site as its url, and this page as its page', () => {
		const ld = buildDhProjectJsonLd(project({ linkUrl: 'https://example.org/' }));
		expect(ld['@type']).toBe('WebSite');
		expect(ld.url).toBe('https://example.org/');
		expect(ld.mainEntityOfPage).toEqual({
			'@id': `${website.url}/digital-humanities/proj-1#webpage`
		});
	});
});
