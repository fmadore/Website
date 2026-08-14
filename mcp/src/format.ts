import type { Item } from './datasets.js';

/**
 * Result shaping.
 *
 * Search tools return a compact line per hit rather than whole records: a
 * caller that wants everything follows up with the matching `get_*` tool, and
 * returning 25 full publication records instead would spend a large part of the
 * context window on fields nobody asked for.
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

export interface StructuredSummary {
	id: string;
	title: string;
	type?: string;
	year?: number;
	venue?: string;
	url?: string;
}

export interface StructuredSearchResult {
	total: number;
	count: number;
	offset: number;
	items: StructuredSummary[];
	has_more: boolean;
	next_offset?: number;
}

export function summariseStructured(
	items: Item[],
	total: number,
	offset = 0
): StructuredSearchResult {
	const summaries = items.map((item) => {
		const venue = item.journal ?? item.book ?? item.conference ?? item.publisher ?? item.years;
		return {
			id: item.id,
			title: item.title ?? item.id,
			...(typeof item.type === 'string' ? { type: item.type } : {}),
			...(typeof item.year === 'number' ? { year: item.year } : {}),
			...(typeof venue === 'string' ? { venue } : {}),
			...(typeof item.url === 'string' ? { url: item.url } : {})
		};
	});
	const nextOffset = offset + items.length;

	return {
		total,
		count: items.length,
		offset,
		items: summaries,
		has_more: nextOffset < total,
		...(nextOffset < total ? { next_offset: nextOffset } : {})
	};
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
