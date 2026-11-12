/**
 * The new-tab notice for authored HTML.
 *
 * Every `target="_blank"` link the site writes in markup carries one visually
 * hidden ` (opens in new tab)` (DESIGN.md § Voice & Copy). Links inside
 * authored bodies — an activity's `content`, a digital-humanities record's
 * `description` — are strings in the data, so no component wrote them and 175
 * went without. This adds the notice to each such anchor at render time, in
 * one place, rather than asking every data file to spell it.
 *
 * Idempotent: an anchor whose text or attributes already say "new tab" (an
 * author who wrote the notice, an `aria-label` that names it) is left alone,
 * and a second pass changes nothing. A pure string transform over trusted
 * markup; it does not sanitise and must not be fed untrusted HTML.
 */

export const NEW_TAB_HINT_HTML = '<span class="sr-only"> (opens in new tab)</span>';

const BLANK_ANCHOR = /<a\b([^>]*?\btarget\s*=\s*(["']?)_blank\2[^>]*)>([\s\S]*?)<\/a>/gi;

export function addNewTabHints(html: string): string {
	if (!html.includes('_blank')) return html;
	return html.replace(BLANK_ANCHOR, (anchor, attributes: string, _quote, inner: string) => {
		if (/new tab/i.test(inner) || /new tab/i.test(attributes)) return anchor;
		return `<a${attributes}>${inner}${NEW_TAB_HINT_HTML}</a>`;
	});
}
