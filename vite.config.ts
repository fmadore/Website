import { sveltekit } from '@sveltejs/kit/vite';
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
 * Site modules eligible for the `shared` chunk group: leaf utilities and the
 * small components several routes reuse. Only these directories, because a
 * group also captures what its modules import, so anything that reaches a
 * dataset or a heavy library is kept out by the deny list below — that is what
 * preserves the dynamic-import boundary scripts/check-bundle-budget.mjs
 * enforces and keeps the datasets in their own per-route chunks.
 */
const APP_SHARED =
	/[\\/]src[\\/]lib[\\/](utils|actions|components[\\/](atoms|molecules|common|menu|entity-index)|SEO\.svelte|data[\\/]siteConfig)/;
const APP_SHARED_DENY =
	/(choropleth|echartsCore|mapPopups|maplibre|networkLayout|pdfRichText|pdfCvGenerator|pdfCvLayout|pdfDesignTokens|useECharts|useMapLibre|grantsJsonLd|imageVariants|jsonLdSchemas|timelineData|vizAggregation|Header\.svelte)/;

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// Note: cssCodeSplit is controlled by SvelteKit internally
		// Use kit.inlineStyleThreshold in svelte.config.js instead
		chunkSizeWarningLimit: 1000, // Warn at 1000KB (1MB) to accommodate large libraries like ECharts
		// 'hidden' emits .map files for local debugging without sourceMappingURL
		// references; the deploy workflow strips *.map before the Pages upload so
		// the multi-MB echarts/maplibre maps (plus .gz/.br copies) never ship.
		sourcemap: 'hidden',
		rolldownOptions: {
			output: {
				// Chunking policy. Rolldown's automatic splitting emits one file per
				// module shared between routes, however small: the index pages were
				// fetching ~30 scripts, two thirds of them under 2 KB. Every one of
				// those is a request in the critical path of PageSpeed's simulated
				// mobile network, where a round trip costs far more than the bytes.
				// The `shared` group below folds them into a handful of files
				// without making any route load code it does not use.
				codeSplitting: {
					// Groups are processed in priority order, and a group also captures
					// its modules' dependencies (SvelteKit's strict entry signatures rule
					// out switching that off). scripts/check-bundle-budget.mjs verifies
					// on every build that no heavy library became statically reachable.
					groups: [
						// First, so the shared helpers land here (see FRAMEWORK_RUNTIME).
						{ name: 'framework', test: FRAMEWORK_RUNTIME, priority: 100 },

						// Heavy charting library — dynamically imported, its own chunk.
						// The test deliberately matches the tree-shaking wrapper
						// (echartsCore.ts) too, so the glue rides with the library
						// rather than with the pages.
						{ name: 'echarts', test: (id) => id.includes('echarts'), priority: 30 },

						// D3 — split the DOM/interaction modules (reached only by the
						// lazily-loaded NetworkGraph: d3-force via networkLayout.ts,
						// d3-zoom and d3-selection directly, and d3-transition/d3-drag
						// as d3-zoom's own dependencies) from the scale/math modules
						// (statically imported by CareerTimeline on /cv/timeline).
						// A single merged 'd3' chunk made /cv/timeline eagerly download
						// force/zoom/selection it never uses.
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
						// `$lib/utils/maplibre.ts` — see that file before touching this.

						// Site utilities and small components shared by two or more routes.
						// `entriesAware` keeps them grouped by the set of routes that
						// import them (a page still loads only what it uses); the merge
						// threshold then folds the sub-8 KB slivers into their nearest
						// neighbour instead of leaving each as its own request.
						{
							name: 'shared',
							test: (id) => APP_SHARED.test(id) && !APP_SHARED_DENY.test(id),
							minShareCount: 2,
							entriesAware: true,
							entriesAwareMergeThreshold: 8 * 1024,
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
