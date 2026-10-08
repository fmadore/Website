/**
 * FAIR Signposting, level 1 (https://signposting.org/FAIR/), for a
 * publication's record page: typed `<link>` elements that tell a harvester or
 * an agent what the page is about without parsing it.
 *
 * - `type`: the work's schema.org type, then `AboutPage`, because the record
 *   page describes the work rather than being it.
 * - `author`: the site owner's ORCID, when he is credited. The spec asks for
 *   author identifiers only where they exist; co-authors' are not recorded.
 * - `related`: the DOI. Not `cite-as`: the spec forbids a `cite-as` link to "a
 *   persistent identifier that does not resolve to the landing page", and a
 *   DOI resolves to the publisher's landing page, not to this one. Identifiers
 *   associated with the work that resolve elsewhere take `related` instead.
 *
 * `license` is left out because no record carries a licence, and `describedby`
 * because there is no per-record metadata document for it to point at.
 */
import type { Publication } from '$lib/types';
import { author, socialLinks } from '$lib/data/siteConfig';
import { getContributorName } from '$lib/utils/contributor';

export interface Signpost {
	rel: 'type' | 'author' | 'related';
	href: string;
}

export function publicationSignposts(
	publication: Pick<Publication, 'authors' | 'doi'>,
	schemaType: string
): Signpost[] {
	const links: Signpost[] = [
		{ rel: 'type', href: `https://schema.org/${schemaType}` },
		{ rel: 'type', href: 'https://schema.org/AboutPage' }
	];
	if (publication.authors?.some((contributor) => getContributorName(contributor) === author.name)) {
		links.push({ rel: 'author', href: socialLinks.orcid.url });
	}
	if (publication.doi) {
		links.push({ rel: 'related', href: `https://doi.org/${publication.doi}` });
	}
	return links;
}
