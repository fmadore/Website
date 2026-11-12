/**
 * Markup overhead of a prerendered document, for `check-documents.mjs`.
 *
 * A long document that grows with the record (the CV, the bibliography
 * indexes) cannot carry a fixed byte cap without failing, sooner or later, on
 * a pull request that only added an entry. What should never grow by accident
 * is the markup around the words, so the document is cut in three and each
 * part is measured against what it should scale with:
 *
 *   - **shell**: everything outside the content container, JSON-LD aside —
 *     `<head>` and its inlined stylesheet, masthead, footer, Kit's bootstrap.
 *     It is the same whatever the record holds, so it takes an absolute
 *     ceiling in gzip bytes.
 *   - **content density**: gzip(container markup) / gzip(container text).
 *     Adding entries like the existing ones leaves it where it is; a wrapper,
 *     an attribute or an inline icon added to every entry raises it.
 *   - **structured data**: gzip of the JSON-LD blocks. On these pages it
 *     describes the site, the person and the page, not each record, so it
 *     takes an absolute ceiling too; it is kept apart from the shell because
 *     it has its own owner (`jsonLdSchemas.ts`) and its own failure modes.
 *
 * The baseline is the page's own visible text, not its Markdown twin: an index
 * twin lists the whole dataset while the HTML prerenders one page of it, and
 * the visualisation pages have no twin, so only the text of the document
 * itself is a baseline every page shares.
 *
 * Sizes are gzip at zlib's default level, which is what `serve` (the server
 * the Lighthouse job audits) sends and so what `resource-summary` measures.
 *
 * Pure functions over strings, so the script runs them against `build/` and
 * the tests against fixtures.
 */
import { gzipSync } from 'node:zlib';

/** Transfer size of a string: gzip at the default level, in bytes. */
export function gzipBytes(text) {
	return gzipSync(Buffer.from(text, 'utf8')).length;
}

/** Elements whose contents are never read as text. */
const OPAQUE = ['script', 'style', 'svg', 'template', 'noscript'];

/**
 * The `[start, end)` span of the first element carrying `id="…"`, closing tag
 * included, found by counting nested tags of the same name. Comments and the
 * contents of opaque elements are skipped so that neither can unbalance the
 * count. Returns `null` when no element carries the id or it never closes.
 */
export function elementSpan(html, id) {
	const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const open = new RegExp(`<([a-zA-Z][\\w-]*)\\b[^>]*\\sid=(?:"${escaped}"|'${escaped}')[^>]*>`);
	const match = open.exec(html);
	if (!match) return null;
	const tag = match[1].toLowerCase();
	const start = match.index;
	const token = new RegExp(
		`<!--[\\s\\S]*?-->|<(${OPAQUE.join('|')})\\b[^>]*>[\\s\\S]*?</\\1\\s*>|<(/?)${tag}\\b[^>]*?(/?)>`,
		'gi'
	);
	token.lastIndex = start + match[0].length;
	let depth = 1;
	for (let t = token.exec(html); t; t = token.exec(html)) {
		if (t[0].startsWith('<!--') || t[1]) continue;
		if (t[2] === '/') depth -= 1;
		else if (t[3] !== '/') depth += 1;
		if (depth === 0) return [start, t.index + t[0].length];
	}
	return null;
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/**
 * The text a reader gets from a fragment: opaque elements, comments and tags
 * dropped, entities decoded, runs of whitespace collapsed to one space.
 */
export function visibleText(html) {
	return html
		.replace(new RegExp(`<(${OPAQUE.join('|')})\\b[^>]*>[\\s\\S]*?</\\1\\s*>`, 'gi'), ' ')
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, name) => {
			if (name[0] === '#') {
				const code =
					name[1] === 'x' || name[1] === 'X' ? parseInt(name.slice(2), 16) : +name.slice(1);
				return String.fromCodePoint(code);
			}
			return ENTITIES[name.toLowerCase()] ?? entity;
		})
		.replace(/\s+/g, ' ')
		.trim();
}

const STYLE = /<style\b[^>]*>[\s\S]*?<\/style\s*>/gi;

const JSON_LD =
	/<script\b[^>]*type=(?:"application\/ld\+json"|'application\/ld\+json')[^>]*>[\s\S]*?<\/script\s*>/gi;

/**
 * The three parts of a document and their transfer sizes.
 *
 * `shell` is the document with the container's markup and every JSON-LD block
 * cut out (`css` is the inline stylesheet inside it); `content` is the
 * container, tags and all; `text` is its visible text; `structuredData` is the
 * JSON-LD blocks joined. Each part is gzipped on its own, so the parts do not
 * sum exactly to `total` (gzip shares a window across them), but each moves
 * only when its own bytes do, which is what a failure message has to name.
 *
 * @param {string} html the whole document
 * @param {string} containerId the id of the element that holds the content
 */
export function measureDocument(html, containerId) {
	const span = elementSpan(html, containerId);
	if (!span) throw new Error(`no element with id="${containerId}"`);
	const container = html.slice(span[0], span[1]);
	const outside = html.slice(0, span[0]) + html.slice(span[1]);
	const jsonLd = outside.match(JSON_LD) ?? [];
	const shell = outside.replace(JSON_LD, '');
	const css = shell.match(STYLE) ?? [];
	const text = visibleText(container);

	const sizes = {
		total: gzipBytes(html),
		shell: gzipBytes(shell),
		css: css.length ? gzipBytes(css.join('')) : 0,
		content: gzipBytes(container),
		text: gzipBytes(text),
		structuredData: jsonLd.length ? gzipBytes(jsonLd.join('')) : 0
	};
	return {
		...sizes,
		raw: {
			total: Buffer.byteLength(html),
			shell: Buffer.byteLength(shell),
			content: Buffer.byteLength(container),
			text: Buffer.byteLength(text)
		},
		density: sizes.content / sizes.text
	};
}

const kB = (bytes) => `${(bytes / 1000).toFixed(1)} kB`;
const signed = (n, format) => `${n >= 0 ? '+' : '−'}${format(Math.abs(n))}`;
const ratio = (r) => r.toFixed(3);

/**
 * Compare a measurement with its budget.
 *
 * `budget` records the measured `baseline` ({ shell, css, density,
 * structuredData }) and a `ceiling` for shell, density and structuredData.
 * Every breach is returned as one message that names the part, its value, the
 * ceiling and how far it moved from the baseline (for the shell, how much of
 * that is the inline stylesheet; for the density, the bytes the movement is
 * worth at today's text), so the maintainer knows what grew before opening the
 * build.
 *
 * @returns {string[]} one message per breached ceiling, empty when within budget
 */
export function evaluateBudget(measure, budget) {
	const { baseline, ceiling } = budget;
	const failures = [];
	if (measure.shell > ceiling.shell) {
		const cssGrowth = measure.css - baseline.css;
		const otherGrowth = measure.shell - baseline.shell - cssGrowth;
		failures.push(
			`shell (head, inline CSS, header, footer, scripts) is ${kB(measure.shell)} gzip, ` +
				`over its ${kB(ceiling.shell)} ceiling: ${signed(measure.shell - baseline.shell, kB)} ` +
				`since the ${kB(baseline.shell)} baseline (inline CSS ${signed(cssGrowth, kB)}, ` +
				`the rest ${signed(otherGrowth, kB)}). Something every page carries grew.`
		);
	}
	if (measure.density > ceiling.density) {
		const worth = (measure.density - baseline.density) * measure.text;
		failures.push(
			`content density (container markup ÷ its text, gzip) is ${ratio(measure.density)}, ` +
				`over its ${ratio(ceiling.density)} ceiling: ` +
				`${signed(measure.density - baseline.density, ratio)} since the ` +
				`${ratio(baseline.density)} baseline, ${signed(worth, kB)} at today's ` +
				`${kB(measure.text)} of text. Markup per entry grew (a wrapper, attribute or inline icon).`
		);
	}
	if (measure.structuredData > ceiling.structuredData) {
		failures.push(
			`structured data (JSON-LD) is ${kB(measure.structuredData)} gzip, over its ` +
				`${kB(ceiling.structuredData)} ceiling: ` +
				`${signed(measure.structuredData - baseline.structuredData, kB)} since the ` +
				`${kB(baseline.structuredData)} baseline.`
		);
	}
	return failures;
}

/** One line per page for the passing report: each part against its ceiling. */
export function summarise(path, measure, budget) {
	const { ceiling } = budget;
	return (
		`${path}: ${kB(measure.total)} total; shell ${kB(measure.shell)} / ${kB(ceiling.shell)} ` +
		`(CSS ${kB(measure.css)}), density ${ratio(measure.density)} / ${ratio(ceiling.density)} ` +
		`(text ${kB(measure.text)}), JSON-LD ${kB(measure.structuredData)} / ` +
		`${kB(ceiling.structuredData)}`
	);
}
