/**
 * Auto-loading index of publication text analyses.
 * Uses import.meta.glob to automatically import all analysis files.
 *
 * NOTE: this category deliberately does NOT use loadData() (the convention
 * for the other 16 data categories): analyses are a keyed record
 * (publication id → analysis) built from a named `analysis` export, not an
 * array of id-carrying items with a default export, so the shared loader's
 * shape doesn't apply.
 */

import type { PublicationTextAnalysis } from '$lib/types';

// Module type for glob imports
type AnalysisModule = {
	analysis: PublicationTextAnalysis;
};

// Auto-import all analysis files except index.ts
const analysisModules = import.meta.glob<AnalysisModule>(['./*.ts', '!./index.ts'], {
	eager: true
});

// Build the publication analyses record from glob imports
export const publicationAnalyses: Record<string, PublicationTextAnalysis> = {};

for (const [path, module] of Object.entries(analysisModules)) {
	// Extract publication ID from path (e.g., './my-publication.ts' -> 'my-publication')
	const id = path.match(/\.\/(.+)\.ts$/)?.[1];
	if (id && module.analysis) {
		publicationAnalyses[id] = module.analysis;
	}
}

export function getAnalysis(id: string): PublicationTextAnalysis | undefined {
	return publicationAnalyses[id];
}

export function hasAnalysis(id: string): boolean {
	return id in publicationAnalyses;
}

export function getAnalyzedIds(): string[] {
	return Object.keys(publicationAnalyses);
}
