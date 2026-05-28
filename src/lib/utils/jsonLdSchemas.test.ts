import { describe, it, expect } from 'vitest';
import {
	buildPublicationJsonLd,
	buildCommunicationJsonLd,
	buildDhProjectJsonLd
} from './jsonLdSchemas';
import { website } from '$lib/data/siteConfig';
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
		expect(author[0]).toMatchObject({ name: 'Frédérick Madore', url: website.url });
		expect(author[1].url).toBeUndefined();
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
		expect(book.citation?.[0]['@type']).toBe('ScholarlyArticle');
		expect(book.citation?.[0].isPartOf?.name).toBe('JRA');
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
		expect(performer[0].url).toBe(website.url);
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
