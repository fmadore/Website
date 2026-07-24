import { describe, it, expect } from 'vitest';
import {
	buildPublicationJsonLd,
	buildCommunicationJsonLd,
	buildDhProjectJsonLd
} from './entityJsonLd';
import { createPersonSchema, createFullPersonSchema } from './jsonLdSchemas';
import { website, contact, author, researchTopics } from '$lib/data/siteConfig';
import { allAffiliations } from '$lib/data/affiliations';
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

	it('attaches the canonical site URL to Frédérick Madore as author', () => {
		const result = buildPublicationJsonLd(
			pub({ sourceDirType: 'articles', type: 'article', authors: ['Frédérick Madore', 'Jane Doe'] })
		);
		const author = result.author as Array<{ name: string; url?: string }>;
		expect(author[0]!).toMatchObject({ name: 'Frédérick Madore', url: website.url });
		expect(author[1]!.url).toBeUndefined();
	});

	it('uses editor (not author) for edited volumes and maps book reviews to citations', () => {
		const result = buildPublicationJsonLd(
			pub({
				sourceDirType: 'books',
				isEditedVolume: true,
				authors: ['Jane Doe'],
				reviewedBy: [{ title: 'A Review', author: 'Critic', year: 2023, journal: 'JRA' }]
			})
		);
		const book = result as {
			author?: unknown;
			editor?: unknown;
			citation?: Array<{ '@type': string; isPartOf?: { name: string } }>;
		};
		expect(book.author).toBeUndefined();
		expect(book.editor).toBeDefined();
		expect(book.citation?.[0]!['@type']).toBe('ScholarlyArticle');
		expect(book.citation?.[0]!.isPartOf?.name).toBe('JRA');
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

	it('builds a Place from location + country and attaches presenter url', () => {
		const result = buildCommunicationJsonLd(
			comm({ location: 'Lomé', country: 'Togo', authors: ['Frédérick Madore'] })
		);
		expect(result.location).toMatchObject({ '@type': 'Place', name: 'Lomé, Togo' });
		const performer = result.performer as Array<{ name: string; url?: string }>;
		expect(performer[0]!.url).toBe(website.url);
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
		expect(full.nationality).toBe(author.nationality);
		expect(full.knowsAbout).toEqual(researchTopics);
		expect(full.knowsAbout).toContain('Islam');
		expect(full.knowsAbout).toContain('Digital Humanities');
	});
});
