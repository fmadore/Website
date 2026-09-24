/**
 * The home page's full Person schema.
 *
 * Server-only on purpose. It is the one schema built from datasets
 * (`education`, `languages`, `affiliations`), and it lived beside the
 * generic factories in `$lib/utils/jsonLdSchemas.ts` — which `SEO.svelte`
 * imports on every page. Those three datasets, their loader and its validation
 * therefore rode in the root layout's chunk and ran on every page load, for
 * a schema only the home page prints and only the prerender ever computes.
 * Kept under `$lib/server`, SvelteKit refuses any client import of it, and
 * `scripts/check-bundle-budget.mjs` fails a build whose shell reaches a
 * dataset again.
 */
import type {
	PersonPageJsonLd,
	JsonLdOrganization,
	JsonLdEducationalCredential
} from '$lib/types/jsonld';
import { address, contact, researchTopics, linkedData } from '$lib/data/siteConfig';
import { allEducation } from '$lib/data/education';
import { languagesByProficiency } from '$lib/data/languages';
import { allAffiliations } from '$lib/data/affiliations';
import { createPersonSchema, wikidataEntityUrl } from '$lib/utils/jsonLdSchemas';

/** Maps a degree-name prefix to a schema.org educationalLevel label. */
const DEGREE_LEVELS: ReadonlyArray<readonly [prefix: string, level: string]> = [
	['PhD', 'Doctorate'],
	['Ph.D.', 'Doctorate'],
	['M.A.', 'Master'],
	['B.A.', 'Bachelor']
];

/**
 * Creates the full Person schema for the home page (the profile page).
 *
 * Extends {@link createPersonSchema} — same `@id`, so search engines merge the
 * two nodes into one Person identity, with this one being the richer superset.
 * The biographical fields are derived from the real datasets instead of being
 * hand-maintained:
 * - `alumniOf` — degree-granting institutions from `$lib/data/education`
 * - `hasCredential` — degrees from `$lib/data/education`
 * - `memberOf` — ongoing memberships from `$lib/data/affiliations`
 * - `knowsLanguage` — from `$lib/data/languages`
 * - `knowsAbout` — the curated `researchTopics` list in `$lib/data/siteConfig`
 *   (editorial, not derivable from data)
 */
export function createFullPersonSchema(): PersonPageJsonLd {
	const person = createPersonSchema();

	// Degree-granting institutions, deduplicated by name (most recent first).
	const degrees = allEducation
		.filter((entry) => entry.type === 'Degree')
		.sort((a, b) => b.dateISO.localeCompare(a.dateISO));
	const alumniOf: JsonLdOrganization[] = [];
	for (const degree of degrees) {
		if (alumniOf.some((org) => org.name === degree.institution)) continue;
		alumniOf.push({
			'@type': 'EducationalOrganization',
			name: degree.institution,
			...(degree.institutionUrl && { url: degree.institutionUrl })
		});
	}

	const hasCredential: JsonLdEducationalCredential[] = degrees.map((degree) => {
		const level = DEGREE_LEVELS.find(([prefix]) => degree.degree.startsWith(prefix))?.[1];
		return {
			'@type': 'EducationalOccupationalCredential',
			credentialCategory: 'degree',
			...(level && { educationalLevel: level }),
			name: degree.degree
		};
	});

	// Ongoing memberships only (`period.end === null` means "to present").
	const memberOf: JsonLdOrganization[] = allAffiliations
		.filter((affiliation) => affiliation.period.end === null)
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((affiliation) => ({
			'@type': 'Organization',
			name: affiliation.abbreviation
				? `${affiliation.name} (${affiliation.abbreviation})`
				: affiliation.name,
			...(affiliation.url && { url: affiliation.url })
		}));

	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		'@id': person['@id'],
		name: person.name,
		honorificPrefix: 'Dr.',
		description: person.description,
		url: person.url,
		image: person.image,
		email: contact.email,
		jobTitle: person.jobTitle,
		hasOccupation: person.hasOccupation,
		worksFor: person.worksFor,
		workLocation: {
			'@type': 'Place',
			name: address.city
		},
		nationality: {
			'@type': 'Country',
			'@id': wikidataEntityUrl(linkedData.nationality.wikidataId),
			name: linkedData.nationality.name
		},
		alumniOf,
		memberOf,
		hasCredential,
		knowsLanguage: languagesByProficiency.map((language) => language.name),
		sameAs: person.sameAs,
		knowsAbout: [...researchTopics]
	};
}
