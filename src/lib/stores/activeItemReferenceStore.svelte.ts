/**
 * Active Item Reference Store using Svelte 5 State Runes
 *
 * Tracks the ID of the item reference actively opened by click/tap.
 * This ensures only one reference preview is open at a time.
 */

// Svelte 5: Create reactive state using runes
let activeId = $state<string | null>(null);

/**
 * Get the active reference ID (reactive in component context)
 */
export function getActiveReferenceId() {
	return activeId;
}

/**
 * Set the active reference ID
 */
export function setActiveReferenceId(value: string | null) {
	activeId = value;
}

/**
 * Update the active reference ID using a function
 */
export function updateActiveReferenceId(fn: (value: string | null) => string | null) {
	activeId = fn(activeId);
}
