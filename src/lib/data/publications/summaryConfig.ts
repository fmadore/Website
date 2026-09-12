import type { HeavyPublicationField } from '$lib/types/publication';

/**
 * Shared between the summaries generator
 * (scripts/generate-publication-summaries.mjs, which imports this file
 * straight from TypeScript under Node's type stripping) and the site, so the
 * projection and its consumers agree on one definition.
 */

/**
 * The longest truncation a list row may apply to an abstract (rows use 200 by
 * default and 180 for the featured standfirst — see PublicationItem). The
 * generator keeps one character more than this, so that for any length up to
 * it, truncating the excerpt yields exactly what truncating the full abstract
 * would — including the ellipsis that marks an abstract as continuing.
 * summaries.test.ts enforces the invariant against the real dataset.
 */
export const ABSTRACT_EXCERPT_LENGTH = 220;

/**
 * The shorter cut a research-project panel row prints of the same excerpt.
 * The panel rail is apparatus pointing at a record, not a reading column, so it
 * shows less than a list row does — but that is one decision, named here beside
 * the excerpt it cuts, rather than a bare literal in the component. It must stay
 * at or below `ABSTRACT_EXCERPT_LENGTH`: the value reaching the panel is already
 * the projected excerpt, so a longer cut here would be a no-op that silently
 * disagreed with its own name.
 */
export const PANEL_EXCERPT_LENGTH = 120;

/** The fields the projection drops; see `HeavyPublicationField`. */
export const HEAVY_PUBLICATION_FIELDS = [
	'abstract',
	'citedBy',
	'tableOfContents',
	'heroImage'
] as const satisfies readonly HeavyPublicationField[];
