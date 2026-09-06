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
		// render-blocking CSS requests. The shared app stylesheet has grown to
		// ~68KB raw (~11KB compressed), so the former 20KB ceiling had quietly
		// pushed it back out to a render-blocking <link> on every page — one
		// extra round trip before first paint. 72KB keeps it inline (route CSS
		// is far smaller); the caching trade-off is minor because GitHub Pages
		// caps Cache-Control at max-age=600 anyway. Only the MapLibre sheet
		// (~83KB, loaded with the map) stays external.
		inlineStyleThreshold: 72 * 1024,
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
