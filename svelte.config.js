import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

/**
 * Hashes of the inline scripts in src/app.html (the theme bootstrap). Kit
 * hashes the scripts it generates itself; the template's are ours to declare.
 * Read from the file, so editing the script changes its hash with it — a
 * hand-copied hash would block the bootstrap the first time anyone touched it.
 */
const templateScriptHashes = [
	...readFileSync(new URL('./src/app.html', import.meta.url), 'utf8').matchAll(
		/<script>([\s\S]*?)<\/script>/g
	)
].map(([, body]) => `sha256-${createHash('sha256').update(body).digest('base64')}`);

/**
 * Svelte's server renderer writes `onload="this.__e=event"` and
 * `onerror="this.__e=event"` on elements with load/error handlers (images,
 * here), so an event that fires before hydration is replayed to the handler.
 * A hash only covers an inline event-handler attribute under 'unsafe-hashes',
 * which then allows exactly the handlers whose hash is listed — this one.
 */
const svelteEventReplayHash = `sha256-${createHash('sha256').update('this.__e=event').digest('base64')}`;

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
		// Content Security Policy, delivered as a <meta> on every prerendered page
		// (GitHub Pages sets no headers; frame-ancestors therefore cannot be set).
		// Hash mode: Kit hashes its own inline bootstrap, the template's script is
		// hashed above, and so `script-src` needs no 'unsafe-inline' — an injected
		// inline script does not run. Google Analytics loads by `src` from the
		// hosts below (https://developers.google.com/tag-platform/security/guides/csp).
		// `style-src` keeps 'unsafe-inline': Svelte writes style attributes
		// (`style="--pct: 40%"`) and inlines the stylesheet, and while it is
		// present Kit adds no style hashes (a hash would disable it).
		csp: {
			mode: 'hash',
			directives: {
				'default-src': ['self'],
				'script-src': [
					'self',
					'https://*.googletagmanager.com',
					'https://*.google-analytics.com',
					...templateScriptHashes,
					'unsafe-hashes',
					svelteEventReplayHash
				],
				'style-src': ['self', 'unsafe-inline'],
				'font-src': ['self'],
				'img-src': ['self', 'data:', 'https:', 'blob:'],
				'connect-src': [
					'self',
					'https://*.google-analytics.com',
					'https://*.analytics.google.com',
					'https://*.googletagmanager.com',
					'https://api.maptiler.com',
					'https://zenodo.org',
					'https://*.cartocdn.com'
				],
				'frame-src': [
					'self',
					'https://fmadore.github.io',
					'https://zmo-berlin.github.io',
					'https://slides.frederickmadore.com',
					'https://iwac.frederickmadore.com',
					'https://heshmat.zmo.de',
					'https://cdn.knightlab.com'
				],
				'worker-src': ['self', 'blob:'],
				'base-uri': ['self'],
				'form-action': ['self']
			}
		},
		serviceWorker: {
			// PWAUpdatePrompt owns registration so updates can wait for consent.
			register: false
		}
	},
	extensions: ['.svelte']
};

export default config;
