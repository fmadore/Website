/**
 * Generic JSON-LD Script Injection Utility
 *
 * A Svelte 5 runes-based utility for managing JSON-LD structured data scripts.
 * Handles script injection, updates, and cleanup in the document head.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useJsonLdScript } from '$lib/utils/jsonLd.svelte';
 *
 *   const jsonLdContent = $derived(JSON.stringify({
 *     "@context": "https://schema.org",
 *     "@type": "BlogPosting",
 *     "headline": "My Article"
 *   }));
 *
 *   useJsonLdScript('article-json-ld', jsonLdContent);
 * </script>
 * ```
 */

import { browser } from '$app/environment';

/**
 * Injects or updates a JSON-LD script in the document head
 *
 * @param scriptId - Unique ID for the script element
 * @param jsonLdString - The JSON-LD content as a string
 */
function injectScript(scriptId: string, jsonLdString: string): void {
	if (!browser) return;

	let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;

	if (scriptElement) {
		scriptElement.textContent = jsonLdString;
	} else {
		scriptElement = document.createElement('script');
		scriptElement.id = scriptId;
		scriptElement.type = 'application/ld+json';
		scriptElement.textContent = jsonLdString;
		document.head.appendChild(scriptElement);
	}
}

/**
 * Removes a JSON-LD script from the document head
 *
 * @param scriptId - ID of the script element to remove
 */
function removeScript(scriptId: string): void {
	if (!browser) return;

	const scriptElement = document.getElementById(scriptId);
	if (scriptElement && scriptElement.parentElement === document.head) {
		document.head.removeChild(scriptElement);
	}
}

/**
 * Svelte 5 runes-based hook for managing a JSON-LD script in the document head.
 *
 * This function should be called at the top level of a component's script block.
 * It automatically:
 * - Injects the script into the document head
 * - Updates the script when content changes
 * - Cleans up when the component is destroyed
 *
 * @param scriptId - Unique ID for the script element (e.g., 'activity-json-ld')
 * @param jsonLdStringGetter - A function that returns the JSON-LD string (for reactivity)
 */
export function useJsonLdScript(scriptId: string, jsonLdStringGetter: () => string | null | undefined): void {
	$effect(() => {
		if (!browser) return;

		const jsonLdString = jsonLdStringGetter();

		if (jsonLdString) {
			injectScript(scriptId, jsonLdString);
		}

		return () => {
			removeScript(scriptId);
		};
	});
}
