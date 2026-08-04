import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// Note: cssCodeSplit is controlled by SvelteKit internally
		// Use kit.inlineStyleThreshold in svelte.config.js instead
		chunkSizeWarningLimit: 1000, // Warn at 1000KB (1MB) to accommodate large libraries like ECharts
		// 'hidden' emits .map files for local debugging without sourceMappingURL
		// references; the deploy workflow strips *.map before the Pages upload so
		// the multi-MB echarts/maplibre maps (plus .gz/.br copies) never ship.
		sourcemap: 'hidden',
		rolldownOptions: {
			output: {
				// Optimize chunking for better performance and code splitting
				// Only use manualChunks for heavy dynamically-imported libraries
				// Let Rolldown handle natural code splitting for everything else
				manualChunks: (id) => {
					// Heavy charting libraries - dynamically imported, separate chunks
					if (id.includes('echarts')) {
						return 'echarts';
					}

					// D3 — split the DOM/interaction modules (only needed by the
					// lazily-loaded D3BubbleChart) from the scale/math modules
					// (statically imported by CareerTimeline on /cv/timeline).
					// A single merged 'd3' chunk made /cv/timeline eagerly download
					// force/zoom/selection it never uses.
					const d3Interactive = [
						'd3-selection',
						'd3-force',
						'd3-zoom',
						'd3-transition',
						'd3-drag',
						'd3-dispatch',
						'd3-timer',
						'd3-ease',
						'd3-quadtree'
					];
					if (d3Interactive.some((pkg) => id.includes(`node_modules/${pkg}/`))) {
						return 'd3-interactive';
					}
					if (id.includes('node_modules/d3-') || id.includes('node_modules/d3/')) {
						return 'd3-core';
					}

					// NOTE: MapLibre GL is deliberately not pinned to a `maplibre` chunk.
					// Under v5 pinning it hit a Rolldown bug in the UMD/ESM interop
					// (maplibre/maplibre-gl-js#7339); v6 is ESM-only, so that bug is gone,
					// but natural splitting already gives maplibre-gl its own chunk and
					// keeps it off every route that has no map. There is nothing left to
					// pin. Its Web Worker is emitted separately, out of `?worker&url` in
					// `$lib/utils/maplibre.ts` — see that file before touching this.
				}
			}
		}
	},
	css: {
		devSourcemap: true
	}
});
