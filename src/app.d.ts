// The GeoJSON ambient namespace (choropleth.ts, MapVisualization) comes from
// @types/geojson, a direct devDependency; until 2026-09-09 it rode in on a
// transitive dependency of echarts-wordcloud and vanished with it.
/// <reference types="geojson" />

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	/** ISO timestamp of the build, from `define` in vite.config.ts; read it through `$lib/utils/buildDate`. */
	const __BUILT_AT__: string;

	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			/**
			 * The reference-index entries a page's inline citations need, keyed by
			 * id, from its server load (`$lib/server/references`). Read by
			 * `<ItemReference>`; absent on pages that cite nothing.
			 */
			references?: Record<string, import('$lib/types/referenceIndex').ReferenceIndexEntry>;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
