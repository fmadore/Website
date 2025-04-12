import { writable } from 'svelte/store';

// Store the ID of the item reference actively opened by click/tap
export const activeReferenceId = writable<string | null>(null); 