import { describe, it, expect } from 'vitest';
import { allPublicationSummaries } from '$lib/data/publications/summaries';
import {
	PUBLICATION_TYPE_BADGE_LABELS,
	PUBLICATION_TYPE_CHART_LABELS,
	PUBLICATION_TYPE_CHIP_LABELS,
	PUBLICATION_TYPE_CITATION_LABELS,
	PUBLICATION_TYPE_COINS_GENRES,
	PUBLICATION_TYPE_CV_HEADING_LABELS,
	PUBLICATION_TYPE_DC_TYPES,
	PUBLICATION_TYPE_FILTER_LABELS,
	PUBLICATION_TYPE_GANTT_LABELS,
	PUBLICATION_TYPE_PANEL_LABELS,
	PUBLICATION_TYPE_SEO_LABELS
} from './publicationTypeLabels';

/**
 * The publication-type registry guard.
 *
 * Every register in `publicationTypeLabels.ts` is a lookup with a fallback that
 * prints the raw key — `getPublicationTypeBadge` returns `type`, the panel
 * filter returns `type`, the CV heading returns "Other Publications". A missing
 * entry therefore fails silently, in public: `conference-proceedings` was absent
 * from the badge register for as long as the register existed, so
 * /publications/salafism-cote-ivoire-mande-2017 printed the literal string
 * `conference-proceedings` in its breadcrumb, its masthead eyebrow and its rail.
 *
 * Nothing catches that. Lint has no opinion about an object literal, the type is
 * `Record<string, string>` by design (the data is authored, not enumerated), and
 * the page renders perfectly well with a database key as its type.
 *
 * So the dataset is the oracle: every type that actually occurs in
 * `src/lib/data/publications/` must have an entry in every register. Adding a
 * thirteenth publication type now fails here rather than on the page.
 */

const REGISTERS = {
	BADGE: PUBLICATION_TYPE_BADGE_LABELS,
	CITATION: PUBLICATION_TYPE_CITATION_LABELS,
	SEO: PUBLICATION_TYPE_SEO_LABELS,
	'CV heading': PUBLICATION_TYPE_CV_HEADING_LABELS,
	FILTER: PUBLICATION_TYPE_FILTER_LABELS,
	CHIP: PUBLICATION_TYPE_CHIP_LABELS,
	CHART: PUBLICATION_TYPE_CHART_LABELS,
	GANTT: PUBLICATION_TYPE_GANTT_LABELS,
	PANEL: PUBLICATION_TYPE_PANEL_LABELS,
	'COinS genre': PUBLICATION_TYPE_COINS_GENRES,
	'DC type': PUBLICATION_TYPE_DC_TYPES
} as const;

/** Every publication type the corpus actually uses, in sorted order. */
const typesInUse = [
	...new Set(allPublicationSummaries.map((publication) => publication.type).filter(Boolean))
].sort() as string[];

describe('every publication type in the corpus is labelled in every register', () => {
	it('reads a plausible set of types off the dataset', () => {
		// A guard against the oracle silently emptying and the suite passing
		// vacuously — the corpus held 12 distinct types when this was written.
		expect(typesInUse.length).toBeGreaterThanOrEqual(10);
		expect(typesInUse).toContain('conference-proceedings');
	});

	for (const [name, register] of Object.entries(REGISTERS)) {
		it(`${name} covers every type`, () => {
			const missing = typesInUse.filter((type) => !register[type]);
			expect(
				missing,
				`${name} has no entry for ${missing.join(', ')} — the lookup falls back to the raw ` +
					`key, so the page would print it verbatim. Add the label in ` +
					`publicationTypeLabels.ts in this change.`
			).toEqual([]);
		});
	}
});

describe('the registers hold no keys the corpus does not use', () => {
	// The other direction: a stale key is a label nothing can reach, and it is
	// how `dissertation` survived in the panel register long after the data had
	// split into `phd-dissertation` and `masters-thesis`.
	for (const [name, register] of Object.entries(REGISTERS)) {
		it(`${name} has no stale key`, () => {
			const stale = Object.keys(register).filter((type) => !typesInUse.includes(type));
			expect(stale, `${name} still labels ${stale.join(', ')}, which no record uses`).toEqual([]);
		});
	}
});

describe('the human-facing chip labels stay distinguishable', () => {
	it('names both thesis kinds rather than dropping the word that separates them', () => {
		// `Theses` and `Dissertations` were the same word twice to a reader who
		// does not already know the site files a master's thesis and a PhD
		// dissertation as different types.
		expect(PUBLICATION_TYPE_CHIP_LABELS['masters-thesis']).toContain("Master's");
		expect(PUBLICATION_TYPE_CHIP_LABELS['phd-dissertation']).toContain('PhD');
	});
});
