import { describe, it, expect } from 'vitest';
import {
	buildPublicationJsonLd,
	buildCommunicationJsonLd,
	buildDhProjectJsonLd
} from './entityJsonLd';
import { createPersonSchema, createFullPersonSchema, createWebPageSchema } from './jsonLdSchemas';
import {
	website,
	contact,
	author,
	researchTopics,
	linkedData,
	profile
} from '$lib/data/siteConfig';
import { allAffiliations } from '$lib/data/affiliations';
import { maHistUlaval } from '$lib/data/education/ma-hist-ulaval';
import type { Publication } from '$lib/types/publication';
import type { Communication } from '$lib/types/communication';
import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

// Minimal fixtures: cast through `unknown` so tests stay focused on the fields
// the builders actually read, without reconstructing the full content types.
type PubInput = Publication & { sourceDirType: string };
const pub = (over: Partial<PubInput>): PubInput =>
	({
		id: 'sample',
		title: 'Sample Title',
		year: 2022,
		...over
	}) as unknown as PubInput;

describe('buildPublicationJsonLd', () => {
	it('resolves @type from sourceDirType and prefixes urls with base', () => {
		const result = buildPublicationJsonLd(pub({ sourceDirType: 'books' }), '/base');
		expect(result['@type']).toBe('Book');
		expect(result['@context']).toBe('https://schema.org');
		expect(result.url).toBe('/base/publications/sample');
	});

	it('treats bulletin-articles as Article but other articles as ScholarlyArticle', () => {
		expect(
			buildPublicationJsonLd(pub({ sourceDirType: 'articles', type: 'bulletin-article' }))['@type']
		).toBe('Article');
		expect(
			buildPublicationJsonLd(pub({ sourceDirType: 'articles', type: 'article' }))['@type']
		).toBe('ScholarlyArticle');
	});

	it('links Frédérick to the canonical Person node while preserving every co-author', () => {
		const result = buildPublicationJsonLd(
			pub({
				sourceDirType: 'articles',
				type: 'article',
				authors: ['Jane Doe', 'Frédérick Madore', 'John Roe']
			})
		);
		const authors = result.author as Array<{ '@id'?: string; name: string; url?: string }>;
		expect(authors.map(({ name }) => name)).toEqual(['Jane Doe', 'Frédérick Madore', 'John Roe']);
		expect(authors[1]!).toMatchObject({
			'@id': `${website.url}/#person`,
			name: 'Frédérick Madore',
			url: website.url
		});
		expect(authors[0]!.url).toBeUndefined();
		expect(authors[2]!.url).toBeUndefined();
	});

	it('uses every editor (not author) for edited volumes and maps book reviews to citations', () => {
		const result = buildPublicationJsonLd(
			pub({
				sourceDirType: 'books',
				isEditedVolume: true,
				authors: ['Jane Doe', 'Frédérick Madore'],
				reviewedBy: [{ title: 'A Review', author: 'Critic', year: 2023, journal: 'JRA' }]
			})
		);
		const book = result as {
			author?: unknown;
			editor?: Array<{ '@id'?: string; name: string }>;
			citation?: Array<{ '@type': string; isPartOf?: { name: string } }>;
		};
		expect(book.author).toBeUndefined();
		expect(book.editor?.map(({ name }) => name)).toEqual(['Jane Doe', 'Frédérick Madore']);
		expect(book.editor?.[1]?.['@id']).toBe(`${website.url}/#person`);
		expect(book.citation?.[0]!['@type']).toBe('ScholarlyArticle');
		expect(book.citation?.[0]!.isPartOf?.name).toBe('JRA');
	});

	it('models chapter container editors as separate people and links the site owner', () => {
		const result = buildPublicationJsonLd(
			pub({
				sourceDirType: 'chapters',
				type: 'chapter',
				authors: ['Chapter Author'],
				book: 'Collected Work',
				editors: 'Jane Doe, Frédérick Madore and John Roe'
			})
		);
		const editors = (result as { isPartOf?: { editor?: Array<{ '@id'?: string; name: string }> } })
			.isPartOf?.editor;
		expect(editors?.map(({ name }) => name)).toEqual(['Jane Doe', 'Frédérick Madore', 'John Roe']);
		expect(editors?.[1]?.['@id']).toBe(`${website.url}/#person`);
	});

	it('models special-issue contributors as editors', () => {
		const result = buildPublicationJsonLd(
			pub({
				sourceDirType: 'specialIssues',
				type: 'special-issue',
				isEditedWork: true,
				authors: ['Frédérick Madore', 'Jane Doe']
			})
		) as { author?: unknown; editor?: Array<{ name: string }> };
		expect(result.author).toBeUndefined();
		expect(result.editor?.map(({ name }) => name)).toEqual(['Frédérick Madore', 'Jane Doe']);
	});

	it('serialises deterministically (stable property order)', () => {
		const input = pub({ sourceDirType: 'reports', publisher: 'IFRA', tags: ['islam', 'benin'] });
		expect(JSON.stringify(buildPublicationJsonLd(input))).toEqual(
			JSON.stringify(buildPublicationJsonLd(input))
		);
	});
});

describe('buildCommunicationJsonLd', () => {
	const comm = (over: Partial<Communication>): Communication =>
		({ id: 'talk', title: 'A Talk', year: 2024, ...over }) as unknown as Communication;

	it('models a talk as an Event with base-prefixed url', () => {
		const result = buildCommunicationJsonLd(comm({}), '/b');
		expect(result['@type']).toBe('Event');
		expect(result.url).toBe('/b/communications/talk');
	});

	it('builds a Place and links the presenter to the canonical Person node', () => {
		const result = buildCommunicationJsonLd(
			comm({ location: 'Lomé', country: 'Togo', authors: ['Frédérick Madore'] })
		);
		expect(result.location).toMatchObject({ '@type': 'Place', name: 'Lomé, Togo' });
		const performer = result.performer as Array<{ '@id'?: string; name: string; url?: string }>;
		expect(performer[0]).toMatchObject({
			'@id': `${website.url}/#person`,
			url: website.url
		});
	});

	it('picks the first language from an array', () => {
		const result = buildCommunicationJsonLd(comm({ language: ['French', 'English'] as never }));
		expect(result.inLanguage).toBe('French');
	});
});

describe('buildDhProjectJsonLd', () => {
	const project = (over: Partial<DigitalHumanitiesProject>): DigitalHumanitiesProject =>
		({
			id: 'iwac',
			title: 'IWAC',
			shortDescription: 'desc',
			...over
		}) as unknown as DigitalHumanitiesProject;

	it('uses WebSite + external link when linkUrl is present', () => {
		const result = buildDhProjectJsonLd(project({ linkUrl: 'https://example.org' }));
		expect(result['@type']).toBe('WebSite');
		expect(result.url).toBe('https://example.org');
	});

	it('falls back to CreativeWork + internal url and skills as keywords', () => {
		const result = buildDhProjectJsonLd(project({ skills: ['Python', 'NLP'] }), '/b');
		expect(result['@type']).toBe('CreativeWork');
		expect(result.url).toBe('/b/digital-humanities/iwac');
		expect(result.keywords).toBe('Python, NLP');
	});
});

describe('createFullPersonSchema', () => {
	const full = createFullPersonSchema();
	const base = createPersonSchema();

	it('shares the layout Person @id and core identity (one merged Person node)', () => {
		expect(full['@id']).toBe(base['@id']);
		expect(full['@id']).toBe(`${website.url}/#person`);
		expect(full.name).toBe(base.name);
		expect(full.jobTitle).toBe(base.jobTitle);
		expect(full.worksFor).toEqual(base.worksFor);
		expect(full.sameAs).toEqual(base.sameAs);
	});

	it('describes the current role and durable linked-data identities', () => {
		expect(full.description).toBe(author.tagline);
		expect(full.jobTitle).toBe('Data Curator');
		expect(full.hasOccupation).toEqual([
			{
				'@type': 'Occupation',
				'@id': `https://www.wikidata.org/entity/${linkedData.occupations[0].wikidataId}`,
				name: 'Historian'
			},
			{
				'@type': 'Occupation',
				'@id': `https://www.wikidata.org/entity/${linkedData.occupations[1].wikidataId}`,
				name: 'Digital Humanist'
			}
		]);
		expect(full.worksFor).toMatchObject({
			'@type': 'EducationalOrganization',
			'@id': `https://www.wikidata.org/entity/${linkedData.employer.wikidataId}`,
			name: linkedData.employer.name
		});
	});

	it('uses an absolute image URL identical to the base schema (no conflicting values)', () => {
		expect(full.image).toBe(base.image);
		expect(full.image).toMatch(/^https:\/\//);
	});

	it('derives alumniOf from degree-granting institutions in the education data', () => {
		expect(full.alumniOf).toEqual([
			{
				'@type': 'EducationalOrganization',
				name: 'Université Laval',
				url: 'https://www.ulaval.ca/en'
			}
		]);
	});

	it('derives hasCredential from education degrees with mapped levels', () => {
		expect(full.hasCredential).toContainEqual({
			'@type': 'EducationalOccupationalCredential',
			credentialCategory: 'degree',
			educationalLevel: 'Doctorate',
			name: 'Ph.D. in History'
		});
		// Degrees only — training and certificates are not credentials here
		expect(full.hasCredential?.every((c) => c.credentialCategory === 'degree')).toBe(true);
		expect(full.hasCredential?.length).toBe(3);
	});

	it('derives memberOf from ongoing affiliations only', () => {
		const names = full.memberOf?.map((org) => org.name) ?? [];
		expect(names).toContain('Islam in Africa Studies Group (IASG)');
		const ongoing = allAffiliations.filter((a) => a.period.end === null);
		expect(full.memberOf?.length).toBe(ongoing.length);
		// Ended memberships (period.end set) must not appear
		expect(names.some((n) => n.includes('Mande Studies Association'))).toBe(false);
		const iasg = full.memberOf?.find((org) => org.name.includes('IASG'));
		expect(iasg?.url).toBe('https://iasg.hcommons.org/');
	});

	it('derives knowsLanguage from the languages data in proficiency order', () => {
		expect(full.knowsLanguage).toEqual(['French', 'English', 'German']);
	});

	it('sources editorial fields from siteConfig', () => {
		expect(full.email).toBe(contact.email);
		expect(full.nationality).toEqual({
			'@type': 'Country',
			'@id': `https://www.wikidata.org/entity/${linkedData.nationality.wikidataId}`,
			name: author.nationality
		});
		expect(full.knowsAbout).toEqual(researchTopics);
		expect(full.knowsAbout).toContain('Islam');
		expect(full.knowsAbout).toContain('Digital Humanities');
	});
});

describe('profile data', () => {
	it('publishes the human-edited modification date on the ProfilePage', () => {
		const page = createWebPageSchema({
			name: author.name,
			path: '/',
			type: 'ProfilePage',
			dateModified: profile.dateModified
		});
		// Google's Profile page report validates this as a DateTime and rejects a
		// bare date, so the plain editorial value is widened on the way out.
		expect(page.dateModified).toBe(`${profile.dateModified}T00:00:00Z`);
		expect(page.mainEntity?.['@id']).toBe(`${website.url}/#person`);
	});

	it('leaves an already-timestamped date alone', () => {
		const page = createWebPageSchema({
			name: author.name,
			path: '/',
			type: 'ProfilePage',
			datePublished: '2026-08-12T09:30:00+02:00',
			dateModified: '2026-08-12T09:30:00+02:00'
		});
		expect(page.datePublished).toBe('2026-08-12T09:30:00+02:00');
		expect(page.dateModified).toBe('2026-08-12T09:30:00+02:00');
	});

	it('records the verified M.A. completion date', () => {
		expect(maHistUlaval.dateISO).toBe('2013-03-31');
	});
});
