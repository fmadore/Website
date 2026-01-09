/**
 * Breadcrumb JSON-LD Utility
 *
 * A Svelte 5 runes-based utility for managing breadcrumb JSON-LD structured data.
 * Handles script injection, updates, and cleanup in the document head.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useBreadcrumbJsonLd } from '$lib/utils/breadcrumbJsonLd.svelte';
 *
 *   const breadcrumbItems = $derived([
 *     { label: 'Research', href: '/research' },
 *     { label: 'My Project', href: '/research/my-project' }
 *   ]);
 *
 *   useBreadcrumbJsonLd(() => breadcrumbItems);
 * </script>
 * ```
 */

import { browser } from '$app/environment';
import { page } from '$app/stores';
import { get } from 'svelte/store';
import { useJsonLdScript } from './jsonLd.svelte';

/**
 * Breadcrumb item definition for generating JSON-LD
 */
export interface BreadcrumbNavItem {
	label: string;
	href: string;
}

const BREADCRUMB_SCRIPT_ID = 'breadcrumb-json-ld';

/**
 * Generates the JSON-LD string for breadcrumb structured data
 */
function generateBreadcrumbJsonLd(items: BreadcrumbNavItem[], origin: string): string {
	return JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.label,
			item: `${origin}${item.href}`
		}))
	});
}

/**
 * Svelte 5 runes-based hook for managing breadcrumb JSON-LD structured data.
 *
 * This function should be called at the top level of a component's script block.
 * It automatically:
 * - Generates JSON-LD from the provided breadcrumb items
 * - Injects the script into the document head
 * - Updates the script when items change
 * - Cleans up when the component is destroyed
 *
 * @param itemsGetter - A function that returns the breadcrumb items (for reactivity with $derived)
 * @param scriptId - Optional custom script ID (defaults to 'breadcrumb-json-ld')
 */
export function useBreadcrumbJsonLd(
	itemsGetter: () => BreadcrumbNavItem[],
	scriptId: string = BREADCRUMB_SCRIPT_ID
): void {
	useJsonLdScript(scriptId, () => {
		if (!browser) return null;
		const items = itemsGetter();
		if (!items || items.length === 0) return null;
		const origin = get(page).url.origin;
		return generateBreadcrumbJsonLd(items, origin);
	});
}
