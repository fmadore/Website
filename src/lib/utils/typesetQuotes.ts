/**
 * Quotation marks, typeset.
 *
 * Data files spell quotes however their source spells them — straight
 * ("Peripheries"), English curly (“Religions on Campus”), German
 * („Intellektuelle“), French (« imams chocos ») — and titles are wrapped in a
 * further pair of marks when they render as citations. Left alone that produced
 * two collisions in the CV ledger: a title ending on its own closing quote ran
 * `”"` against the wrapper, and one row could mix registers, e.g.
 * `“Digital Archives…”. 12th European Summer University "Culture & Technology"`.
 *
 * Normalising happens here at render time rather than in the data, so a new
 * entry can be typed faithfully to its source and still typeset correctly. Two
 * entry points:
 *
 * - `typesetQuotes()` — curl marks in place, keeping doubles double
 * - `quoteTitle()`    — wrap a title in double marks, demoting anything inside
 *                       it to singles so the nesting reads
 */

// Typographic marks, spelled out so the intent survives a diff.
const LEFT_DOUBLE = '“'; // “
const RIGHT_DOUBLE = '”'; // ”
const LEFT_SINGLE = '‘'; // ‘
const RIGHT_SINGLE = '’'; // ’ (also the apostrophe)

// Every mark that opens or closes a quotation somewhere in the data files:
// straight, English curly, German low/high, and French guillemets.
const QUOTE_MARK = /['"‘’‚‛“”„‟«»]/;
const DOUBLE_MARK = /["“”„‟«»]/;
const SINGLE_MARK = /['‘’]/;

const WORD_CHAR = /[\p{L}\p{N}]/u;

// Marks whose direction the character itself settles. The rest — straight
// quotes, and the English curly pair that German reuses as its *closing* mark —
// have to be read from their position, which is what lets „Intellektuelle“
// resolve correctly.
const ALWAYS_OPENS = /[«‚‛„‟]/;
const ALWAYS_CLOSES = /[»]/;

// A quotation may only open at the start of the string or after whitespace or an
// opening bracket; anywhere else the mark is closing a quotation.
const OPENS_QUOTATION = /[\s([{—–/]/;

// French sets its guillemets off with a space (« comme ceci »). Once the marks
// become English ones that space is an orphan.
const SPACE = '[ \\t\\u00A0\\u202F]+';
const ORPHAN_AFTER_OPEN = new RegExp(`([${LEFT_DOUBLE}${LEFT_SINGLE}])${SPACE}`, 'g');
const ORPHAN_BEFORE_CLOSE = new RegExp(`${SPACE}([${RIGHT_DOUBLE}${RIGHT_SINGLE}])`, 'g');

/**
 * Curl every quotation mark in a string, reading each mark's direction from its
 * position. `demote` collapses doubles to singles, for text about to be wrapped
 * in double marks of its own.
 */
function curlQuotes(text: string, demote: boolean): string {
	const chars = Array.from(text);
	const curled = chars
		.map((char, i) => {
			if (!QUOTE_MARK.test(char)) return char;

			const isSingle = demote || SINGLE_MARK.test(char);
			const open = isSingle ? LEFT_SINGLE : LEFT_DOUBLE;
			const close = isSingle ? RIGHT_SINGLE : RIGHT_DOUBLE;

			if (ALWAYS_OPENS.test(char)) return open;
			if (ALWAYS_CLOSES.test(char)) return close;

			const prev = chars[i - 1];
			const next = chars[i + 1];

			// Between two word characters it is an apostrophe, not a quotation:
			// l'ouvrage, Islam's, d'Ivoire.
			if (SINGLE_MARK.test(char) && prev && next && WORD_CHAR.test(prev) && WORD_CHAR.test(next)) {
				return RIGHT_SINGLE;
			}

			return prev === undefined || OPENS_QUOTATION.test(prev) ? open : close;
		})
		.join('');

	return curled.replace(ORPHAN_AFTER_OPEN, '$1').replace(ORPHAN_BEFORE_CLOSE, '$1');
}

/**
 * Typesets the quotation marks and apostrophes in a plain-text string, leaving
 * the level of each quotation as it is:
 *
 *   Cluster of Excellence "Africa Multiple"  →  Cluster of Excellence “Africa Multiple”
 *   Cahiers d'études africaines              →  Cahiers d’études africaines
 *   Les « imams chocos »                     →  Les “imams chocos”
 *
 * For plain text only — never pass a string that carries markup, since the
 * quotes around an attribute value would be curled along with the prose.
 */
export function typesetQuotes(text: string | undefined | null): string {
	if (!text) return '';
	return curlQuotes(text, false);
}

/**
 * Same as `typesetQuotes`, for a string that carries markup: only the text
 * between tags is typeset, so quotes around attribute values survive intact.
 *
 * For the trusted static markup in the data files (`<em>`, `<a href>`) — not a
 * general HTML parser, and never for untrusted input.
 */
export function typesetQuotesInHtml(html: string | undefined | null): string {
	if (!html) return '';
	return html.replace(/<[^>]*>|[^<]+/g, (segment) =>
		segment.startsWith('<') ? segment : curlQuotes(segment, false)
	);
}

/**
 * A title that is *itself* nothing but a quotation needs no second pair of
 * marks — drop its own and let the wrapper supply them, so the citation reads
 * “Some Title” rather than “‘Some Title’”.
 */
function unwrapWholeQuotation(title: string): string {
	if (title.length < 3) return title;

	const first = title[0]!;
	const last = title[title.length - 1]!;
	if (!DOUBLE_MARK.test(first) || !DOUBLE_MARK.test(last)) return title;

	const inner = title.slice(1, -1);
	// Another double mark inside means the outer pair is not the only quotation;
	// leave the title alone and let demotion sort the nesting out.
	return DOUBLE_MARK.test(inner) ? title : inner.trim();
}

/**
 * Wraps a title in typographic double quotes for citation display, demoting any
 * quotation the title already carries to single marks:
 *
 *   Workshop “Religions on Campus”  →  “Workshop ‘Religions on Campus’”
 *   Islam's "Peripheries": …        →  “Islam’s ‘Peripheries’: …”
 */
export function quoteTitle(title: string | undefined | null): string {
	const trimmed = title?.trim();
	if (!trimmed) return '';
	return LEFT_DOUBLE + curlQuotes(unwrapWholeQuotation(trimmed), true) + RIGHT_DOUBLE;
}
