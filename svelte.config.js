import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: [vitePreprocess(), mdsvex()],
	compilerOptions: {
		runes: true
	},
	kit: {
		adapter: adapter({
			// default options are shown
			pages: 'build',
			assets: 'build',
			precompress: false,
			strict: true
		}),
		paths: {
			base: ''
		},
		appDir: 'app', // Ensures all generated JS is under this directory
		// Make sure all pages are pre-rendered
		prerender: {
			entries: ['*'],
			handleHttpError: ({ path, message }) => {
				// If the error is a missing page, log a warning but allow build to continue
				// This assumes your 404 handling takes care of it at runtime
				// Note: The original logic for '/Website/' prefix is removed as base path is empty
				console.warn(
					`Potential 404 for ${path} - check routing and 404 handling. Message: ${message}`
				);
				return; // Allow build to continue

				// If you prefer to fail the build on any error uncomment the line below:
				// throw new Error(message);
			}
		},
		serviceWorker: {
			register: true
		}
	},
	extensions: ['.svelte', '.svx']
};

export default config;
