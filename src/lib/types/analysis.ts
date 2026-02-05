/**
 * Types for text analysis data (word frequencies, lemmatization, etc.)
 * Used for visualizations like word clouds, topic analysis, and corpus statistics.
 */

/**
 * A single word frequency entry with optional NLP metadata
 */
export interface WordFrequency {
	/** The word as it appears (or its lemma if lemmatized) */
	word: string;
	/** Raw count in the document/corpus */
	count: number;
	/** Original lemma if different from word */
	lemma?: string;
	/** TF-IDF score for corpus-relative importance */
	tfidf?: number;
	/** Part of speech tag (noun, verb, adj, etc.) */
	pos?: 'noun' | 'verb' | 'adj' | 'adv' | 'propn' | 'other';
}

/**
 * N-gram frequency (bigrams, trigrams, etc.)
 */
export interface NgramFrequency {
	/** The n-gram as a string (e.g., "West Africa") */
	ngram: string;
	/** Component words */
	words: string[];
	/** Raw count */
	count: number;
}

/**
 * Text analysis data for a single publication
 */
export interface PublicationTextAnalysis {
	/** Reference to the publication by ID */
	publicationId: string;
	/** Language of the analyzed text */
	language: 'en' | 'fr';
	/** Total word count of the source text */
	wordCount: number;
	/** Number of unique words/lemmas */
	uniqueWords: number;
	/** Top word frequencies (typically top 100-500) */
	frequencies: WordFrequency[];
	/** Optional bigram frequencies */
	bigrams?: NgramFrequency[];
	/** Optional trigram frequencies */
	trigrams?: NgramFrequency[];
	/** Date the analysis was generated */
	analyzedAt?: string;
	/** Source of the text (pdf, abstract, etc.) */
	source?: 'full-text' | 'abstract' | 'combined';
}

/**
 * Aggregated corpus-level analysis
 */
export interface CorpusAnalysis {
	/** Total publications analyzed */
	publicationCount: number;
	/** Total words across all publications */
	totalWords: number;
	/** Corpus-wide word frequencies */
	frequencies: WordFrequency[];
	/** Optional corpus-wide bigrams */
	bigrams?: NgramFrequency[];
	/** Publications grouped by language */
	byLanguage: {
		en: string[];
		fr: string[];
	};
	/** Date the analysis was generated */
	analyzedAt: string;
}

/**
 * Configuration for word cloud generation
 */
export interface WordCloudConfig {
	/** Minimum frequency threshold */
	minCount?: number;
	/** Maximum number of words to display */
	maxWords?: number;
	/** Filter by part of speech */
	posFilter?: Array<'noun' | 'verb' | 'adj' | 'adv' | 'propn'>;
	/** Use TF-IDF weighting instead of raw counts */
	useTfidf?: boolean;
}
