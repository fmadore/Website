import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// Note: cssCodeSplit is controlled by SvelteKit internally
		// Use kit.inlineStyleThreshold in svelte.config.js instead
		chunkSizeWarningLimit: 600, // Warn at 600KB instead of 1MB for better awareness
		rollupOptions: {
			output: {
				// Optimize chunking for better performance and code splitting
				manualChunks: (id) => {
					// Heavy charting libraries - dynamically imported, separate chunks
					if (id.includes('echarts')) {
						return 'echarts';
					}
					
					// PDF generation libraries - dynamically imported
					if (id.includes('jspdf')) {
						return 'jspdf';
					}
					if (id.includes('html2canvas')) {
						return 'html2canvas';
					}
					
					// Map libraries - dynamically imported
					if (id.includes('leaflet')) {
						return 'leaflet';
					}
					
					// Icon libraries
					if (id.includes('@iconify') || id.includes('svelte-fa') || id.includes('@fortawesome')) {
						return 'icons';
					}
					
					// Date utilities
					if (id.includes('date-fns')) {
						return 'date-fns';
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
