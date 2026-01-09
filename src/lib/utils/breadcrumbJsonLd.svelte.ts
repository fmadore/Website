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
 *   const breadcrumbItems = [
 *     { label: 'Research', href: '/research' },
 *     { label: 'My Project', href: '/research/my-project' }
 *   ];
 *
 *   useBreadcrumbJsonLd(breadcrumbItems);
 * </script>
 * ```
 */

import { browser } from '$app/environment';
import { page } from '$app/stores';
import { get } from 'svelte/store';

/**
 * Breadcrumb item definition for generating JSON-LD
 */
export interface BreadcrumbNavItem {
	label: string;
	href: string;
}

const SCRIPT_ID = 'breadcrumb-json-ld';

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
 * Injects or updates the breadcrumb JSON-LD script in the document head
 */
function injectScript(jsonLdString: string): void {
	if (!browser) return;

	let scriptElement = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

	if (scriptElement) {
		scriptElement.textContent = jsonLdString;
	} else {
		scriptElement = document.createElement('script');
		scriptElement.id = SCRIPT_ID;
		scriptElement.type = 'application/ld+json';
		scriptElement.textContent = jsonLdString;
		document.head.appendChild(scriptElement);
	}
}

/**
 * Removes the breadcrumb JSON-LD script from the document head
 */
function removeScript(): void {
	if (!browser) return;

	const scriptElement = document.getElementById(SCRIPT_ID);
	if (scriptElement && scriptElement.parentElement === document.head) {
		document.head.removeChild(scriptElement);
	}
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
 * @param items - Array of breadcrumb navigation items with label and href
 */
export function useBreadcrumbJsonLd(items: BreadcrumbNavItem[]): void {
	// Use $effect to handle injection and cleanup
	$effect(() => {
		if (!browser) return;

		const origin = get(page).url.origin;
		const jsonLdString = generateBreadcrumbJsonLd(items, origin);

		if (jsonLdString) {
			injectScript(jsonLdString);
		}

		return () => {
			removeScript();
		};
	});
}
