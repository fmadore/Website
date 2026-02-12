/**
 * Grants JSON-LD Utility
 *
 * A Svelte 5 runes-based utility for managing MonetaryGrant JSON-LD structured data.
 * Filters grants by project name and injects Schema.org MonetaryGrant schemas
 * into the document head for academic discoverability.
 *
 * @see https://schema.org/MonetaryGrant
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useGrantsJsonLd } from '$lib/utils/grantsJsonLd.svelte';
 *
 *   useGrantsJsonLd(() => 'Digital Humanities and AI in African Studies');
 * </script>
 * ```
 */

import { browser } from '$app/environment';
import { page } from '$app/stores';
import { get } from 'svelte/store';
import { allGrants } from '$lib/data/grants/index';
import { createMonetaryGrantSchemas, combineSchemas } from '$lib/utils/seoUtils';
import { useJsonLdScript } from './jsonLd.svelte';

const GRANTS_SCRIPT_ID = 'grants-json-ld';

/**
 * Svelte 5 runes-based hook for managing MonetaryGrant JSON-LD structured data.
 *
 * Filters grants by the given project name, generates MonetaryGrant schemas
 * for awarded grants, and injects them as a combined @graph into the document head.
 *
 * @param projectNameGetter - A function that returns the project name (for reactivity)
 * @param scriptId - Optional custom script ID (defaults to 'grants-json-ld')
 */
export function useGrantsJsonLd(
	projectNameGetter: () => string,
	scriptId: string = GRANTS_SCRIPT_ID
): void {
	useJsonLdScript(scriptId, () => {
		if (!browser) return null;

		const projectName = projectNameGetter();
		if (!projectName) return null;

		const projectGrants = allGrants.filter((grant) => grant.project === projectName);
		if (projectGrants.length === 0) return null;

		const origin = get(page).url.origin;
		const pageUrl = `${origin}${get(page).url.pathname}`;

		const grantSchemas = createMonetaryGrantSchemas(projectGrants, pageUrl);
		if (grantSchemas.length === 0) return null;

		return combineSchemas(grantSchemas);
	});
}
