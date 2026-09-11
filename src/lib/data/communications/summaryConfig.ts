import type { HeavyCommunicationField } from '$lib/types/communication';

/**
 * Shared between the summaries generator
 * (scripts/generate-communication-summaries.mjs, which imports this file
 * straight from TypeScript under Node's type stripping) and the site, so the
 * projection and its consumers agree on one definition.
 *
 * The excerpt length is NOT redeclared here: talks and publications truncate
 * abstracts with the same helper at the same lengths, so both projections read
 * `ABSTRACT_EXCERPT_LENGTH` from ../publications/summaryConfig — one constant,
 * one contract.
 */

/** The fields the projection drops; see `HeavyCommunicationField`. */
export const HEAVY_COMMUNICATION_FIELDS = [
	'abstract'
] as const satisfies readonly HeavyCommunicationField[];
