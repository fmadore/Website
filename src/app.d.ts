// The GeoJSON ambient namespace (choropleth.ts, MapVisualization) comes from
// @types/geojson, a direct devDependency; until 2026-09-09 it rode in on a
// transitive dependency of echarts-wordcloud and vanished with it.
/// <reference types="geojson" />

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
