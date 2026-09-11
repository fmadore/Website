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
		// render-blocking CSS requests. This has now silently failed twice: the
		// shared app stylesheet grows, crosses the ceiling, and goes back out to
		// a render-blocking <link> on every page with nothing in the build log
		// to say so. Measured at 79,623 B (~12 KB compressed) when the ceiling
		// was 72 KiB, costing 153 ms before first paint on all eight routes
		// audited. 96 KiB restores the inline with ~16 KB of headroom; the
		// caching trade-off is minor because GitHub Pages caps Cache-Control at
		// max-age=600 anyway. Only the MapLibre sheet (~83KB, loaded with the
		// map) stays external.
		//
		// The guard against a third recurrence is in lighthouserc.yml:
		// `resource-summary:stylesheet:count` is budgeted at the one sheet a
		// page legitimately requests, so an app stylesheet that falls out of the
		// inline fails CI instead of quietly costing a round trip. Raise this
		// ceiling only with the measured size named in the commit.
		inlineStyleThreshold: 96 * 1024,
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
