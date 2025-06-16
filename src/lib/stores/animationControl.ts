import { writable } from 'svelte/store';

/**
 * A writable store that controls whether animations should play.
 * Set to `false` to prevent new animations from running, e.g., during filtering.
 * Set back to `true` after navigation or when initial animations are desired.
 */
export const animationsEnabled = writable(true); 