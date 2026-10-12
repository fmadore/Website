// src/lib/data/citation-contexts/index.ts
import type { CitationContextSet } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';

type ModuleType = Record<string, unknown>;

/**
 * One file per cited publication, named after it. Server code only: the
 * quotations reach `/publications/citations` through its load, never through
 * a client import.
 */
const contextModules = import.meta.glob<ModuleType>(['./*.ts', '!./index.ts', '!./*.test.ts'], {
	eager: true
});

export const citationContextSets: CitationContextSet[] = loadData<CitationContextSet>(
	contextModules,
	[],
	'citation context set'
);
