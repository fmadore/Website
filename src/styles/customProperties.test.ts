import { describe, it, expect } from 'vitest';
import { readFileSync, globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * The declared-token guard.
 *
 * A `var(--x)` naming a property nothing declares is not an error anywhere in
 * the toolchain. The declaration holding it becomes invalid at computed-value
 * time and silently drops out, while its neighbours stay valid — so
 * `outline: none; box-shadow: var(--focus-ring)` removes a focus indicator and
 * adds nothing. Lint, `svelte-check`, the unit suite and every axe scan pass.
 * Both instances the audits found were exactly that, on a focus indicator
 * (`--color-focus` in `LocationMap.svelte`, `--focus-ring` in
 * `TimelineDetailCard.svelte`; docs/audits/2026-09-audit.md).
 *
 * So every bare `var(--x)` in the site's own sources must name a property
 * declared somewhere in them: in a stylesheet or `<style>` block, a `style`
 * attribute or `style:--x` directive, or a script that writes it
 * (`setProperty('--x', …)`, a `--x: ${…}` template). A reference with a
 * fallback (`var(--x, 5.5rem)`) is a deliberate override hook and is allowed
 * to go unset; a name built at runtime (`var(--sys-viz-${n})`) cannot be
 * checked here and is skipped.
 *
 * Static by nature: it proves a name is declared somewhere, not that the
 * declaration is in scope where the reference is. It catches the typo and the
 * retired token, which is what has actually shipped.
 */

const root = fileURLToPath(new URL('..', import.meta.url));
const NAME = '--[a-zA-Z0-9_-]+';

interface Source {
	file: string;
	text: string;
}

/** Site code only: tests and generated data state fixtures, not styles. */
function sources(): Source[] {
	return globSync('**/*.{css,svelte,ts,html}', { cwd: root })
		.map((file) => file.replace(/\\/g, '/'))
		.filter((file) => !/\.test\.ts$|\.generated\.ts$|\.d\.ts$/.test(file))
		.map((file) => {
			let text = readFileSync(`${root}/${file}`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
			// Script line comments quote syntax in prose (`// var(--x) form`).
			if (/\.(ts|svelte)$/.test(file)) text = text.replace(/^\s*\/\/.*$/gm, '');
			return { file, text };
		});
}

const all = sources();

function declaredNames(): Set<string> {
	const declared = new Set<string>();
	const patterns = [
		new RegExp(`(?<![\\w-])(${NAME})\\s*:`, 'g'), // --x: in CSS, style="", templates
		new RegExp(`style:(${NAME})`, 'g'), // style:--x={…}
		new RegExp(`setProperty\\(\\s*['"\`](${NAME})`, 'g'),
		new RegExp(`@property\\s+(${NAME})`, 'g')
	];
	for (const { text } of all) {
		for (const pattern of patterns) {
			for (const match of text.matchAll(pattern)) declared.add(match[1]!);
		}
	}
	return declared;
}

const declared = declaredNames();

/** Every `var(--x)` with no fallback, excluding names completed at runtime. */
function bareReferences(): { file: string; name: string }[] {
	const found: { file: string; name: string }[] = [];
	// The name is followed by `)` (bare), `,` (a fallback) or `${` (runtime).
	const reference = new RegExp(`var\\(\\s*(${NAME})(\\$\\{|\\s*[,)])`, 'g');
	for (const { file, text } of all) {
		for (const match of text.matchAll(reference)) {
			const [, name, next] = match;
			if (next!.trim() !== ')') continue;
			found.push({ file, name: name! });
		}
	}
	return found;
}

describe('custom properties', () => {
	it('reads a real token set', () => {
		// A broken glob would make the main assertion vacuous.
		expect(declared.size).toBeGreaterThan(150);
		expect(declared).toContain('--color-border-focus');
		expect(bareReferences().length).toBeGreaterThan(1000);
	});

	it('never references a property nothing declares', () => {
		const undeclared = bareReferences()
			.filter(({ name }) => !declared.has(name))
			.map(({ file, name }) => `${file}: var(${name})`);
		expect([...new Set(undeclared)]).toEqual([]);
	});
});
