/**
 * Network monitoring utility for SvelteKit PWA.
 *
 * Tracks online/offline status, updates global state,
 * and prevents PWA install prompts.
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
				console.log('[PWA] Connection restored');
			};

			const handleOffline = () => {
				globalState.isOnline = false;
				console.log('[PWA] Connection lost - offline mode active');
			};

			// Prevent install prompts completely
			const preventInstallPrompt = (e: Event) => {
				e.preventDefault();
			};

			window.addEventListener('online', handleOnline);
			window.addEventListener('offline', handleOffline);
			window.addEventListener('beforeinstallprompt', preventInstallPrompt);

			return () => {
				window.removeEventListener('online', handleOnline);
				window.removeEventListener('offline', handleOffline);
				window.removeEventListener('beforeinstallprompt', preventInstallPrompt);
			};
		}
	});
}
