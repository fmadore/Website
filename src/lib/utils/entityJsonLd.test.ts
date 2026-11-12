import { describe, it, expect } from 'vitest';
import {
	buildPublicationJsonLd,
	buildCommunicationJsonLd,
	buildActivityJsonLd,
	buildDhProjectJsonLd,
	resolvePublicationJsonLdType,
	type PublicationDirectoryType
} from './entityJsonLd';
import { publicationsByDate } from '#lib/data/publications/index.ts';
import { PUBLICATION_DIRECTORY_TYPES } from '#lib/dataMetadata.ts';
import type { Publication } from '#lib/types/publication.ts';
import type { Communication } from '#lib/types/communication.ts';
import type { Activity } from '#lib/types/activity.ts';
import type { DigitalHumanitiesProject } from '#lib/types/digitalHumanities.ts';
import { website } from '#lib/data/siteConfig.ts';

const pub = (
	over: Partial<Publication & { sourceDirType: string }>
): Publication & { sourceDirType: string } =>
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
		expect(ld.inLanguage).toBe('en');
	});

	it('publishes the language as BCP 47, an array for a bilingual work', () => {
		expect(buildPublicationJsonLd(pub({ language: 'French' })).inLanguage).toBe('fr');
		expect(buildPublicationJsonLd(pub({ language: 'English, French' })).inLanguage).toEqual([
			'en',
			'fr'
		]);
	});

	it('names the work elsewhere in sameAs: DOI, Wikidata, OpenAlex', () => {
		expect(buildPublicationJsonLd(pub({})).sameAs).toBeUndefined();
		const ld = buildPublicationJsonLd(
			pub({ doi: '10.1000/x', wikidataId: 'Q42', openAlexId: 'W123' })
		);
		expect(ld.sameAs).toEqual([
			'https://doi.org/10.1000/x',
			'https://www.wikidata.org/entity/Q42',
			'https://openalex.org/W123'
		]);
	});

	it('types a bulletin note as an Article in its bulletin issue, with its pages', () => {
		const ld = buildPublicationJsonLd(
			pub({
				type: 'bulletin-article',
				sourceDirType: 'bulletins',
				journal: 'ZMO Bulletin',
				issue: '44',
				pages: '9',
				pageCount: 1
			})
		) as unknown as Record<string, unknown>;
		expect(ld['@type']).toBe('Article');
		expect(ld.isPartOf).toEqual({
			'@type': 'PublicationIssue',
			name: 'ZMO Bulletin',
			volumeNumber: undefined,
			issueNumber: '44'
		});
		expect(ld.pagination).toBe('9');
		expect(ld.numberOfPages).toBeUndefined();
	});

	it('types a proceedings paper as a ScholarlyArticle in its proceedings volume', () => {
		const ld = buildPublicationJsonLd(
			pub({
				type: 'conference-proceedings',
				sourceDirType: 'proceedings',
				proceedingsTitle: 'Proceedings of JCDL',
				conferenceName: 'JCDL ’26',
				pages: '1-12'
			})
		) as unknown as Record<string, unknown>;
		expect(ld['@type']).toBe('ScholarlyArticle');
		expect(ld.isPartOf).toEqual({ '@type': 'Book', name: 'Proceedings of JCDL' });
		expect(ld.pagination).toBe('1-12');

		const byConference = buildPublicationJsonLd(
			pub({ sourceDirType: 'proceedings', conferenceName: 'JCDL ’26' })
		) as unknown as Record<string, unknown>;
		expect(byConference.isPartOf).toEqual({ '@type': 'Book', name: 'JCDL ’26' });
	});

	it('refuses a directory it has no type for rather than calling it a Book', () => {
		expect(() => buildPublicationJsonLd(pub({ sourceDirType: 'unknown' }))).toThrow(/unknown/);
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

describe('resolvePublicationJsonLdType', () => {
	it('knows exactly the directories the data loader names', () => {
		const known: Record<PublicationDirectoryType, true> = {
			books: true,
			articles: true,
			bulletins: true,
			chapters: true,
			specialIssues: true,
			reports: true,
			encyclopedia: true,
			blogposts: true,
			dissertations: true,
			proceedings: true,
			workingPapers: true
		};
		expect(Object.values(PUBLICATION_DIRECTORY_TYPES).sort()).toEqual(Object.keys(known).sort());
	});

	// The dataset is the oracle: nine records once fell through to `Book`.
	it('types no record that is not a book as a Book', () => {
		expect(publicationsByDate.length).toBeGreaterThan(40);
		const mistyped = publicationsByDate
			.filter((publication) => publication.type !== 'book')
			.filter((publication) => resolvePublicationJsonLdType(publication) === 'Book')
			.map((publication) => publication.id);
		expect(mistyped).toEqual([]);
	});

	it('gives every paged, contained record its container and pages', () => {
		for (const publication of publicationsByDate) {
			if (!['bulletins', 'proceedings'].includes(publication.sourceDirType)) continue;
			const ld = buildPublicationJsonLd(publication) as unknown as Record<string, unknown>;
			expect(ld.isPartOf, publication.id).toBeDefined();
			if (publication.pages) expect(ld.pagination, publication.id).toBe(publication.pages);
		}
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

	it('composes a Place from location and country, with its country and coordinates', () => {
		const ld = buildCommunicationJsonLd(
			comm({
				location: 'Lomé',
				country: 'Togo',
				coordinates: { latitude: 6.13, longitude: 1.22 }
			})
		);
		expect(ld.location).toEqual({
			'@type': 'Place',
			name: 'Lomé, Togo',
			address: { '@type': 'PostalAddress', addressCountry: 'Togo' },
			geo: { '@type': 'GeoCoordinates', latitude: 6.13, longitude: 1.22 }
		});
	});

	it('places the talk in its conference as superEvent, not as organizer', () => {
		const ld = buildCommunicationJsonLd(comm({ conference: 'ECAS 2025' }));
		expect(ld.superEvent).toEqual({ '@type': 'Event', name: 'ECAS 2025' });
		expect(ld.organizer).toBeUndefined();
	});

	it('publishes its language as BCP 47, every language of a bilingual talk', () => {
		expect(buildCommunicationJsonLd(comm({ language: 'French' })).inLanguage).toBe('fr');
		const ld = buildCommunicationJsonLd(comm({ language: ['French', 'English'] }));
		expect(ld.inLanguage).toEqual(['fr', 'en']);
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

	it('models an application as a SoftwareApplication, installed from its first install link', () => {
		const ld = buildDhProjectJsonLd(
			project({
				application: { status: 'released', operatingSystem: 'Windows 11', licence: 'MIT' },
				links: [
					{ url: 'https://github.com/x/y', type: 'code' },
					{ url: 'https://apps.microsoft.com/detail/X', type: 'install' },
					{ url: 'https://github.com/x/y/releases', type: 'install' }
				]
			})
		);
		expect(ld['@type']).toBe('SoftwareApplication');
		expect(ld.url).toBe(`${website.url}/digital-humanities/proj-1`);
		expect(ld.operatingSystem).toBe('Windows 11');
		expect(ld.applicationCategory).toBe('DesktopApplication');
		expect(ld.installUrl).toBe('https://apps.microsoft.com/detail/X');
		expect(ld.license).toBe('https://spdx.org/licenses/MIT.html');
	});
});
