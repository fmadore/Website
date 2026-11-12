import { describe, expect, it } from 'vitest';
import { author, socialLinks, website } from '#lib/data/siteConfig.ts';
import { publicationBibtexPath, publicationSignposts } from './signposting';
import { buildPublicationJsonLd, resolvePublicationJsonLdType } from './entityJsonLd';
import { publicationsByDate } from '#lib/data/publications/index.ts';

describe('publicationSignposts', () => {
	it('types the page as an AboutPage for a work, described by its BibTeX', () => {
		expect(publicationSignposts({ id: 'x', authors: ['Jane Doe'] }, 'ScholarlyArticle')).toEqual([
			{ rel: 'type', href: 'https://schema.org/ScholarlyArticle' },
			{ rel: 'type', href: 'https://schema.org/AboutPage' },
			{
				rel: 'describedby',
				href: `${website.url}/publications/x.bib`,
				type: 'application/x-bibtex'
			}
		]);
	});

	it('ships the BibTeX beside the page, as the [id].bib route does', () => {
		expect(publicationBibtexPath('x')).toBe('/publications/x.bib');
	});

	it("links the site owner's ORCID when he is credited, by string or by reference", () => {
		const orcid = { rel: 'author', href: socialLinks.orcid.url };
		expect(
			publicationSignposts({ id: 'x', authors: ['Jane Doe', author.name] }, 'Book')
		).toContainEqual(orcid);
		expect(
			publicationSignposts({ id: 'x', authors: [{ name: author.name, personId: 'x' }] }, 'Book')
		).toContainEqual(orcid);
		expect(publicationSignposts({ id: 'x', authors: ['Jane Doe'] }, 'Book')).not.toContainEqual(
			orcid
		);
	});

	it('points at the DOI as related, never as cite-as', () => {
		const links = publicationSignposts({ id: 'x', authors: [], doi: '10.1163/x' }, 'Article');
		expect(links).toContainEqual({ rel: 'related', href: 'https://doi.org/10.1163/x' });
		expect(links.map(({ rel }) => rel)).not.toContain('cite-as');
	});
});

// The route passes `resolvePublicationJsonLdType` as the schema type, so the
// `type` link and the JSON-LD node can never disagree — and the bulletin notes
// and proceedings papers that once linked https://schema.org/Book do not.
describe('the Signposting type of every record', () => {
	it('is the @type of its JSON-LD node, and Book only for a book', () => {
		for (const publication of publicationsByDate) {
			const type = resolvePublicationJsonLdType(publication);
			expect(buildPublicationJsonLd(publication)['@type'], publication.id).toBe(type);
			const [typeLink] = publicationSignposts(publication, type);
			expect(typeLink!.href, publication.id).toBe(`https://schema.org/${type}`);
			if (publication.type !== 'book') expect(type, publication.id).not.toBe('Book');
		}
	});
});
