/**
 * Auto-loading index of publication text analyses.
 * Uses import.meta.glob to automatically import all analysis files.
 */

import type { PublicationTextAnalysis } from '$lib/types';

// Module type for glob imports
type AnalysisModule = {
	analysis: PublicationTextAnalysis;
};

// Auto-import all analysis files except index.ts
const analysisModules = import.meta.glob<AnalysisModule>(['./!(index).ts'], { eager: true });

// Build the publication analyses record from glob imports
export const publicationAnalyses: Record<string, PublicationTextAnalysis> = {};

for (const [path, module] of Object.entries(analysisModules)) {
	// Extract publication ID from path (e.g., './my-publication.ts' -> 'my-publication')
	const match = path.match(/\.\/(.+)\.ts$/);
	if (match && module.analysis) {
		const id = match[1];
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
