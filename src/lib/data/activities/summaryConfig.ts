import type { HeavyActivityField } from '$lib/types/activity';

/**
 * Shared between the summaries generator
 * (scripts/generate-summaries.mjs, which imports this file straight
 * from TypeScript under Node's type stripping) and the site, so the projection
 * and its consumers agree on one definition.
 */

/** The fields the projection drops; see `HeavyActivityField`. */
export const HEAVY_ACTIVITY_FIELDS = ['content'] as const satisfies readonly HeavyActivityField[];
