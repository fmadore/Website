import { describe, it, expect } from 'vitest';
import { readFileSync, globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * The utility-class guard.
 *
 * The site once carried a Tailwind-shaped vocabulary with no Tailwind behind
 * it: 22 of 74 utility classes had no consumer, and markup carried classes no
 * stylesheet defined at all — `mt-1` on eleven CV detail lines,
 * `hover:underline` on six links, `md:py-10` on the root layout — twenty
 * attribute tokens that styled nothing and read as if they did
 * (docs/audits/2026-09-audit.md). Nothing failed: an unknown class is valid
 * HTML, and an unused rule is valid CSS.
 *
 * Two assertions keep it from growing back:
 *
 * 1. every class a `styles/utilities/` sheet defines has a consumer in the
 *    markup, so a utility goes when its last use does (as CSS-README.md asks);
 * 2. no markup class is shaped like a utility (`mt-1`, `px-4`, `text-sm`,
 *    `sm:flex-row`, …) unless some stylesheet actually defines it.
 */

const root = fileURLToPath(new URL('..', import.meta.url));

const read = (file: string) => readFileSync(`${root}/${file}`, 'utf8');
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Class names a stylesheet defines, with Tailwind-style `\:` escapes undone. */
function definedClasses(css: string): Set<string> {
	const names = new Set<string>();
	for (const match of strip(css).matchAll(/\.((?:[a-zA-Z0-9_-]|\\:)+)/g)) {
		names.add(match[1]!.replace(/\\:/g, ':'));
	}
	return names;
}

const utilitySheets = globSync('styles/utilities/*.css', { cwd: root });
const utilityClasses = new Set(utilitySheets.flatMap((file) => [...definedClasses(read(file))]));

/** Every class defined anywhere: global sheets and component `<style>` blocks. */
const allDefined = new Set(
	globSync('**/*.{css,svelte}', { cwd: root }).flatMap((file) => {
		const text = file.endsWith('.svelte')
			? [...read(file).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n')
			: read(file);
		return [...definedClasses(text)];
	})
);

const markupFiles = globSync('**/*.{svelte,ts,html}', { cwd: root }).filter(
	(file) => !/\.test\.ts$|\.d\.ts$/.test(file)
);

/** Source with its comments removed, so a class quoted in prose is not a use. */
function code(file: string): string {
	return read(file)
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/^\s*\/\/.*$/gm, '');
}

/**
 * Class tokens in markup: static `class="…"` tokens (interpolations dropped)
 * and `class:name` directives — what the undefined-utility check reads.
 */
function markupClasses(): Map<string, string> {
	const found = new Map<string, string>();
	for (const file of markupFiles) {
		const text = code(file);
		const tokens: string[] = [];
		for (const m of text.matchAll(/class="([^"]*)"/g)) {
			tokens.push(...m[1]!.replace(/\{[^}]*\}/g, ' ').split(/\s+/));
		}
		for (const m of text.matchAll(/class:([a-zA-Z0-9_:-]+)/g)) tokens.push(m[1]!);
		for (const token of tokens) if (token && !found.has(token)) found.set(token, file);
	}
	return found;
}

/**
 * Everything that can reach a class attribute, for the orphan check: markup
 * tokens plus every word of every string literal, since components build
 * classes in script (`cardClass = 'related-item p-4'`, a theme toggling
 * `dark`). Generous on purpose — it can only excuse a rule, never flag one.
 */
function reachableClasses(): Set<string> {
	const found = new Set(markupClasses().keys());
	for (const file of markupFiles) {
		for (const m of code(file).matchAll(/(['"`])((?:(?!\1)[^\\\n])*)\1/g)) {
			for (const token of m[2]!.split(/[\s{}$]+/)) if (token) found.add(token);
		}
	}
	return found;
}

const used = markupClasses();
const reachable = reachableClasses();

/** The Tailwind shapes: spacing and sizing steps, type steps, variant prefixes. */
const UTILITY_SHAPE =
	/^(?:[a-z]+:[a-z].*|[mp][trblxy]?-\d+|gap(?:-[xy])?-\d+|[wh]-\d+|(?:min|max)-[wh]-\w+|shrink-\d|grow(?:-\d)?|flex-(?:\d|col|row)|items-\w+|justify-\w+|text-(?:xs|sm|base|lg|[2-9]?xl)|font-(?:medium|semibold|bold|light)|block|inline-block|hidden)$/;

describe('utility classes', () => {
	it('reads real sheets and markup', () => {
		expect(utilitySheets.length).toBeGreaterThan(0);
		expect(utilityClasses).toContain('mx-auto');
		expect(used.size).toBeGreaterThan(500);
	});

	it('defines no utility that nothing uses', () => {
		const orphans = [...utilityClasses].filter((name) => !reachable.has(name));
		expect(orphans).toEqual([]);
	});

	it('uses no utility-shaped class that nothing defines', () => {
		const undefinedUtilities = [...used]
			.filter(([token]) => UTILITY_SHAPE.test(token) && !allDefined.has(token))
			.map(([token, file]) => `${file}: ${token}`);
		expect(undefinedUtilities).toEqual([]);
	});
});
