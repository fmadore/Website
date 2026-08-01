/**
 * Network monitoring utility for SvelteKit PWA.
 *
 * Tracks online/offline status and updates global state.
 */

import { browser } from '$app/environment';
import { getGlobalState } from '$lib/stores/globalState.svelte';

/**
 * Sets up network status monitoring and PWA install prevention.
 * Must be called at component top-level (uses $effect).
 */
export function useNetworkMonitor() {
	const globalState = getGlobalState();

	$effect(() => {
		if (browser) {
			// Set initial online status
			globalState.isOnline = navigator.onLine;

			const handleOnline = () => {
				globalState.isOnline = true;
				if (import.meta.env.DEV) console.log('[PWA] Connection restored');
			};

			const handleOffline = () => {
				globalState.isOnline = false;
				if (import.meta.env.DEV) console.log('[PWA] Connection lost - offline mode active');
			};

			window.addEventListener('online', handleOnline);
			window.addEventListener('offline', handleOffline);

			return () => {
				window.removeEventListener('online', handleOnline);
				window.removeEventListener('offline', handleOffline);
			};
		}
	});
}
