import type { Item } from './datasets.js';

/**
 * Text rendering of tool results.
 *
 * Search tools return a compact line per hit rather than whole records: a
 * caller that wants everything follows up with the matching `get_*` tool, and
 * returning 25 full publication records instead would spend a large part of the
 * context window on fields nobody asked for. The structured form of the same
 * page, `summariseStructured`, lives in `$lib/utils/apiSearch`, where the site's
 * WebMCP tools share it.
 */

/** One scannable line: id, title, dateline, and the page it lives on. */
export function summarise(item: Item): string {
	const dateline = [item.type, item.year].filter(Boolean).join(' · ');
	const venue =
		item.journal ?? item.book ?? item.conference ?? item.publisher ?? item.years ?? undefined;

	return [
		`${item.title ?? item.id}`,
		dateline && `  ${dateline}`,
		venue && `  ${venue}`,
		`  id: ${item.id}`,
		item.url && `  ${item.url}`
	]
		.filter(Boolean)
		.join('\n');
}

export function summariseAll(items: Item[], total: number, offset = 0): string {
	if (items.length === 0) return 'No matches.';
	const shownThrough = offset + items.length;
	const header =
		total > shownThrough
			? `${items.length} of ${total} matches (showing ${offset + 1}–${shownThrough}; use \`offset: ${shownThrough}\` for the next page):`
			: `${items.length} match${items.length === 1 ? '' : 'es'}:`;
	return [header, '', ...items.map(summarise)].join('\n');
}

/** Full record, pretty-printed. */
export function detail(value: unknown): string {
	return JSON.stringify(value, null, 2);
}
