/**
 * Text cleaning shared by every citation source.
 *
 * Split out of `check-citations.mjs` when the discovery sources arrived: OpenAlex
 * titles carry publisher markup, Google Books and Wikipedia return search
 * snippets wrapped in `<b>` and `<span class="searchmatch">`, and HAL stores
 * titles with entities intact. All four need the same two-step treatment, and
 * duplicating it once per source is how the steps drift apart.
 */

/** The named entities publisher markup actually uses. */
const ENTITIES = new Map([
	['amp', '&'],
	['lt', '<'],
	['gt', '>'],
	['quot', '"'],
	['apos', "'"],
	['nbsp', ' ']
]);

/** A code point a title can contain: in range, not a control, not a surrogate half. */
const isTextCodePoint = (n) =>
	Number.isInteger(n) && n >= 0x20 && n <= 0x10ffff && !(n >= 0xd800 && n <= 0xdfff);

/**
 * Decode HTML entities in a single pass over the string.
 *
 * A chain of `.replace()` calls cannot do this safely: expanding `&amp;` before
 * `&lt;` walks `&amp;lt;` — which encodes the literal text "&lt;" — all the way
 * down to `<`, inventing markup the source never contained. One pass with a
 * lookup decodes each entity exactly once and never re-reads its own output.
 */
export function decodeEntities(s) {
	return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body) => {
		if (body[0] === '#') {
			const hex = body[1] === 'x' || body[1] === 'X';
			const code = Number.parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10);
			return isTextCodePoint(code) ? String.fromCodePoint(code) : match;
		}
		return ENTITIES.get(body.toLowerCase()) ?? match;
	});
}

/**
 * Remove tags until the string stops changing. One pass is not enough:
 * deleting the inner tag of `<scr<b>ipt>` splices the outer one back together,
 * so a single sweep can *produce* the markup it was meant to remove.
 */
export function stripTags(s) {
	let out = s;
	let previous;
	let passes = 0;
	do {
		previous = out;
		out = out.replace(/<[^>]*>/g, '');
	} while (out !== previous && ++passes < 100);
	return out;
}

/**
 * OpenAlex titles carry publisher markup (`<i>ʿawra</i>`, `<sub>`, entities).
 * Strip it so a pasted `CitingWork` is plain text like every hand-written one.
 *
 * Stripping before decoding is deliberate: an escaped `&lt;i&gt;` was filed as
 * visible text, and decoding first would promote it to a tag that the stripper
 * then eats.
 */
export const cleanTitle = (s) =>
	decodeEntities(stripTags(s ?? ''))
		.replace(/\s+/g, ' ')
		.trim();

/**
 * Reduce a string from an API to inert single-line text, for anything that will
 * be rendered into the report.
 *
 * Every string these four services return is written by someone else — OpenAlex
 * indexes whatever a publisher files, and Google Books, HAL and Wikipedia index
 * whatever anyone wrote — and the report is posted verbatim as a GitHub issue
 * body. So: control characters (a newline ends a bullet early, and an ANSI
 * escape is live in the terminal the script also prints to), backticks (which
 * close the surrounding code fence), and any absurd length.
 *
 * `\s` would not be enough on its own: it covers space, tab and the newlines
 * but leaves the rest of C0 — NUL, ESC, DEL — intact. `\p{Cc}` is every
 * control character in both C0 and C1, named rather than spelled out as a
 * numeric range.
 */
export function flatten(value, maxLength = 500) {
	const text = String(value ?? '')
		.replace(/\p{Cc}+/gu, ' ')
		.replace(/`/g, "'")
		.replace(/\s+/g, ' ')
		.trim();
	return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}
