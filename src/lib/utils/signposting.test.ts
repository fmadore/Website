import { describe, expect, it } from 'vitest';
import { author, socialLinks, website } from '$lib/data/siteConfig';
import { publicationBibtexPath, publicationSignposts } from './signposting';

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
