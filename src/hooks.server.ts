import type { Handle } from '@sveltejs/kit';

/**
 * Heavy chunk names to exclude from preloading.
 * These are updated by the build process or can be maintained manually.
 * 
 * To find heavy chunks after a build, run:
 * Get-ChildItem build/app/immutable/chunks -Filter "*.js" | 
 *   Where-Object { $_.Length -gt 200000 } | 
 *   Select-Object Name, @{N='KB';E={[math]::Round($_.Length/1KB)}}
 * 
 * Then check the content with:
 * Select-String -Path "build/app/immutable/chunks/[FILENAME]" -Pattern "maplibre|echarts|canvg" -List
 */
const HEAVY_CHUNK_PATTERNS = [
	// These are file name patterns (not library names) for chunks > 200KB
	// that contain visualization libraries. They change with each build.
	// Updated approach: exclude by approximate file size thresholds
];

/**
 * Server hook to optimize asset preloading.
 * 
 * Since chunk filenames are hashed and don't contain library names,
 * we use a size-based heuristic: any JS chunk path that's in the 
 * chunks directory and matches known heavy chunk patterns gets excluded.
 * 
 * For now, we rely on the preload callback which receives the path.
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
