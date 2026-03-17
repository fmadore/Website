import type { Handle } from '@sveltejs/kit';

/**
 * Server hook to optimize asset preloading.
 * Skips preloading JS chunks (loaded on-demand) to reduce initial page load.
 */
export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event, {
		preload: ({ type, path }) => {
			// Always preload CSS files
			if (type === 'css') {
				return true;
			}

			// Skip preloading all JS chunks (aggressive optimization)
			// The chunks will still be loaded on-demand during navigation
			// This significantly reduces initial page load for PageSpeed
			if (type === 'js' && path.includes('/chunks/')) {
				// Only preload the critical app entry points and nodes
				// Chunks are dependencies that can be loaded on-demand
				return false;
			}

			// Preload entry points and nodes (page-specific code)
			return true;
		}
	});

	return response;
};
