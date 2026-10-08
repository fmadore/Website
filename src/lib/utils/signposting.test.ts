import { describe, expect, it } from 'vitest';
import { author, socialLinks } from '$lib/data/siteConfig';
import { publicationSignposts } from './signposting';

describe('publicationSignposts', () => {
	it('types the page as an AboutPage for a work of the given schema.org type', () => {
		expect(publicationSignposts({ authors: ['Jane Doe'] }, 'ScholarlyArticle')).toEqual([
			{ rel: 'type', href: 'https://schema.org/ScholarlyArticle' },
			{ rel: 'type', href: 'https://schema.org/AboutPage' }
		]);
	});

	it("links the site owner's ORCID when he is credited, by string or by reference", () => {
		const orcid = { rel: 'author', href: socialLinks.orcid.url };
		expect(publicationSignposts({ authors: ['Jane Doe', author.name] }, 'Book')).toContainEqual(
			orcid
		);
		expect(
			publicationSignposts({ authors: [{ name: author.name, personId: 'x' }] }, 'Book')
		).toContainEqual(orcid);
		expect(publicationSignposts({ authors: ['Jane Doe'] }, 'Book')).not.toContainEqual(orcid);
	});

	it('points at the DOI as related, never as cite-as', () => {
		const links = publicationSignposts({ authors: [], doi: '10.1163/x' }, 'Article');
		expect(links).toContainEqual({ rel: 'related', href: 'https://doi.org/10.1163/x' });
		expect(links.map(({ rel }) => rel)).not.toContain('cite-as');
	});
});
