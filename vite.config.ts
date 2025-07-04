import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		cssCodeSplit: true,
		rollupOptions: {
			output: {
				// Optimize CSS chunking
				manualChunks: {
					// Group critical CSS together
					'critical-styles': ['src/styles/base/variables.css', 'src/styles/base/reset.css'],
					// Separate component styles
					'component-styles': ['src/styles/components/animations.css', 'src/styles/components/buttons.css']
				}
			}
		}
	},
	css: {
		devSourcemap: true
	}
});
