import { describe, it, expect } from 'vitest';

import { allPublications } from '$lib/data/publications';
import { allPublicationSummaries } from '$lib/data/publications/summaries';
import {
	ABSTRACT_EXCERPT_LENGTH,
	HEAVY_PUBLICATION_FIELDS
} from '$lib/data/publications/summaryConfig';
import { truncateAbstract } from '$lib/utils/textUtils';
import type { Publication, TableOfContentsEntry } from '$lib/types';

/**
 * The committed summaries must be a faithful projection of the full dataset:
 * this is what lets the list pages drop the heavy fields without rendering
 * anything differently. It fails when a data file changes without
 * `npm run gen:summaries` (CI also runs the generator's --check), and when a
 * row starts truncating past what the excerpt carries.
 */

const summariesById = new Map(allPublicationSummaries.map((s) => [s.id, s]));

function tocAuthorsOf(publication: Publication): string[] {
	const names: string[] = [];
	for (const entry of publication.tableOfContents ?? []) {
		if (typeof entry === 'string') continue;
		for (const name of (entry as TableOfContentsEntry).authors ?? []) {
			if (!names.includes(name)) names.push(name);
		}
	}
	return names;
}

describe('publication summaries', () => {
	it('cover exactly the publications the full index ships', () => {
		const fullIds = allPublications.map((p) => p.id).sort();
		const summaryIds = allPublicationSummaries.map((s) => s.id).sort();
		expect(summaryIds).toEqual(fullIds);
	});

	it('carry none of the heavy fields', () => {
		for (const summary of allPublicationSummaries) {
			for (const field of HEAVY_PUBLICATION_FIELDS) {
				expect(field in summary, `${summary.id} carries ${field}`).toBe(false);
			}
		}
	});

	it('keep every other field identical to the full record', () => {
		for (const publication of allPublications) {
			const summary = summariesById.get(publication.id);
			expect(summary, `no summary for ${publication.id}`).toBeDefined();
			const heavy: readonly string[] = HEAVY_PUBLICATION_FIELDS;
			for (const [key, value] of Object.entries(publication)) {
				if (heavy.includes(key)) continue;
				expect(summary![key as keyof typeof summary], `${publication.id}.${key}`).toEqual(value);
			}
		}
	});

	it('tally citations and table-of-contents contributors as the full record has them', () => {
		for (const publication of allPublications) {
			const summary = summariesById.get(publication.id)!;
			expect(summary.citedByCount, publication.id).toBe(publication.citedBy?.length ?? 0);
			expect(summary.tocAuthors, publication.id).toEqual(tocAuthorsOf(publication));
		}
	});

	it('carry an abstract excerpt that truncates exactly like the full abstract', () => {
		for (const publication of allPublications) {
			const summary = summariesById.get(publication.id)!;
			if (!publication.abstract) {
				expect(summary.abstractExcerpt, publication.id).toBeUndefined();
				continue;
			}
			expect(summary.abstractExcerpt!.length).toBeLessThanOrEqual(ABSTRACT_EXCERPT_LENGTH + 1);
			// The truncations the rows apply (120 on the research-page cards, 180
			// for the featured standfirst, 200 by default), plus the contract's ceiling.
			for (const length of [120, 180, 200, ABSTRACT_EXCERPT_LENGTH]) {
				expect(
					truncateAbstract(summary.abstractExcerpt, length),
					`${publication.id} @${length}`
				).toBe(truncateAbstract(publication.abstract, length));
			}
		}
	});
});
