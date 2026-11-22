/**
 * What may be reused, and on what terms: one statement, read by the API's
 * discovery manifest (`/api/index.json`), `/llms.txt` and the footer's rights
 * line, so the three never disagree.
 *
 * The split follows what the scholar can license. Bibliographic and catalogue
 * metadata is dedicated to the public domain (CC0), as Wikidata, OpenAlex and
 * Crossref do, so the records can be reused and linked without attribution
 * friction. Prose the scholar wrote for this site is CC BY 4.0. Abstracts of
 * published works, covers and press or event images are not his to license:
 * their rights stay with the publishers and other holders. The site's code is
 * MIT (the repository's LICENSE).
 */

export interface LicenceTerm {
	/** Short name, as printed: "CC0 1.0". */
	name: string;
	/** SPDX identifier, where the terms have one. */
	spdx?: string;
	/** The licence's canonical address. */
	url?: string;
	/** What the terms cover, as one plain sentence. */
	scope: string;
}

export const LICENSING = {
	metadata: {
		name: 'CC0 1.0',
		spdx: 'CC0-1.0',
		url: 'https://creativecommons.org/publicdomain/zero/1.0/',
		scope:
			'Bibliographic and catalogue metadata: titles, authors, dates, venues, identifiers, tags, citation links and the structured records of the JSON API.'
	},
	text: {
		name: 'CC BY 4.0',
		spdx: 'CC-BY-4.0',
		url: 'https://creativecommons.org/licenses/by/4.0/',
		scope:
			"Text written for this site by its author: project narratives, activity entries, descriptions and the CV's prose."
	},
	thirdParty: {
		name: 'Rights reserved by their holders',
		scope:
			'Abstracts of published works, covers, and press, event and programme images: their rights remain with the publishers and other rights holders.'
	},
	code: {
		name: 'MIT',
		spdx: 'MIT',
		url: 'https://github.com/fmadore/Website/blob/main/LICENSE',
		scope: "The site's source code."
	}
} as const satisfies Record<string, LicenceTerm>;
