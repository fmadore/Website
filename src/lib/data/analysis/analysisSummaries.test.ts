import { describe, it, expect } from 'vitest';

import {
	corpusAnalysis,
	getAnalysis,
	getAnalyzedIds,
	getCombinedWordCloudData,
	getCombinedBigrams
} from '$lib/data/analysis';
import { keyTermsByPublication } from '$lib/data/analysis/keyTerms.generated';
import { corpusSummary } from '$lib/data/analysis/corpusSummary.generated';

/**
 * The committed analysis projections must be faithful to the corpus they are
 * projected from: that is what lets the publication record pages and the
 * visualisations page drop 306 KiB of frequencies without printing anything
 * different. It fails when an analysis file changes without
 * `npm run gen:analysis` (CI also runs the generator's --check), and when a
 * page starts asking for more terms than the projection carries.
 *
 * Sibling of `publications/summaries.test.ts`, which does the same job for the
 * publication dataset.
 */

/** !! KEEP IN SYNC with the constants in scripts/generate-analysis-summaries.mjs. */
const KEY_TERM_COUNT = 28;
const WORD_CLOUD_WORDS = 100;
const MAX_BIGRAMS = 30;

/** The id order the runtime corpus uses, English block then French block. */
const idsByFilter: Record<'all' | 'en' | 'fr', string[]> = {
	all: [...corpusAnalysis.byLanguage.en, ...corpusAnalysis.byLanguage.fr],
	en: corpusAnalysis.byLanguage.en,
	fr: corpusAnalysis.byLanguage.fr
};

describe('key terms projection', () => {
	it('covers exactly the publications the corpus has analysed', () => {
		expect(Object.keys(keyTermsByPublication).sort()).toEqual(getAnalyzedIds().sort());
	});

	it('carries each record’s top terms, word and count, in corpus order', () => {
		for (const id of getAnalyzedIds()) {
			const expected = (getAnalysis(id)?.frequencies ?? [])
				.slice(0, KEY_TERM_COUNT)
				.map(({ word, count }) => ({ word, count }));
			expect(keyTermsByPublication[id], id).toEqual(expected);
		}
	});

	it('carries at least as many terms as the rail prints', () => {
		for (const [id, terms] of Object.entries(keyTermsByPublication)) {
			const available = getAnalysis(id)?.frequencies?.length ?? 0;
			expect(terms.length, id).toBe(Math.min(KEY_TERM_COUNT, available));
		}
	});
});

describe('corpus summary projection', () => {
	it('counts the analysed publications as the corpus does', () => {
		expect(corpusSummary.publicationCount).toBe(corpusAnalysis.publicationCount);
		expect(corpusSummary.analysed.en).toBe(corpusAnalysis.byLanguage.en.length);
		expect(corpusSummary.analysed.fr).toBe(corpusAnalysis.byLanguage.fr.length);
		expect(corpusSummary.analysed.all).toBe(idsByFilter.all.length);
	});

	it('reproduces the word cloud the page would have computed', () => {
		for (const filter of ['all', 'en', 'fr'] as const) {
			const expected = getCombinedWordCloudData(idsByFilter[filter], {
				maxWords: WORD_CLOUD_WORDS
			}).map(({ word, count }) => ({ word, count }));
			expect(corpusSummary.wordCloud[filter], filter).toEqual(expected);
		}
	});

	it('reproduces the bigrams the page would have computed', () => {
		for (const filter of ['all', 'en', 'fr'] as const) {
			const expected = getCombinedBigrams(idsByFilter[filter], MAX_BIGRAMS);
			expect(corpusSummary.bigrams[filter], filter).toEqual(expected);
		}
	});

	it('never exceeds the sizes the page renders', () => {
		for (const filter of ['all', 'en', 'fr'] as const) {
			expect(corpusSummary.wordCloud[filter].length).toBeLessThanOrEqual(WORD_CLOUD_WORDS);
			expect(corpusSummary.bigrams[filter].length).toBeLessThanOrEqual(MAX_BIGRAMS);
		}
	});
});
