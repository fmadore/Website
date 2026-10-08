/**
 * The prose authored in a route page's markup, as Markdown.
 *
 * The home page and each research project write their narrative directly in
 * `+page.svelte`, because it embeds components — `<ItemReference>` citations,
 * `<RelevantGrants>` — that a data file could not hold. That markup is the one
 * source of the text, so the twin reads it from there (the same raw sources
 * `$lib/server/references` reads) rather than from a copy that could drift.
 *
 * The markup is reduced to plain HTML first: a citation becomes a link
 * carrying the text the page prints, `href={resolve('/x')}` becomes
 * `href="/x"`, and components with nothing to say in text (a button, the
 * grants panel the twin prints as its own section) are dropped. Anything else
 * written in Svelte — an unknown component, a control-flow block, a stray
 * expression — throws, so a page that outgrows this reader fails the build
 * instead of shipping a twin with prose missing.
 */
import { referenceIndex } from '$lib/data/referenceIndex.generated';
import { inlineCitation } from '$lib/utils/inlineCitation';
import { typesetQuotes } from '$lib/utils/typesetQuotes';
import { htmlToMarkdown } from './htmlToMarkdown';
import { resolveLink } from './site';

const PAGE_SOURCES = import.meta.glob<string>(
	[
		'/src/routes/+page.svelte',
		'/src/routes/research/+page.svelte',
		'/src/routes/research/*/+page.svelte'
	],
	{ query: '?raw', import: 'default', eager: true }
);

/** Components whose content the twin either prints elsewhere or has no use for. */
const DROPPED_COMPONENTS = ['RelevantGrants', 'Button'];

/** The index of the `}` closing the expression opened at `open`. */
function closingBrace(source: string, open: number): number {
	let depth = 0;
	for (let index = open; index < source.length; index += 1) {
		if (source[index] === '{') depth += 1;
		else if (source[index] === '}') {
			depth -= 1;
			if (depth === 0) return index;
		}
	}
	throw new Error('Unterminated Svelte expression');
}

/**
 * The markup between `<Component …>` and `</Component>`. The opening tag can
 * span lines and carry `{...spread}` expressions, so its end is found by
 * scanning past braces rather than by regex.
 */
export function componentChildren(source: string, component: string): string {
	const open = source.indexOf(`<${component}`);
	if (open === -1) throw new Error(`No <${component}> in the page`);
	const close = source.lastIndexOf(`</${component}>`);
	if (close === -1) throw new Error(`Unterminated <${component}>`);

	for (let index = open; index < close; index += 1) {
		if (source[index] === '{') index = closingBrace(source, index);
		else if (source[index] === '>') return source.slice(index + 1, close);
	}
	throw new Error(`Could not find the end of the opening <${component}> tag`);
}

/** The first string literal in an expression: `resolve('/x' as …)` → `/x`. */
function firstStringLiteral(expression: string): string | undefined {
	return /(['"`])((?:(?!\1)[^\\]|\\.)*)\1/.exec(expression)?.[2];
}

function citation(attributes: string): string {
	const id = /\bid="([^"]+)"/.exec(attributes)?.[1];
	const label = /\blabel="([^"]*)"/.exec(attributes)?.[1];
	const entry = id ? referenceIndex[id] : undefined;
	if (!entry) throw new Error(`<ItemReference id="${id}"> cites nothing in the reference index`);
	const section = entry.itemType === 'publication' ? 'publications' : 'communications';
	return `<a href="/${section}/${entry.id}">${typesetQuotes(label ?? inlineCitation(entry))}</a>`;
}

/**
 * Turn each `<ItemReference id>` into a link carrying the citation the page
 * prints: its label, or the author–date form. Activity bodies, which are HTML
 * strings rather than Svelte, may cite this way too.
 */
export function citationsToLinks(markup: string): string {
	return markup
		.replace(/<ItemReference\b([^>]*?)\/?>/g, (_, attributes: string) => citation(attributes))
		.replace(/<\/ItemReference>/g, '');
}

/** Reduce Svelte markup to plain HTML. */
export function svelteMarkupToHtml(markup: string): string {
	let html = markup;

	// Comments first, so a commented-out component is not read as live.
	let previous: string;
	do {
		previous = html;
		html = html.replace(/<!--[\s\S]*?-->/g, '');
	} while (html !== previous);

	if (/\{[#:/@]/.test(html)) {
		throw new Error('Prose contains Svelte blocks or tags, which the Markdown twin cannot read');
	}

	html = citationsToLinks(html);

	for (const component of DROPPED_COMPONENTS) {
		html = html
			.replace(new RegExp(`<${component}\\b[^>]*?/>`, 'g'), '')
			.replace(new RegExp(`<${component}\\b[\\s\\S]*?</${component}>`, 'g'), '');
	}

	const unknown = /<([A-Z][\w.]*)/.exec(html);
	if (unknown)
		throw new Error(`Prose contains <${unknown[1]}>, which the Markdown twin cannot read`);

	// Attribute expressions: an address keeps its literal path; anything else
	// (a class directive, a handler) is presentation and goes.
	let out = '';
	let cursor = 0;
	for (let open = html.indexOf('{'); open !== -1; open = html.indexOf('{', cursor)) {
		const close = closingBrace(html, open);
		const expression = html.slice(open + 1, close);
		const attribute = /([\w:-]+)=$/.exec(html.slice(cursor, open));

		if (attribute) {
			const name = attribute[1]!;
			out += html.slice(cursor, open - attribute[0].length);
			const literal = firstStringLiteral(expression);
			if (name === 'href' || name === 'src') {
				if (literal === undefined)
					throw new Error(`Cannot read the address in ${name}={${expression}}`);
				out += `${name}="${literal}"`;
			}
		} else {
			// A text expression: only a string literal (Prettier's `{' '}`) has a reading.
			const trimmed = expression.trim();
			const literal = firstStringLiteral(trimmed);
			if (literal === undefined || trimmed.length !== literal.length + 2) {
				throw new Error(`Prose contains the expression {${expression}}`);
			}
			out += html.slice(cursor, open) + literal;
		}
		cursor = close + 1;
	}
	return out + html.slice(cursor);
}

/** The prose a route page writes inside `container`, as Markdown with twin-aware links. */
export function pageProseMarkdown(routeFile: string, container: string): string {
	const source = PAGE_SOURCES[routeFile];
	if (source === undefined) throw new Error(`No page source at ${routeFile}`);
	return htmlToMarkdown(svelteMarkupToHtml(componentChildren(source, container)), {
		resolveHref: resolveLink
	});
}
