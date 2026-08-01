import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		runes: true
	},
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			strict: true
		}),
		// Inline stylesheets into the prerendered HTML to eliminate
		// render-blocking CSS requests. 20KB covers the shared app stylesheet
		// (~14KB) plus route CSS; the caching trade-off is minor because GitHub
		// Pages caps Cache-Control at max-age=600 anyway.
		inlineStyleThreshold: 20480,
		paths: {
			base: ''
		},
		appDir: 'app', // Ensures all generated JS is under this directory
		// Alias for shared global stylesheets in src/styles, so page-specific
		// CSS can be imported by the components that own it (code-split per
		// route) instead of being bundled into the render-blocking app.css.
		alias: {
			$styles: 'src/styles'
		},
		// Make sure all pages are pre-rendered
		prerender: {
			entries: ['*']
		},
		serviceWorker: {
			// PWAUpdatePrompt owns registration so updates can wait for consent.
			register: false
		}
	},
	extensions: ['.svelte']
};

export default config;
