/**
 * Grants JSON-LD Utility
 *
 * Builds the Schema.org MonetaryGrant graph for a project's grants, for
 * academic discoverability. Pure: the caller renders the result through
 * `<JsonLd>` so it lands in the prerendered HTML.
 *
 * @see https://schema.org/MonetaryGrant
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import JsonLd from '$lib/components/common/JsonLd.svelte';
 *   import { buildGrantsJsonLd, GRANTS_SCRIPT_ID } from '$lib/utils/grantsJsonLd.svelte';
 *
 *   const grantsJsonLd = $derived(
 *     buildGrantsJsonLd('Digital Humanities and AI in African Studies', pageUrl)
 *   );
 * </script>
 *
 * <JsonLd id={GRANTS_SCRIPT_ID} json={grantsJsonLd} />
 * ```
 */

import { allGrants } from '$lib/data/grants/index';
import { createMonetaryGrantSchemas, combineSchemas } from '$lib/utils/seoUtils';

export const GRANTS_SCRIPT_ID = 'grants-json-ld';

/**
 * Builds the MonetaryGrant JSON-LD for a project's grants, or null when the
 * project has none.
 *
 * Pure, so the caller can render it through `<JsonLd>` into `<svelte:head>`.
 * `pageUrl` is passed in rather than read off `page.url`, which during
 * prerendering carries an internal placeholder origin.
 */
export function buildGrantsJsonLd(projectName: string, pageUrl: string): string | null {
	if (!projectName) return null;

	const projectGrants = allGrants.filter((grant) => grant.project === projectName);
	if (projectGrants.length === 0) return null;

	const grantSchemas = createMonetaryGrantSchemas(projectGrants, pageUrl);
	if (grantSchemas.length === 0) return null;

	return combineSchemas(grantSchemas);
}
