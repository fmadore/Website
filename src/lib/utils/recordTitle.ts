/**
 * Typesetting helpers for a record page's `h1` (`RecordLayout`).
 *
 * Both are pure and text-only: the title is rendered as Svelte text nodes, one
 * per segment, so nothing here ever reaches `{@html}`.
 */

/** Above this many characters a title steps down one size (`--font-size-heading-2`). */
export const LONG_TITLE_CHARS = 90;
/** Above this many characters a title steps down two sizes (`--font-size-heading-3`). */
export const XLONG_TITLE_CHARS = 150;

export type TitleLength = 'long' | 'xlong';

/**
 * The size step a title takes, by length. At the display size a bibliographic
 * title of 200 characters sets twelve lines at 1440 and fills the first screen,
 * so the long ones step down the heading scale. A title at or under
 * `LONG_TITLE_CHARS` keeps the full size and gets no attribute.
 */
export function titleLength(title: string): TitleLength | undefined {
	const length = [...title.trim()].length;
	if (length > XLONG_TITLE_CHARS) return 'xlong';
	if (length > LONG_TITLE_CHARS) return 'long';
	return undefined;
}

export interface TitleSegment {
	text: string;
	/** True for a year range (`1970–2023`), which must not break at its dash. */
	nowrap: boolean;
}

/**
 * A year range: four digits, an en dash or hyphen, four digits, standing alone
 * (not part of a longer number). The browser offers a line break after either
 * dash, so a balanced display title split "1970–" from "2023".
 */
const YEAR_RANGE = /(?<!\d)\d{4}[–-]\d{4}(?!\d)/g;

/**
 * The title cut into runs, each year range its own unbreakable run. Returns a
 * single plain segment when there is no range, so the caller's markup is the
 * same text node it always was.
 */
export function titleSegments(title: string): TitleSegment[] {
	const segments: TitleSegment[] = [];
	let last = 0;
	for (const match of title.matchAll(YEAR_RANGE)) {
		const start = match.index;
		if (start > last) segments.push({ text: title.slice(last, start), nowrap: false });
		segments.push({ text: match[0], nowrap: true });
		last = start + match[0].length;
	}
	if (last < title.length || segments.length === 0) {
		segments.push({ text: title.slice(last), nowrap: false });
	}
	return segments;
}
