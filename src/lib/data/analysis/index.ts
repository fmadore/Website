/**
 * Text Analysis Data Aggregation
 *
 * This module exports pre-computed text analysis data for visualizations
 * like word clouds, frequency charts, and corpus statistics.
 *
 * Individual publication analyses are stored in ./publications/{id}.ts
 * and lazy-loaded via the publications index.
 */

import type { CorpusAnalysis, WordFrequency, WordCloudConfig, NgramFrequency } from '$lib/types';

// Re-export from publications index (individual files for fast loading)
export {
	publicationAnalyses,
	getAnalysis,
	hasAnalysis,
	getAnalyzedIds
} from './publications';

import { publicationAnalyses } from './publications';

/**
 * Compute corpus-level analysis from all publication analyses.
 * This aggregates frequencies across all analyzed publications.
 */
function computeCorpusAnalysis(): CorpusAnalysis {
	const analyses = Object.values(publicationAnalyses);

	if (analyses.length === 0) {
		return {
			publicationCount: 0,
			totalWords: 0,
			frequencies: [],
			byLanguage: { en: [], fr: [] },
			analyzedAt: new Date().toISOString().split('T')[0]
		};
	}

	// Aggregate word frequencies across all publications
	const frequencyMap = new Map<string, { count: number; tfidfSum: number; occurrences: number }>();

	let totalWords = 0;
	const byLanguage: { en: string[]; fr: string[] } = { en: [], fr: [] };

	for (const analysis of analyses) {
		totalWords += analysis.wordCount;

		// Track by language
		if (analysis.language === 'en') {
			byLanguage.en.push(analysis.publicationId);
		} else if (analysis.language === 'fr') {
			byLanguage.fr.push(analysis.publicationId);
		}

		// Aggregate frequencies
		for (const freq of analysis.frequencies) {
			const key = freq.lemma || freq.word;
			const existing = frequencyMap.get(key);

			if (existing) {
				existing.count += freq.count;
				existing.tfidfSum += freq.tfidf || 0;
				existing.occurrences += 1;
			} else {
				frequencyMap.set(key, {
					count: freq.count,
					tfidfSum: freq.tfidf || 0,
					occurrences: 1
				});
			}
		}
	}

	// Convert to sorted array
	const frequencies: WordFrequency[] = Array.from(frequencyMap.entries())
		.map(([word, data]) => ({
			word,
			count: data.count,
			tfidf: data.occurrences > 0 ? data.tfidfSum / data.occurrences : undefined
		}))
		.sort((a, b) => b.count - a.count)
		.slice(0, 500); // Keep top 500 for corpus

	return {
		publicationCount: analyses.length,
		totalWords,
		frequencies,
		byLanguage,
		analyzedAt: new Date().toISOString().split('T')[0]
	};
}

/**
 * Cached corpus analysis (computed once on module load)
 */
export const corpusAnalysis: CorpusAnalysis = computeCorpusAnalysis();

/**
 * Get word frequencies for a specific publication, filtered by config
 */
export function getWordCloudData(
	publicationId: string,
	config: WordCloudConfig = {}
): WordFrequency[] {
	const analysis = publicationAnalyses[publicationId];
	if (!analysis) return [];

	return filterFrequencies(analysis.frequencies, config);
}

/**
 * Get corpus-wide word frequencies, filtered by config
 */
export function getCorpusWordCloudData(config: WordCloudConfig = {}): WordFrequency[] {
	return filterFrequencies(corpusAnalysis.frequencies, config);
}

/**
 * Get word frequencies for multiple publications combined
 */
export function getCombinedWordCloudData(
	publicationIds: string[],
	config: WordCloudConfig = {}
): WordFrequency[] {
	const frequencyMap = new Map<string, { count: number; tfidf: number; n: number }>();

	for (const id of publicationIds) {
		const analysis = publicationAnalyses[id];
		if (!analysis) continue;

		for (const freq of analysis.frequencies) {
			const key = freq.lemma || freq.word;
			const existing = frequencyMap.get(key);

			if (existing) {
				existing.count += freq.count;
				existing.tfidf += freq.tfidf || 0;
				existing.n += 1;
			} else {
				frequencyMap.set(key, {
					count: freq.count,
					tfidf: freq.tfidf || 0,
					n: 1
				});
			}
		}
	}

	const frequencies: WordFrequency[] = Array.from(frequencyMap.entries())
		.map(([word, data]) => ({
			word,
			count: data.count,
			tfidf: data.n > 0 ? data.tfidf / data.n : undefined
		}))
		.sort((a, b) => b.count - a.count);

	return filterFrequencies(frequencies, config);
}

/**
 * Filter frequencies based on word cloud configuration
 */
function filterFrequencies(frequencies: WordFrequency[], config: WordCloudConfig): WordFrequency[] {
	let result = [...frequencies];

	// Filter by minimum count
	if (config.minCount !== undefined) {
		result = result.filter((f) => f.count >= config.minCount!);
	}

	// Filter by POS if specified
	if (config.posFilter && config.posFilter.length > 0) {
		result = result.filter(
			(f) => f.pos && f.pos !== 'other' && config.posFilter!.includes(f.pos)
		);
	}

	// Sort by TF-IDF if requested
	if (config.useTfidf) {
		result.sort((a, b) => (b.tfidf || 0) - (a.tfidf || 0));
	}

	// Limit number of words
	if (config.maxWords !== undefined) {
		result = result.slice(0, config.maxWords);
	}

	return result;
}

/**
 * Get statistics about the analyzed corpus
 */
export function getCorpusStats() {
	return {
		publicationCount: corpusAnalysis.publicationCount,
		totalWords: corpusAnalysis.totalWords,
		uniqueWords: corpusAnalysis.frequencies.length,
		englishPublications: corpusAnalysis.byLanguage.en.length,
		frenchPublications: corpusAnalysis.byLanguage.fr.length
	};
}

/**
 * Get bigrams for a specific publication
 */
export function getBigrams(publicationId: string): NgramFrequency[] {
	const analysis = publicationAnalyses[publicationId];
	if (!analysis || !analysis.bigrams) return [];
	return analysis.bigrams;
}

/**
 * Get combined bigrams for multiple publications
 */
export function getCombinedBigrams(
	publicationIds: string[],
	maxBigrams: number = 50
): NgramFrequency[] {
	const bigramMap = new Map<string, { words: string[]; count: number }>();

	for (const id of publicationIds) {
		const analysis = publicationAnalyses[id];
		if (!analysis?.bigrams) continue;

		for (const bigram of analysis.bigrams) {
			const existing = bigramMap.get(bigram.ngram);
			if (existing) {
				existing.count += bigram.count;
			} else {
				bigramMap.set(bigram.ngram, {
					words: bigram.words,
					count: bigram.count
				});
			}
		}
	}

	// Convert to sorted array
	return Array.from(bigramMap.entries())
		.map(([ngram, data]) => ({
			ngram,
			words: data.words,
			count: data.count
		}))
		.sort((a, b) => b.count - a.count)
		.slice(0, maxBigrams);
}
