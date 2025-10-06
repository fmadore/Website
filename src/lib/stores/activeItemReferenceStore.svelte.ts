/**
 * Active Item Reference Store using Svelte 5 State Runes
 *
 * Tracks the ID of the item reference actively opened by click/tap.
 * This ensures only one reference preview is open at a time.
 */

// Svelte 5: Create reactive state using runes
let activeId = $state<string | null>(null);

/**
 * Store-like interface for the active reference ID
 * Provides backward compatibility with the writable store API
 */
export const activeReferenceId = {
	// Subscribe function for reactive access (Svelte 4 compatibility)
	subscribe(fn: (value: string | null) => void) {
		// Use $effect to watch for changes and call the subscriber
		$effect(() => {
			fn(activeId);
		});
		// Return unsubscribe function
		return () => {};
	},

	// Set the active reference ID
	set(value: string | null) {
		activeId = value;
	},

	// Update function for compatibility
	update(fn: (value: string | null) => string | null) {
		activeId = fn(activeId);
	}
};

/**
 * Direct getter function for components using Svelte 5 patterns
 */
export function getActiveReferenceId() {
	return activeId;
}

/**
 * Direct setter function for components using Svelte 5 patterns
 */
export function setActiveReferenceId(value: string | null) {
	activeId = value;
}
