import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

/** D3 packages only the lazily-loaded interactive charts need. */
const D3_INTERACTIVE = [
	'd3-selection',
	'd3-force',
	'd3-zoom',
	'd3-transition',
	'd3-drag',
	'd3-dispatch',
	'd3-timer',
	'd3-ease',
	'd3-quadtree'
];

/**
 * The pure maths D3 packages share: no DOM, no simulation, no interaction.
 *
 * They are pulled out ABOVE `d3-interactive` because a group also captures its
 * modules' dependencies, and the capture decides which chunk depends on which.
 * `d3-transition` imports `d3-color`; with `d3-color` left to the scale side's
 * group, `d3-interactive` swallowed it first, and `/cv/timeline` — which wants
 * nothing but `scaleTime` — followed `d3-scale → d3-interpolate → d3-color`
 * into the interactive chunk and downloaded `d3-force`, `d3-zoom` and
 * `d3-selection` for a static SVG timeline. As their own group the leaves are
 * a dependency of both sides and a dependant of neither, so each page pays for
 * exactly the half it uses. `scripts/checks/check-bundle-budget.mjs` asserts the
 * direction from the built manifest.
 */
const D3_LEAVES = [
	'd3-array',
	'd3-color',
	'd3-format',
	'd3-interpolate',
	'd3-time',
	'd3-time-format'
];

/**
 * The framework runtime every page loads: Svelte, the Kit client, their two
 * tiny dependencies, plus Vite's dynamic-import preload helper and Rolldown's
 * interop runtime. One chunk instead of the half dozen slivers automatic
 * splitting made of it. The two helpers are named here on purpose: a group
 * also captures its modules' dependencies, so if a library group reached them
 * first (jsPDF's optional `import()`s did exactly that), every chunk that
 * uses `import()` would grow a static edge to that library's chunk. Captured
 * into the chunk every page loads anyway, the edge is harmless. (The Iconify
 * component is left to automatic splitting: it rides with the layout, not the
 * entry, which keeps it out of the entry budget check-bundle-budget enforces.)
 */
const FRAMEWORK_RUNTIME =
	/node_modules[\\/](svelte|@sveltejs|esm-env|devalue|clsx)[\\/]|vite[\\/]preload-helper|rolldown[:\\/]runtime/;

/**
 * Kit 3's client entry and the runtime it loads with `import()`, held out of
 * the `framework` group: Kit reads that dynamic import from the client
 * manifest to find the runtime chunk, and a group that captures both files
 * turns it into a same-chunk import the manifest no longer records ("Could
 * not find the client runtime chunk").
 */
const KIT_CLIENT_ENTRIES =
	/@sveltejs[\\/]kit[\\/]src[\\/]runtime[\\/]client[\\/](client-)?entry\.js$/;

/**
 * Site modules eligible for the `shared` chunk group: leaf utilities and the
 * small components several routes reuse. Only these directories, because a
 * group also captures what its modules import, so anything that reaches a
 * dataset or a heavy library is kept out by the deny list below — that is what
 * preserves the dynamic-import boundary scripts/checks/check-bundle-budget.mjs
 * enforces and keeps the datasets in their own per-route chunks.
 */
const APP_SHARED =
	/[\\/]src[\\/]lib[\\/](utils|actions|components[\\/](atoms|molecules|common|menu|entity-index)|SEO\.svelte|data[\\/]siteConfig)/;
const APP_SHARED_DENY =
	/(choropleth|echartsCore|mapPopups|maplibre|networkLayout|pdfRichText|pdfCvGenerator|pdfCvLayout|pdfDesignTokens|useECharts|useMapLibre|grantsJsonLd|imageVariants|jsonLdSchemas|slidePoster|timelineData|vizAggregation|Header\.svelte)/;

/** The tree-shaking wrapper that rides in the `echarts` chunk with the library. */
const ECHARTS_GLUE = /[\\/]src[\\/]lib[\\/]utils[\\/]echartsCore\.ts$/;

/**
 * Hashes of the inline scripts in src/app.html (the theme bootstrap). Kit
 * hashes the scripts it generates itself; the template's are ours to declare.
 * Read from the file, so editing the script changes its hash with it — a
 * hand-copied hash would block the bootstrap the first time anyone touched it.
 */
const templateScriptHashes = [
	...readFileSync(new URL('./src/app.html', import.meta.url), 'utf8').matchAll(
		/<script>([\s\S]*?)<\/script\b[^>]*>/gi
	)
].map(([, body = '']) => `sha256-${createHash('sha256').update(body).digest('base64')}` as const);

/**
 * Svelte's server renderer writes `onload="this.__e=event"` and
 * `onerror="this.__e=event"` on elements with load/error handlers (images,
 * here), so an event that fires before hydration is replayed to the handler.
 * A hash only covers an inline event-handler attribute under 'unsafe-hashes',
 * which then allows exactly the handlers whose hash is listed — this one.
 */
const svelteEventReplayHash =
	`sha256-${createHash('sha256').update('this.__e=event').digest('base64')}` as const;

export default defineConfig({
	plugins: [
		sveltekit({
			preprocess: vitePreprocess(),
			compilerOptions: {
				runes: true
			},
			extensions: ['.svelte'],
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
		})
	],
	// When the build ran, baked into the server and client bundles alike, so a
	// date the page renders is the same in the prerendered HTML and in the
	// client that hydrates it (see #lib/utils/buildDate.ts).
	define: {
		__BUILT_AT__: JSON.stringify(new Date().toISOString())
	},
	build: {
		// Note: cssCodeSplit is controlled by SvelteKit internally
		// Use inlineStyleThreshold in the sveltekit() options above instead
		chunkSizeWarningLimit: 1000, // Warn at 1000KB (1MB) to accommodate large libraries like ECharts
		// 'hidden' emits .map files for local debugging without sourceMappingURL
		// references; the deploy workflow strips *.map before the Pages upload so
		// the multi-MB echarts/maplibre maps (plus .gz/.br copies) never ship.
		sourcemap: 'hidden',
		rolldownOptions: {
			output: {
				// Chunking policy. Rolldown's automatic splitting emits one file per
				// module shared between routes, however small: the index pages were
				// fetching ~30 scripts, two thirds of them under 2 KB. The `shared`
				// group below folds the modules each set of routes shares into one
				// file per set, without making any route load code it does not use.
				codeSplitting: {
					// Groups are processed in priority order, and a group also captures
					// its modules' dependencies (SvelteKit's strict entry signatures rule
					// out switching that off). scripts/checks/check-bundle-budget.mjs verifies
					// on every build that no heavy library became statically reachable.
					groups: [
						// First, so the shared helpers land here (see FRAMEWORK_RUNTIME).
						{
							name: 'framework',
							test: (id) => FRAMEWORK_RUNTIME.test(id) && !KIT_CLIENT_ENTRIES.test(id),
							priority: 100
						},

						// Heavy charting library — dynamically imported, its own chunk.
						// The test deliberately matches the tree-shaking wrapper
						// (echartsCore.ts) too, so the glue rides with the library
						// rather than with the pages. That file and no other: a bare
						// `includes('echarts')` also swept in echartsTooltip.ts, which
						// useECharts imports statically, and so put the whole library
						// on every chart page's static path.
						{
							name: 'echarts',
							test: (id) => id.includes('node_modules/echarts/') || ECHARTS_GLUE.test(id),
							priority: 30
						},

						// D3 — split the DOM/interaction modules (reached only by the
						// lazily-loaded NetworkGraph: d3-force via networkLayout.ts,
						// d3-zoom and d3-selection directly, and d3-transition/d3-drag
						// as d3-zoom's own dependencies) from the scale/math modules
						// (statically imported by CareerTimeline on /cv/timeline).
						// A single merged 'd3' chunk made /cv/timeline eagerly download
						// force/zoom/selection it never uses.
						//
						// First of the three: the shared leaves, so neither side
						// captures them and the interactive chunk stays downstream
						// (see D3_LEAVES).
						{
							name: 'd3-leaves',
							test: (id) => D3_LEAVES.some((pkg) => id.includes(`node_modules/${pkg}/`)),
							priority: 27
						},
						{
							name: 'd3-interactive',
							test: (id) => D3_INTERACTIVE.some((pkg) => id.includes(`node_modules/${pkg}/`)),
							priority: 25
						},
						{
							name: 'd3-core',
							test: (id) => id.includes('node_modules/d3-') || id.includes('node_modules/d3/'),
							priority: 20
						},

						// NOTE: MapLibre GL and jsPDF are deliberately not pinned. Under v5
						// pinning MapLibre hit a Rolldown bug in the UMD/ESM interop
						// (maplibre/maplibre-gl-js#7339); v6 is ESM-only, so that bug is
						// gone, but natural splitting already gives each its own chunk and
						// keeps it off every route that does not use it. MapLibre's Web
						// Worker is emitted separately, out of `?worker&url` in
						// `#lib/utils/maplibre.ts` — see that file before touching this.

						// Site utilities and small components shared by two or more routes.
						// `entriesAware` groups them by the exact set of routes that import
						// them, so a page loads only what it uses.
						//
						// No merge threshold. At 8 KiB it folded each small subgroup into a
						// neighbour, and every fold made passengers: /teaching downloaded
						// the network and chart utilities of the visualisation pages
						// because they had been merged into the chunk holding PageIntro.
						// Across the 26 routes that averaged 17 KiB of minified JS a page
						// never imports, and one unrelated import could reshuffle it —
						// a new edge in siteHelpers once put RecordLayout's JS and CSS on
						// five pages that do not render it. The requests it saved (about
						// five per index page) bought nothing measurable: mobile
						// Lighthouse, three runs each on /, /publications and
						// /conference-activity, scored within noise either way (91/90/94
						// merged, 91/92/92 unmerged). scripts/checks/check-bundle-budget.mjs now
						// fails on any passenger, so re-adding a threshold fails CI.
						{
							name: 'shared',
							test: (id) => APP_SHARED.test(id) && !APP_SHARED_DENY.test(id),
							minShareCount: 2,
							entriesAware: true,
							entriesAwareMergeThreshold: 0,
							priority: 5
						}
					]
				}
			}
		}
	},
	css: {
		devSourcemap: true
	}
});
