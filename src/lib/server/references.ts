/**
 * The reference-index entries a page cites, for its server load to hand over.
 *
 * `<ItemReference>` used to import the whole index (123 entries, 79 KiB of
 * source) into every page that printed one inline citation — the home page and
 * four research projects — and into every activity record, whose bodies may
 * cite by id. The citations are fixed at build time, so the pages' loads now
 * look them up here and pass only those entries; `ItemReference` reads them
 * from `page.data.references`. The index itself never leaves the server.
 *
 * Where a citation can live is therefore fixed: in a route's `+page.svelte`,
 * or in an activity's `content`. `npm run gen:refs -- --check` fails on an
 * `<ItemReference>` anywhere else, since no load would supply its entry.
 */
import type { ReferenceIndexEntry } from '$lib/types/referenceIndex';
import { referenceIndex } from '$lib/data/referenceIndex.generated';

/** Same pattern the reference-index generator resolves at build time. */
const CITATION = /<ItemReference\s+[^>]*?\bid="([^"]+)"/g;

const PAGE_SOURCES = import.meta.glob<string>('/src/routes/**/+page.svelte', {
	query: '?raw',
	import: 'default',
	eager: true
});

/** The index entries for every literal ItemReference id cited in `markup`. */
export function referencesIn(markup: string): Record<string, ReferenceIndexEntry> {
	const references: Record<string, ReferenceIndexEntry> = {};
	for (const [, id] of markup.matchAll(CITATION)) {
		const entry = referenceIndex[id!];
		if (entry) references[id!] = entry;
	}
	return references;
}

/** The entries a route's own page cites; `routeId` is the load event's `route.id`. */
export function referencesForRoute(routeId: string | null): Record<string, ReferenceIndexEntry> {
	if (!routeId) return {};
	const source = PAGE_SOURCES[`/src/routes${routeId === '/' ? '' : routeId}/+page.svelte`];
	return source ? referencesIn(source) : {};
}

/**
 * A page load that hands a page the entries its own source cites. A route that
 * cites uses it as (or inside) its `+page.server.ts`; `npm run gen:refs --
 * --check` fails on a citing page without one.
 */
export const citedReferences = ({ route }: { route: { id: string | null } }) => ({
	references: referencesForRoute(route.id)
});
