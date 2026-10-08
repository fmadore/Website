/**
 * HTML → Markdown for the site's Markdown twins (`/…/*.md`).
 *
 * The HTML this reads is authored, not scraped: activity bodies, digital
 * humanities descriptions, publication abstracts, and the prose of the home
 * and research pages once `svelteProse.ts` has reduced it to plain markup. It
 * uses a small vocabulary — paragraphs, headings, lists, blockquotes, links,
 * emphasis, code — so a dedicated converter of a few hundred lines covers it
 * with nothing to install, and stays in step with how the site itself treats
 * that markup: a visually hidden "(opens in new tab)" and an `aria-hidden`
 * glyph are interface, not content, and are dropped rather than transcribed.
 *
 * Parsing is a real (if forgiving) tokenizer rather than a chain of regex
 * replacements: quoted attribute values may contain `>`, lists nest, and
 * emphasis has to move its surrounding whitespace outside the delimiters for
 * the Markdown to parse back the way the HTML reads. Unknown inline elements
 * are unwrapped, unknown block containers are walked, and embedded or
 * interactive elements (`iframe`, `script`, `svg`, `button`, …) are dropped.
 */

type MarkupNode = TextNode | ElementNode;

interface TextNode {
	type: 'text';
	value: string;
}

interface ElementNode {
	type: 'element';
	tag: string;
	attrs: Record<string, string>;
	children: MarkupNode[];
}

export interface HtmlToMarkdownOptions {
	/**
	 * Rewrite a link or image address — make a site-relative path absolute, or
	 * point an internal page at its own Markdown twin. Defaults to identity.
	 */
	resolveHref?: (href: string) => string;
}

/** Elements that never have children or a closing tag. */
const VOID_ELEMENTS = new Set([
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'link',
	'meta',
	'source',
	'track',
	'wbr'
]);

/** Elements whose content is not read as markup at all. */
const RAW_TEXT_ELEMENTS = new Set(['script', 'style', 'textarea']);

/** Embedded, interactive or presentational elements with no prose to carry. */
const DROPPED_ELEMENTS = new Set([
	'audio',
	'button',
	'canvas',
	'form',
	'iframe',
	'input',
	'noscript',
	'object',
	'picture',
	'script',
	'select',
	'style',
	'svg',
	'template',
	'textarea',
	'video'
]);

/** Elements that start a block of their own. */
const BLOCK_ELEMENTS = new Set([
	'address',
	'article',
	'aside',
	'blockquote',
	'dd',
	'details',
	'div',
	'dl',
	'dt',
	'figcaption',
	'figure',
	'footer',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'header',
	'hr',
	'li',
	'main',
	'nav',
	'ol',
	'p',
	'pre',
	'section',
	'summary',
	'table',
	'tbody',
	'td',
	'tfoot',
	'th',
	'thead',
	'tr',
	'ul'
]);

const NAMED_ENTITIES: Record<string, string> = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' ',
	ensp: ' ',
	emsp: ' ',
	thinsp: ' ',
	shy: '­',
	ndash: '–',
	mdash: '—',
	hellip: '…',
	lsquo: '‘',
	rsquo: '’',
	ldquo: '“',
	rdquo: '”',
	laquo: '«',
	raquo: '»',
	middot: '·',
	bull: '•',
	copy: '©',
	reg: '®',
	trade: '™',
	times: '×',
	deg: '°',
	rarr: '→',
	larr: '←'
};

/**
 * Decode character references in one pass, so `&amp;lt;` becomes the text
 * `&lt;` and is not decoded a second time into `<`. An unknown name is left as
 * written.
 */
export function decodeEntities(text: string): string {
	return text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z][a-z0-9]*);/gi, (match, body: string) => {
		if (body[0] === '#') {
			const code =
				body[1] === 'x' || body[1] === 'X'
					? Number.parseInt(body.slice(2), 16)
					: Number.parseInt(body.slice(1), 10);
			return Number.isFinite(code) && code > 0 && code <= 0x10ffff
				? String.fromCodePoint(code)
				: match;
		}
		return NAMED_ENTITIES[body.toLowerCase()] ?? match;
	});
}

// ── Parsing ──────────────────────────────────────────────────────────────────

const TAG_NAME = /[a-zA-Z][\w:.-]*/y;
const ATTRIBUTE_NAME = /[^\s"'<>/=]+/y;
const UNQUOTED_VALUE = /[^\s>]+/y;
const WHITESPACE = /\s*/y;

function readSticky(pattern: RegExp, source: string, from: number): string | null {
	pattern.lastIndex = from;
	const match = pattern.exec(source);
	return match ? match[0] : null;
}

/** Parse a fragment into a tree. Forgiving: stray closing tags are ignored, unclosed ones end with their parent. */
export function parseHtml(html: string): MarkupNode[] {
	const root: ElementNode = { type: 'element', tag: '#root', attrs: {}, children: [] };
	const stack: ElementNode[] = [root];
	const current = () => stack[stack.length - 1]!;
	const appendText = (raw: string) => {
		if (raw) current().children.push({ type: 'text', value: decodeEntities(raw) });
	};

	let index = 0;
	while (index < html.length) {
		const open = html.indexOf('<', index);
		if (open === -1) {
			appendText(html.slice(index));
			break;
		}
		appendText(html.slice(index, open));

		// Comments, doctypes and other declarations carry no content.
		if (html.startsWith('<!--', open)) {
			const end = html.indexOf('-->', open + 4);
			index = end === -1 ? html.length : end + 3;
			continue;
		}
		if (html[open + 1] === '!' || html[open + 1] === '?') {
			const end = html.indexOf('>', open);
			index = end === -1 ? html.length : end + 1;
			continue;
		}

		// Closing tag: pop back to the matching element, if one is open.
		if (html[open + 1] === '/') {
			const name = readSticky(TAG_NAME, html, open + 2);
			const end = html.indexOf('>', open);
			if (!name || end === -1) {
				appendText(html.slice(open, open + 1));
				index = open + 1;
				continue;
			}
			const tag = name.toLowerCase();
			for (let depth = stack.length - 1; depth > 0; depth -= 1) {
				if (stack[depth]!.tag === tag) {
					stack.length = depth;
					break;
				}
			}
			index = end + 1;
			continue;
		}

		const name = readSticky(TAG_NAME, html, open + 1);
		if (!name) {
			// A bare `<` in text, as in "a < b".
			appendText('<');
			index = open + 1;
			continue;
		}

		// Attributes, with quoted values that may contain `>`.
		const attrs: Record<string, string> = {};
		let cursor = open + 1 + name.length;
		let selfClosing = false;
		while (cursor < html.length) {
			cursor += readSticky(WHITESPACE, html, cursor)?.length ?? 0;
			if (html[cursor] === '>') {
				cursor += 1;
				break;
			}
			if (html.startsWith('/>', cursor)) {
				selfClosing = true;
				cursor += 2;
				break;
			}
			if (html[cursor] === '/') {
				cursor += 1;
				continue;
			}
			const attrName = readSticky(ATTRIBUTE_NAME, html, cursor);
			if (!attrName) {
				cursor += 1; // malformed; skip a character rather than loop
				continue;
			}
			cursor += attrName.length;
			cursor += readSticky(WHITESPACE, html, cursor)?.length ?? 0;
			let value = '';
			if (html[cursor] === '=') {
				cursor += 1;
				cursor += readSticky(WHITESPACE, html, cursor)?.length ?? 0;
				const quote = html[cursor];
				if (quote === '"' || quote === "'") {
					const close = html.indexOf(quote, cursor + 1);
					const end = close === -1 ? html.length : close;
					value = html.slice(cursor + 1, end);
					cursor = end + 1;
				} else {
					value = readSticky(UNQUOTED_VALUE, html, cursor) ?? '';
					cursor += value.length;
				}
			}
			attrs[attrName.toLowerCase()] = decodeEntities(value);
		}

		const tag = name.toLowerCase();
		const element: ElementNode = { type: 'element', tag, attrs, children: [] };
		current().children.push(element);

		if (RAW_TEXT_ELEMENTS.has(tag) && !selfClosing) {
			const close = html.toLowerCase().indexOf(`</${tag}`, cursor);
			const end = close === -1 ? html.length : close;
			element.children.push({ type: 'text', value: html.slice(cursor, end) });
			const closeEnd = close === -1 ? html.length : html.indexOf('>', close);
			index = closeEnd === -1 ? html.length : closeEnd + 1;
			continue;
		}

		if (!selfClosing && !VOID_ELEMENTS.has(tag)) stack.push(element);
		index = cursor;
	}

	return root.children;
}

// ── Rendering ────────────────────────────────────────────────────────────────

interface Block {
	text: string;
	/** A list, which a list item joins to its first line without a blank line. */
	list?: boolean;
}

/**
 * Interface rather than content: a visually hidden "(opens in new tab)", a
 * decorative glyph hidden from assistive technology, or an element the
 * reader cannot see at all.
 */
function isHidden(element: ElementNode): boolean {
	const classes = (element.attrs.class ?? '').split(/\s+/);
	return (
		DROPPED_ELEMENTS.has(element.tag) ||
		classes.includes('sr-only') ||
		classes.includes('visually-hidden') ||
		element.attrs['aria-hidden'] === 'true' ||
		'hidden' in element.attrs
	);
}

function containsBlock(nodes: MarkupNode[]): boolean {
	return nodes.some(
		(node) =>
			node.type === 'element' &&
			!isHidden(node) &&
			(BLOCK_ELEMENTS.has(node.tag) || containsBlock(node.children))
	);
}

function textContent(nodes: MarkupNode[]): string {
	return nodes
		.map((node) => (node.type === 'text' ? node.value : textContent(node.children)))
		.join('');
}

/**
 * Escape what Markdown would read as syntax in running text. An underscore
 * only opens emphasis at a word edge, so `find_related` keeps its own; `&`
 * only needs it where it would start a character reference.
 */
export function escapeMarkdownText(text: string): string {
	return text
		.replace(/[\\`*[\]<]/g, '\\$&')
		.replace(/(?<![\p{L}\p{N}])_|_(?![\p{L}\p{N}])/gu, '\\_')
		.replace(/&(?=#?[a-z0-9]+;)/gi, '\\&');
}

/**
 * A paragraph that happens to open like a heading, quotation, list item or
 * rule would be read as one; escape its first character.
 */
function escapeBlockStart(text: string): string {
	if (/^#{1,6}(?:\s|$)/.test(text) || /^[>+-](?:\s|$)/.test(text)) return `\\${text}`;
	if (/^(?:-{3,}|={3,})\s*$/.test(text)) return `\\${text}`;
	return text.replace(/^(\d+)([.)])(?=\s|$)/, '$1\\$2');
}

/** Encode the characters that would end a Markdown link destination early. */
function escapeUrl(url: string): string {
	return url.replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29');
}

/** Wrap in a delimiter, keeping edge whitespace outside it so it still parses. */
function wrapDelimiter(inner: string, delimiter: string): string {
	const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(inner)!;
	const [, lead, body, trail] = match;
	return body ? `${lead}${delimiter}${body}${delimiter}${trail}` : inner;
}

function codeSpan(text: string): string {
	const collapsed = text.replace(/[ \t\n\r\f]+/g, ' ');
	const longest = Math.max(0, ...[...collapsed.matchAll(/`+/g)].map((run) => run[0].length));
	const fence = '`'.repeat(longest + 1);
	const pad = collapsed.startsWith('`') || collapsed.endsWith('`') ? ' ' : '';
	return `${fence}${pad}${collapsed}${pad}${fence}`;
}

const HARD_BREAK = '\\\n';

function renderInline(nodes: MarkupNode[], options: Required<HtmlToMarkdownOptions>): string {
	let out = '';
	for (const node of nodes) {
		if (node.type === 'text') {
			out += escapeMarkdownText(node.value.replace(/[ \t\n\r\f]+/g, ' '));
			continue;
		}
		if (isHidden(node)) continue;
		const inner = () => renderInline(node.children, options);
		switch (node.tag) {
			case 'br':
				out += HARD_BREAK;
				break;
			case 'em':
			case 'i':
			case 'cite':
			case 'dfn':
			case 'var':
				out += wrapDelimiter(inner(), '*');
				break;
			case 'strong':
			case 'b':
				out += wrapDelimiter(inner(), '**');
				break;
			case 's':
			case 'del':
			case 'strike':
				out += wrapDelimiter(inner(), '~~');
				break;
			case 'code':
			case 'kbd':
			case 'samp':
				out += codeSpan(textContent(node.children));
				break;
			case 'q':
				out += `“${inner()}”`;
				break;
			case 'img': {
				const src = node.attrs.src;
				if (src) {
					const alt = escapeMarkdownText(node.attrs.alt ?? '');
					out += `![${alt}](${escapeUrl(options.resolveHref(src))})`;
				}
				break;
			}
			case 'a': {
				const text = inner();
				const href = node.attrs.href?.trim();
				const label = text.trim();
				if (!href || href.startsWith('#') || /^javascript:/i.test(href) || !label) {
					out += text;
					break;
				}
				const lead = text.match(/^\s*/)![0];
				const trail = text.match(/\s*$/)![0];
				out += `${lead}[${label}](${escapeUrl(options.resolveHref(href))})${trail}`;
				break;
			}
			default:
				out += inner();
		}
	}
	return out;
}

/** Collapse a rendered inline run into the text of one block. */
function finishParagraph(text: string): string {
	return text
		.split('\n')
		.map((line) => line.replace(/ {2,}/g, ' ').trim())
		.join('\n')
		.replace(/^(?:\\\n)+|(?:\\\n)+$/g, '')
		.trim();
}

function indent(text: string, prefix: string, firstPrefix = prefix): string {
	return text
		.split('\n')
		.map((line, index) => (line ? (index === 0 ? firstPrefix : prefix) + line : line))
		.join('\n');
}

function renderList(list: ElementNode, options: Required<HtmlToMarkdownOptions>): Block {
	const ordered = list.tag === 'ol';
	let number = Number.parseInt(list.attrs.start ?? '1', 10) || 1;
	const items: string[] = [];

	for (const child of list.children) {
		if (child.type === 'text') {
			if (child.value.trim()) items.push(`- ${escapeMarkdownText(child.value.trim())}`);
			continue;
		}
		if (isHidden(child)) continue;
		const blocks = renderBlocks(child.tag === 'li' ? child.children : [child], options);
		if (blocks.length === 0) continue;

		const marker = ordered ? `${number}.` : '-';
		number += 1;
		const body = blocks
			.map((block, index) => (index === 0 ? block.text : (block.list ? '\n' : '\n\n') + block.text))
			.join('');
		items.push(indent(body, ' '.repeat(marker.length + 1), `${marker} `));
	}

	return { text: items.join('\n'), list: true };
}

function renderBlock(element: ElementNode, options: Required<HtmlToMarkdownOptions>): Block[] {
	const tag = element.tag;

	if (/^h[1-6]$/.test(tag)) {
		const text = finishParagraph(renderInline(element.children, options)).replace(/\\\n/g, ' ');
		return text ? [{ text: `${'#'.repeat(Number(tag[1]))} ${text}` }] : [];
	}

	switch (tag) {
		case 'ul':
		case 'ol': {
			const list = renderList(element, options);
			return list.text ? [list] : [];
		}
		case 'blockquote': {
			const inner = renderBlocks(element.children, options)
				.map((block) => block.text)
				.join('\n\n');
			return inner
				? [
						{
							text: inner
								.split('\n')
								.map((line) => (line ? `> ${line}` : '>'))
								.join('\n')
						}
					]
				: [];
		}
		case 'pre': {
			const code = textContent(element.children).replace(/^\n/, '').replace(/\s+$/, '');
			if (!code) return [];
			const longest = Math.max(2, ...[...code.matchAll(/`+/g)].map((run) => run[0].length));
			const fence = '`'.repeat(longest + 1);
			const codeElement = element.children.find(
				(child): child is ElementNode => child.type === 'element' && child.tag === 'code'
			);
			const language = /\blanguage-([\w-]+)/.exec(codeElement?.attrs.class ?? '')?.[1] ?? '';
			return [{ text: `${fence}${language}\n${code}\n${fence}` }];
		}
		case 'hr':
			return [{ text: '---' }];
		default:
			// p, div, section, figure, li-less containers and the rest: walk them.
			return renderBlocks(element.children, options);
	}
}

function renderBlocks(nodes: MarkupNode[], options: Required<HtmlToMarkdownOptions>): Block[] {
	const blocks: Block[] = [];
	let run: MarkupNode[] = [];

	const flush = () => {
		const text = finishParagraph(renderInline(run, options));
		if (text) blocks.push({ text: escapeBlockStart(text) });
		run = [];
	};

	for (const node of nodes) {
		const isBlock =
			node.type === 'element' &&
			!isHidden(node) &&
			(BLOCK_ELEMENTS.has(node.tag) || containsBlock(node.children));
		if (isBlock) {
			flush();
			blocks.push(...renderBlock(node, options));
		} else {
			run.push(node);
		}
	}
	flush();
	return blocks;
}

/** Convert an HTML fragment to CommonMark. */
export function htmlToMarkdown(html: string, options: HtmlToMarkdownOptions = {}): string {
	const resolved: Required<HtmlToMarkdownOptions> = {
		resolveHref: options.resolveHref ?? ((href) => href)
	};
	return renderBlocks(parseHtml(html), resolved)
		.map((block) => block.text)
		.join('\n\n')
		.trim();
}

/**
 * Convert text authored as paragraphs separated by blank lines, with inline
 * HTML allowed (`<i>hadj</i>`) — the form abstracts are written in.
 */
export function paragraphsToMarkdown(text: string, options: HtmlToMarkdownOptions = {}): string {
	const html = text
		.split(/\n\s*\n/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean)
		.map((paragraph) => `<p>${paragraph}</p>`)
		.join('');
	return htmlToMarkdown(html, options);
}
