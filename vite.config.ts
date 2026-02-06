import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// Note: cssCodeSplit is controlled by SvelteKit internally
		// Use kit.inlineStyleThreshold in svelte.config.js instead
		chunkSizeWarningLimit: 1000, // Warn at 1000KB (1MB) to accommodate large libraries like ECharts
		sourcemap: true, // Enable source maps for production debugging and PageSpeed Insights
		rollupOptions: {
			output: {
				// Optimize chunking for better performance and code splitting
				manualChunks: (id) => {
					// Heavy charting libraries - dynamically imported, separate chunks
					if (id.includes('echarts')) {
						return 'echarts';
					}

					// D3 - data visualization (dynamically imported)
					if (id.includes('node_modules/d3') || id.includes('d3-')) {
						return 'd3';
					}

					// MapLibre GL - mapping library (dynamically imported)
					if (id.includes('maplibre-gl')) {
						return 'maplibre';
					}

					// PDF generation libraries - dynamically imported
					if (id.includes('jspdf')) {
						return 'jspdf';
					}
					if (id.includes('html2canvas')) {
						return 'html2canvas';
					}

					// Icon libraries
					if (id.includes('@iconify') || id.includes('svelte-fa') || id.includes('@fortawesome')) {
						return 'icons';
					}

	// Other vendor dependencies
					if (id.includes('node_modules')) {
						return 'vendor';
					}
				}
			}
		}
	},
	css: {
		devSourcemap: true
	}
});
