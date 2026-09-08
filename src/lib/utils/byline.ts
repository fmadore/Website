/**
 * The byline — "by A, B and C", typeset.
 *
 * One formatter for the one string every record masthead prints under its
 * title. It existed three times before this file: once in `PageHeader.svelte`
 * (as `formatNameList`, taking `string | string[]` so it could serve the
 * `editors` prop too) and once in `/publications/[id]/+page.svelte` (taking
 * `string[]`), with `/communications/[id]` reaching the first copy through
 * `PageHeader`. All three joined names identically and then typeset the joined
 * string, so the duplication carried no variation worth keeping.
 *
 * The join itself is `joinNames` from `nameUtils` — the shared, parameterised
 * joiner whose defaults ("A, B and C") are exactly what a byline wants. This
 * module adds only the typesetting: names carry apostrophes ("N'Dri",
 * "King's College") that must curl before they reach the page.
 *
 * It lives here rather than in `nameUtils` deliberately: `nameUtils` is bundled
 * by the MCP server through `bibtexGenerator`/`citationFormatter`, and a
 * display-layer typesetter is not something an export format should drag in.
 */
import { joinNames } from './nameUtils';
import { typesetQuotes } from './typesetQuotes';

/**
 * Formats a name or list of names as a display byline: "A", "A and B",
 * "A, B and C". Returns an empty string for empty input, so a caller can
 * gate on the result directly.
 */
export function formatByline(names: string | string[] | undefined | null): string {
	if (!names) return '';
	if (typeof names === 'string') return typesetQuotes(names);
	if (names.length === 0) return '';
	return typesetQuotes(joinNames(names));
}
