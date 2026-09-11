/**
 * Facet search — the pure matching, ranking and merge logic behind
 * `FacetCombobox`.
 *
 * Kept out of the component so it can be unit-tested in plain Node (see
 * `facetSearch.test.ts`) and so the component holds nothing but ARIA state.
 *
 * Three jobs:
 *
 * - `foldFacetText()` folds a string to the form a reader types: no case, no
 *   diacritics, no typographic apostrophes. The corpus is francophone West
 *   African — "Côte d'Ivoire", "Éducation", "Ahmadiyya" — and nobody reaches for
 *   the compose key inside a filter field.
 * - `matchFacetOptions()` narrows the option universe to what the query matches
 *   and ranks it by live count, so the most productive facet value is the first
 *   row rather than the alphabetically luckiest one.
 * - `visibleFacetOptions()` merges the selected-but-truncated values back into a
 *   capped list. A `?tag=` deep link or a combobox pick must stay visible (and
 *   therefore removable) even when the value sits at rank 60 of 95.
 *
 * Every function takes and returns RAW data values. Typesetting happens at
 * render time only: the raw string is the toggle key, the URL parameter and the
 * counts key, and folding it into the display form would break all three.
 */

/** Combining marks left behind by NFD decomposition. */
const COMBINING_MARKS = /\p{M}/gu;

/** Typographic apostrophes and single quotes, folded to the typed one. */
const CURLY_APOSTROPHES = /[‘’ʼ′]/g;

/**
 * Folds a string for comparison: NFD-decomposed, combining marks stripped,
 * apostrophes normalised, lower-cased. `foldFacetText("Côte d’Ivoire")` and a
 * typed `cote d'ivoire` land on the same string.
 */
export function foldFacetText(value: string): string {
	return value
		.normalize('NFD')
		.replace(COMBINING_MARKS, '')
		.replace(CURLY_APOSTROPHES, "'")
		.toLowerCase();
}

/**
 * Orders options by live count descending, then alphabetically. The count is
 * the disjunctive facet count under every *other* active filter, so the ranking
 * answers "what would narrow this list most" rather than "what is common in the
 * corpus".
 */
export function rankFacetOptions(options: readonly string[], counts: Record<string, number>) {
	return [...options].sort(
		(a, b) =>
			(counts[b] ?? 0) - (counts[a] ?? 0) || a.localeCompare(b, undefined, { numeric: true })
	);
}

/**
 * The options matching `query`, ranked. An empty query matches everything, so
 * the listbox doubles as the "browse all" affordance the old "All N tags ↓"
 * toggle used to be — without laying 95 chips into the page.
 */
export function matchFacetOptions(
	options: readonly string[],
	query: string,
	counts: Record<string, number>
): string[] {
	const needle = foldFacetText(query.trim());
	const pool = needle
		? options.filter((option) => foldFacetText(option).includes(needle))
		: options;
	return rankFacetOptions(pool, counts);
}

/**
 * Does a facet of `total` values need the combobox behind its printed head?
 *
 * The rule, in one place, because it is two decisions that must agree: how many
 * rows `visibleFacetOptions()` prints, and whether the component renders a
 * `FacetCombobox` under them. A facet only one value over the limit is printed
 * whole — hiding a single row behind a control costs the reader more than the
 * row costs the page, and it was exactly that case (Countries, 9 values over a
 * limit of 8) that grew a second long-facet idiom beside this one.
 */
export function needsFacetCombobox(total: number, limit: number): boolean {
	return total > limit + 1;
}

/**
 * The options to print: the whole list when it is at most one value over the
 * limit (see `needsFacetCombobox`), otherwise the first `limit` plus any
 * selected value that the cut would have hidden (in the option order, after the
 * head). Without that merge a deep-linked or combobox-picked rarity would
 * filter the list while being invisible — active with no way to switch it off.
 */
export function visibleFacetOptions(
	options: readonly string[],
	limit: number,
	selected: readonly string[]
): string[] {
	if (!needsFacetCombobox(options.length, limit)) return [...options];
	const head = options.slice(0, limit);
	if (selected.length === 0) return head;
	const hidden = options.slice(limit).filter((option) => selected.includes(option));
	return hidden.length > 0 ? [...head, ...hidden] : head;
}
