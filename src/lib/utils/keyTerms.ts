/**
 * Key-terms cloud — sizing a frequency-scaled term list.
 *
 * The house idiom for "what does this corpus talk about" is the Key-Terms
 * Cloud (`.key-terms` in `ink-signal.css`): a serif term list where the type
 * size *is* the corpus frequency. It replaced the bubble packs and the
 * word-cloud canvas, both of which spent a great deal of ink encoding nothing
 * — rotation, hue, spiral position and disc packing are all decorative, and a
 * reader cannot compare two discs by area anyway.
 *
 * This module holds the one thing those components did that was true: mapping
 * a count onto a size. It is pure so the mapping can be tested, and so the two
 * visualisation pages and the publication rail agree about it.
 *
 * The scale is on the square root of the count, not the count itself. Type
 * size reads as area rather than as length, so a linear map on the count makes
 * the leading term look several times more dominant than it is; the sqrt is
 * the standard correction (the same reason a proportional symbol is sized by
 * √value).
 */

/** A term and how often it occurs in the corpus. */
export interface KeyTermCount {
	word: string;
	count: number;
}

/** A term with the font size, in pixels, that encodes its count. */
export interface ScaledKeyTerm extends KeyTermCount {
	size: number;
}

export interface ScaleKeyTermsOptions {
	/** Size in px given to the least frequent retained term. Default 13. */
	min?: number;
	/** Size in px given to the most frequent term. Default 34. */
	max?: number;
	/** How many terms to retain, most frequent first. Default 60. */
	limit?: number;
}

/** Defaults, exported so a caller can state the range it is departing from. */
export const KEY_TERM_MIN_SIZE = 13;
export const KEY_TERM_MAX_SIZE = 34;
export const KEY_TERM_LIMIT = 60;

/**
 * Sorts terms by count (descending, ties broken by term so the output is
 * stable across builds), keeps the top `limit`, and gives each a font size
 * between `min` and `max` on a square-root scale.
 *
 * The scale is fitted to the *retained* window: the smallest term still shown
 * sits at `min`, so truncating the list never leaves the tail bunched at an
 * arbitrary size. When every retained term has the same count — a single term
 * included — the span is degenerate and they all take `max`, since each of
 * them is then the most frequent term in the list.
 *
 * Sizes are rounded to one decimal: enough resolution for the ~21px range, and
 * short enough to inline into a `style` attribute without noise.
 */
export function scaleKeyTerms(
	items: KeyTermCount[],
	opts: ScaleKeyTermsOptions = {}
): ScaledKeyTerm[] {
	const { min = KEY_TERM_MIN_SIZE, max = KEY_TERM_MAX_SIZE, limit = KEY_TERM_LIMIT } = opts;

	if (items.length === 0 || limit <= 0) return [];

	const retained = [...items]
		.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
		.slice(0, limit);

	// Negative counts are not meaningful frequencies; floor at zero so the
	// root stays real rather than producing NaN sizes in the markup.
	const root = (n: number) => Math.sqrt(Math.max(0, n));
	const hi = root(retained[0]!.count);
	const lo = root(retained[retained.length - 1]!.count);
	const span = hi - lo;

	return retained.map((item) => ({
		word: item.word,
		count: item.count,
		size:
			span === 0
				? max
				: Math.round((min + ((root(item.count) - lo) / span) * (max - min)) * 10) / 10
	}));
}
