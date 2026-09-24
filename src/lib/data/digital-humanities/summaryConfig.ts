import type { HeavyDhField } from '$lib/types/digitalHumanities';

/**
 * Shared between the summaries generator (scripts/generate-summaries.mjs,
 * which imports this file straight from TypeScript under Node's type
 * stripping) and the site, so the projection and its consumers agree.
 */

/** The fields the projection drops; see `HeavyDhField`. */
export const HEAVY_DH_FIELDS = [
	'description',
	'embeddableContent'
] as const satisfies readonly HeavyDhField[];
