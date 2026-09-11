import { describe, it, expect } from 'vitest';

import { allCommunications, communicationsByDate } from '$lib/data/communications';
import {
	allCommunicationSummaries,
	communicationSummariesByDate,
	communicationSummariesWithSlides
} from '$lib/data/communications/summaries';
import { HEAVY_COMMUNICATION_FIELDS } from '$lib/data/communications/summaryConfig';
import { ABSTRACT_EXCERPT_LENGTH } from '$lib/data/publications/summaryConfig';
import { truncateAbstract } from '$lib/utils/textUtils';

/**
 * The committed summaries must be a faithful projection of the full dataset:
 * this is what lets the index, the CV, the timeline and the research pages
 * drop the abstracts without rendering anything differently. It fails when a
 * data file changes without `npm run gen:summaries` (CI also runs the
 * generator's --check), and when a row starts truncating past what the excerpt
 * carries.
 */

const summariesById = new Map(allCommunicationSummaries.map((s) => [s.id, s]));

describe('communication summaries', () => {
	it('cover exactly the talks the full index ships', () => {
		const fullIds = allCommunications.map((c) => c.id).sort();
		const summaryIds = allCommunicationSummaries.map((s) => s.id).sort();
		expect(summaryIds).toEqual(fullIds);
	});

	it('arrive in the same order as the full index', () => {
		// `sortByDate` is stable, so the derived lists only match row for row
		// while the two source arrays agree on the order of talks that share a
		// date. The generator emits source-path order for exactly this reason.
		expect(allCommunicationSummaries.map((s) => s.id)).toEqual(allCommunications.map((c) => c.id));
		expect(communicationSummariesByDate.map((s) => s.id)).toEqual(
			communicationsByDate.map((c) => c.id)
		);
	});

	it('carry none of the heavy fields', () => {
		for (const summary of allCommunicationSummaries) {
			for (const field of HEAVY_COMMUNICATION_FIELDS) {
				expect(field in summary, `${summary.id} carries ${field}`).toBe(false);
			}
		}
	});

	it('keep every other field identical to the full record', () => {
		for (const communication of allCommunications) {
			const summary = summariesById.get(communication.id);
			expect(summary, `no summary for ${communication.id}`).toBeDefined();
			const heavy: readonly string[] = HEAVY_COMMUNICATION_FIELDS;
			for (const [key, value] of Object.entries(communication)) {
				if (heavy.includes(key)) continue;
				expect(summary![key as keyof typeof summary], `${communication.id}.${key}`).toEqual(value);
			}
		}
	});

	it('keep the panel programmes the networks are built from', () => {
		// `papers[].authors` feeds the co-presenter and institution networks on
		// /conference-activity/visualisations, so the projection may not drop it.
		for (const communication of allCommunications) {
			if (!communication.papers) continue;
			expect(summariesById.get(communication.id)!.papers, communication.id).toEqual(
				communication.papers
			);
		}
	});

	it('carry an abstract excerpt that truncates exactly like the full abstract', () => {
		for (const communication of allCommunications) {
			const summary = summariesById.get(communication.id)!;
			if (!communication.abstract) {
				expect(summary.abstractExcerpt, communication.id).toBeUndefined();
				continue;
			}
			expect(summary.abstractExcerpt!.length).toBeLessThanOrEqual(ABSTRACT_EXCERPT_LENGTH + 1);
			// The truncations the rows apply (120 on the research-page cards, 180
			// for the bibliography standfirst), plus the contract's ceiling.
			for (const length of [120, 180, 200, ABSTRACT_EXCERPT_LENGTH]) {
				expect(
					truncateAbstract(summary.abstractExcerpt, length),
					`${communication.id} @${length}`
				).toBe(truncateAbstract(communication.abstract, length));
			}
		}
	});

	it('derive the slides gallery exactly as the full index does', () => {
		expect(communicationSummariesWithSlides.map((s) => s.id)).toEqual(
			communicationsByDate.filter((c) => !!c.slidesUrl).map((c) => c.id)
		);
	});
});
