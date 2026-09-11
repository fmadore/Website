/**
 * Build-time generator for the two projections of the full-text analysis corpus.
 *
 * Why: `src/lib/data/analysis` is 306 KiB of lemmatised word and bigram
 * frequencies — every term of every analysed publication, hundreds per record.
 * Two places imported it, and neither needed more than a sliver:
 *
 *   - `PublicationIndexRail` prints the top 28 terms of ONE record, and pulled
 *     the whole corpus onto every `/publications/[id]` page to do it (694 KiB
 *     of static JavaScript per record page).
 *   - `/publications/visualisations` prints three fixed views of the corpus —
 *     the 100-term cloud and the 30 commonest bigrams, for all / English /
 *     French — and recomputed them in the browser from the same 306 KiB, on
 *     top of `computeCorpusAnalysis()` running at module load.
 *
 * Nothing on either page varies with anything the reader can do, so both are
 * static facts about the record and belong in a committed literal. This script
 * emits them:
 *
 *   src/lib/data/analysis/keyTerms.generated.ts
 *       publication id → its top KEY_TERM_COUNT frequencies ({ word, count }),
 *       which is exactly what the rail's cloud reads.
 *   src/lib/data/analysis/corpusSummary.generated.ts
 *       publicationCount, the per-language counts the toggle prints, and the
 *       word-cloud / bigram arrays for the three filters.
 *
 * `src/lib/data/analysis/index.ts` keeps its full API for anything that needs
 * the whole corpus; it simply is no longer on a route's critical path.
 *
 * Fidelity is proved, not assumed: `analysisSummaries.test.ts` recomputes both
 * projections from the live modules and compares.
 *
 * How: the analysis files are loaded straight from TypeScript by Node's
 * built-in type stripping (they are erasable-syntax-only and import types
 * alone), in the same alphabetical order Vite's `import.meta.glob` hands the
 * runtime — the aggregation's tie-breaking depends on it.
 *
 * Modes:
 *   node scripts/generate-analysis-summaries.mjs          # (re)write
 *   node scripts/generate-analysis-summaries.mjs --check  # CI freshness check:
 *       regenerate in memory and exit 1 if a committed file is stale.
 */
import { globSync } from 'node:fs';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ANALYSIS_DIR = 'src/lib/data/analysis';
const KEY_TERMS_FILE = `${ANALYSIS_DIR}/keyTerms.generated.ts`;
const CORPUS_FILE = `${ANALYSIS_DIR}/corpusSummary.generated.ts`;
const CHECK_MODE = process.argv.includes('--check');

/**
 * !! KEEP IN SYNC with the three call sites these numbers project:
 *   KEY_TERM_COUNT   — `PublicationIndexRail.svelte` (`freqs.slice(0, 28)`)
 *   WORD_CLOUD_WORDS — `/publications/visualisations` (`{ maxWords: 100 }`)
 *   MAX_BIGRAMS      — `/publications/visualisations` (`getCombinedBigrams(…, 30)`)
 * `analysisSummaries.test.ts` fails if a page starts asking for more than the
 * projection carries.
 */
const KEY_TERM_COUNT = 28;
const WORD_CLOUD_WORDS = 100;
const MAX_BIGRAMS = 30;

/**
 * Every analysis, in the order `import.meta.glob` gives the runtime.
 *
 * Order is load-bearing: `getCombinedWordCloudData` sorts on count alone, so
 * ties resolve to the order the terms were first seen, which is the order of
 * the publications. Vite sorts its glob keys, so this sorts by filename too.
 */
function loadAnalyses() {
	const files = globSync(`${ANALYSIS_DIR}/publications/*.ts`)
		.filter((file) => basename(file) !== 'index.ts')
		.sort((a, b) => (basename(a) < basename(b) ? -1 : basename(a) > basename(b) ? 1 : 0));
	return Promise.all(
		files.map(async (file) => {
			const mod = await import(pathToFileURL(resolve(file)).href);
			if (!mod.analysis) {
				console.error(`[gen:analysis] ERROR: ${file} exports no \`analysis\`. Aborting.`);
				process.exit(1);
			}
			return mod.analysis;
		})
	);
}

/** The rail's cloud: the record's own most frequent terms, word and count only. */
function keyTermsOf(analysis) {
	return (analysis.frequencies ?? [])
		.slice(0, KEY_TERM_COUNT)
		.map(({ word, count }) => ({ word, count }));
}

/**
 * Mirrors `getCombinedWordCloudData(ids, { maxWords })` in
 * `src/lib/data/analysis/index.ts`: frequencies keyed on the lemma where there
 * is one, summed across the selected publications, sorted by count, truncated.
 * Only `word` and `count` are kept — the pages scale type size by count and
 * read nothing else.
 */
function combinedWordCloud(analyses, maxWords) {
	const counts = new Map();
	for (const analysis of analyses) {
		for (const freq of analysis.frequencies ?? []) {
			const key = freq.lemma || freq.word;
			counts.set(key, (counts.get(key) ?? 0) + freq.count);
		}
	}
	return [...counts.entries()]
		.map(([word, count]) => ({ word, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, maxWords);
}

/** Mirrors `getCombinedBigrams(ids, maxBigrams)`. */
function combinedBigrams(analyses, maxBigrams) {
	const bigrams = new Map();
	for (const analysis of analyses) {
		for (const bigram of analysis.bigrams ?? []) {
			const existing = bigrams.get(bigram.ngram);
			if (existing) existing.count += bigram.count;
			else
				bigrams.set(bigram.ngram, {
					ngram: bigram.ngram,
					words: bigram.words,
					count: bigram.count
				});
		}
	}
	return [...bigrams.values()].sort((a, b) => b.count - a.count).slice(0, maxBigrams);
}

const analyses = await loadAnalyses();

// ---- keyTerms.generated.ts -------------------------------------------------

const keyTerms = {};
for (const analysis of analyses) keyTerms[analysis.publicationId] = keyTermsOf(analysis);

const keyTermsOutput =
	`// AUTO-GENERATED by scripts/generate-analysis-summaries.mjs — DO NOT EDIT.
// Regenerate with \`npm run gen:analysis\` (runs automatically via the prebuild hook).
/* eslint-disable */
import type { WordFrequency } from '$lib/types';

/**
 * Each analysed publication's ${KEY_TERM_COUNT} most frequent full-text terms — what the
 * record rail's key-terms cloud prints, and nothing else. A publication absent
 * from this map has no full-text analysis.
 */
export const keyTermsByPublication: Record<string, WordFrequency[]> = ` +
	JSON.stringify(keyTerms, null, '\t') +
	';\n';

// ---- corpusSummary.generated.ts -------------------------------------------

// `byLanguage` on the runtime corpus, rebuilt here: analyses in glob order,
// English first then French, which is the order the "all" filter concatenates.
const en = analyses.filter((a) => a.language === 'en');
const fr = analyses.filter((a) => a.language === 'fr');
const byFilter = { all: [...en, ...fr], en, fr };

const corpusSummary = {
	publicationCount: analyses.length,
	analysed: { all: byFilter.all.length, en: en.length, fr: fr.length },
	wordCloud: Object.fromEntries(
		Object.entries(byFilter).map(([key, group]) => [
			key,
			combinedWordCloud(group, WORD_CLOUD_WORDS)
		])
	),
	bigrams: Object.fromEntries(
		Object.entries(byFilter).map(([key, group]) => [key, combinedBigrams(group, MAX_BIGRAMS)])
	)
};

const corpusOutput =
	`// AUTO-GENERATED by scripts/generate-analysis-summaries.mjs — DO NOT EDIT.
// Regenerate with \`npm run gen:analysis\` (runs automatically via the prebuild hook).
/* eslint-disable */
import type { NgramFrequency, WordFrequency } from '$lib/types';

/**
 * The three fixed views of the full-text corpus that /publications/visualisations
 * draws: the ${WORD_CLOUD_WORDS}-term cloud and the ${MAX_BIGRAMS} commonest two-word phrases, for the
 * whole corpus and for each analysed language. None of it varies with anything
 * the reader can do, so it is a fact about the record rather than a computation
 * the browser should repeat over 306 KiB of frequencies.
 */
export const corpusSummary: {
	/** Publications with a full-text analysis, whatever their language. */
	publicationCount: number;
	/** Publications behind each filter; \`all\` is the two languages together. */
	analysed: { all: number; en: number; fr: number };
	wordCloud: { all: WordFrequency[]; en: WordFrequency[]; fr: WordFrequency[] };
	bigrams: { all: NgramFrequency[]; en: NgramFrequency[]; fr: NgramFrequency[] };
} = ` +
	JSON.stringify(corpusSummary, null, '\t') +
	';\n';

// ---- write or check --------------------------------------------------------

const outputs = [
	[KEY_TERMS_FILE, keyTermsOutput],
	[CORPUS_FILE, corpusOutput]
];

if (CHECK_MODE) {
	let stale = false;
	for (const [file, output] of outputs) {
		let committed = null;
		try {
			committed = readFileSync(file, 'utf8');
		} catch {
			// Missing file counts as stale.
		}
		if (committed !== output) {
			console.error(
				`[gen:analysis] ERROR: ${file} is stale (or missing). ` +
					'Run `npm run gen:analysis` and commit the result.'
			);
			stale = true;
		}
	}
	if (stale) process.exit(1);
	console.log(
		`[gen:analysis] --check OK: both projections are up to date ` +
			`(${analyses.length} analyses, ${en.length} en / ${fr.length} fr).`
	);
} else {
	for (const [file, output] of outputs) writeFileSync(file, output, 'utf8');
	console.log(
		`[gen:analysis] Wrote ${Object.keys(keyTerms).length} key-term lists → ${KEY_TERMS_FILE}\n` +
			`[gen:analysis] Wrote the corpus summary (${en.length} en / ${fr.length} fr) → ${CORPUS_FILE}`
	);
}
