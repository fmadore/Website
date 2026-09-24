import type { CvCommunicationField, HeavyCommunicationField } from '$lib/types/communication';

/**
 * Shared between the summaries generator
 * (scripts/generate-summaries.mjs, which imports this file
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

/** The fields the CV view keeps; see `CvCommunicationField`. */
export const CV_COMMUNICATION_FIELDS = [
	'id',
	'title',
	'authors',
	'type',
	'date',
	'dateISO',
	'location',
	'conference',
	'panelTitle',
	'episode',
	'doi',
	'url'
] as const satisfies readonly CvCommunicationField[];

// Fails to compile if the list above omits a member of the union.
type MissingCvField = Exclude<CvCommunicationField, (typeof CV_COMMUNICATION_FIELDS)[number]>;
export const CV_COMMUNICATION_FIELDS_COMPLETE: MissingCvField extends never ? true : never = true;
