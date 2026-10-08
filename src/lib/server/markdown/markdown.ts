/**
 * Composition helpers for the Markdown twins: escaped text, links, field
 * lists and sections, joined with the blank lines CommonMark wants between
 * blocks. Pure, so every document builder reads the same way and an empty
 * section simply disappears instead of printing a heading over nothing.
 */
import { escapeMarkdownText } from './htmlToMarkdown';

type Block = string | false | null | undefined;

/** Collapse whitespace and escape Markdown syntax in a run of plain text. */
export function inline(text: string | number): string {
	return escapeMarkdownText(String(text).replace(/\s+/g, ' ').trim());
}

/** A link whose text is plain text (escaped here) and whose address is final. */
export function link(text: string, url: string): string {
	return `[${inline(text)}](${url.replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29')})`;
}

/** Join blocks with a blank line, dropping empty ones. */
export function blocks(...parts: Block[]): string {
	return parts
		.filter((part): part is string => typeof part === 'string' && part.trim() !== '')
		.map((part) => part.trim())
		.join('\n\n');
}

/** A whole document: blocks, ending in a single newline. */
export function document(...parts: Block[]): string {
	return `${blocks(...parts)}\n`;
}

/** A heading over its content, or nothing at all when the content is empty. */
export function section(title: string, ...parts: Block[]): string {
	const body = blocks(...parts);
	return body ? `## ${title}\n\n${body}` : '';
}

/** A bullet list; items are Markdown already. */
export function bullets(items: Array<string | false | null | undefined>): string {
	return items
		.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
		.map((item) => `- ${item.trim().replace(/\n(?=.)/g, '\n  ')}`)
		.join('\n');
}

/**
 * The record ledger as a list of labelled values — `- **Date:** 2025` — one
 * row per field present. Values are Markdown already (a link, an escaped
 * string); a row whose value is empty is omitted, as on the page.
 */
export function fields(
	rows: Array<[label: string, value: string | false | null | undefined]>
): string {
	return rows
		.filter((row): row is [string, string] => typeof row[1] === 'string' && row[1].trim() !== '')
		.map(([label, value]) => `- **${label}:** ${value.trim()}`)
		.join('\n');
}

/** A fenced code block, fenced longer than any backtick run inside it. */
export function codeBlock(code: string, language = ''): string {
	const longest = Math.max(2, ...[...code.matchAll(/`+/g)].map((run) => run[0].length));
	const fence = '`'.repeat(longest + 1);
	return `${fence}${language}\n${code.trimEnd()}\n${fence}`;
}

/** An ISO date's year, or the record's own year field. */
export function yearOf(item: { dateISO?: string; year?: number }): number | undefined {
	const fromIso = item.dateISO ? Number.parseInt(item.dateISO.slice(0, 4), 10) : NaN;
	return Number.isNaN(fromIso) ? item.year : fromIso;
}

/** Group items by year, newest first, keeping each group's order. */
export function groupByYear<T extends { dateISO?: string; year?: number }>(
	items: readonly T[]
): Array<[year: string, items: T[]]> {
	const groups = new Map<string, T[]>();
	for (const item of items) {
		const year = String(yearOf(item) ?? 'Undated');
		if (!groups.has(year)) groups.set(year, []);
		groups.get(year)!.push(item);
	}
	return [...groups].sort(([a], [b]) =>
		b === 'Undated' ? -1 : a === 'Undated' ? 1 : Number(b) - Number(a)
	);
}

/** "1 entry", "45 entries" — the glossary's noun for a count. */
export function entries(count: number): string {
	return `${count} ${count === 1 ? 'entry' : 'entries'}`;
}
