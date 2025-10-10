import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// Note: cssCodeSplit is controlled by SvelteKit internally
		// Use kit.inlineStyleThreshold in svelte.config.js instead
		chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
		rollupOptions: {
			output: {
				// Optimize chunking for better performance
				manualChunks: (id) => {
					// Put node_modules in vendor chunk
					if (id.includes('node_modules')) {
						return 'vendor';
					}
					// Put chart components together
					if (id.includes('/visualisations/') && id.includes('ECharts')) {
						return 'chart-components';
					}
					// Put data files together
					if (id.includes('/data/publications/') || id.includes('/data/communications/')) {
						return 'data';
					}
				}
			}
		}
	},
	css: {
		devSourcemap: true
	}
});
