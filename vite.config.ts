import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// Note: cssCodeSplit is controlled by SvelteKit internally
		// Use kit.inlineStyleThreshold in svelte.config.js instead
		chunkSizeWarningLimit: 1000, // Warn at 1000KB (1MB) to accommodate large libraries like ECharts
		sourcemap: true, // Enable source maps for production debugging and PageSpeed Insights
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

					// D3 - data visualization (dynamically imported)
					if (id.includes('node_modules/d3') || id.includes('d3-')) {
						return 'd3';
					}

					// NOTE: MapLibre GL used to be pinned to its own `maplibre` chunk here,
					// but that triggers a Rolldown bug where the UMD↔ESM interop emits
					// `export { maplibre_gl_exports as n }` without declaring the binding,
					// producing the runtime error
					//   "Export 'maplibre_gl_exports' is not defined in module"
					// (surfaces most reliably in Brave because its shields block the
					// fallback blob: worker and prevent the error from being swallowed).
					// Letting Rolldown natural-split maplibre-gl avoids the faulty export.
					// Tracked in maplibre/maplibre-gl-js#7339.
				}
			}
		}
	},
	css: {
		devSourcemap: true
	}
});
