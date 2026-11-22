import { describe, it, expect } from 'vitest';
import { readFileSync, globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * The One Rail Rule (DESIGN.md): the masthead, the page and the footer share
 * the global `.container`, and nothing nests a second one. `layout/container.css`
 * has no reset for a nested container, so an inner one applies the gutter
 * twice and caps and centres the block again — the left edge of the record
 * pages, /research, /digital-humanities, /activities, /teaching and
 * /cv/timeline sat one gutter inside the masthead's until the November 2026
 * audit (#212).
 *
 * The root layout's `<main>` holds the page's one `.container`; the chrome
 * outside `<main>` (header, mobile menu, offline notice, footer) opens its own.
 * Every other component and route renders inside `<main>`, so none may carry
 * the class. Cap an inner block with `max-width` instead.
 */

const root = fileURLToPath(new URL('..', import.meta.url));

/** The files that render outside `<main>`, or are `<main>`'s own rail. */
const RAIL_OWNERS = new Set([
	'routes/+layout.svelte',
	'lib/components/menu/Header.svelte',
	'lib/components/menu/MobileMenu.svelte',
	'lib/components/atoms/NetworkStatusIndicator.svelte',
	'lib/components/common/Footer.svelte'
]);

/** Whether any static `class="…"` attribute in the markup carries the `container` token. */
function carriesContainer(source: string): boolean {
	const markup = source
		.replace(/<script[\s\S]*?<\/script>/g, '')
		.replace(/<style[\s\S]*?<\/style>/g, '');
	for (const match of markup.matchAll(/\bclass\s*=\s*(["'])([\s\S]*?)\1/g)) {
		if (match[2]!.split(/\s+/).includes('container')) return true;
	}
	return false;
}

const files = globSync('{routes,lib/components}/**/*.svelte', { cwd: root }).map((file) =>
	file.split(/[\\/]/).join('/')
);

describe('the One Rail Rule', () => {
	it('finds the root layout and the chrome it exempts', () => {
		for (const owner of RAIL_OWNERS) {
			expect(files, owner).toContain(owner);
			expect(carriesContainer(readFileSync(`${root}/${owner}`, 'utf8')), owner).toBe(true);
		}
	});

	it('never nests a .container inside the page rail', () => {
		const offenders = files.filter(
			(file) => !RAIL_OWNERS.has(file) && carriesContainer(readFileSync(`${root}/${file}`, 'utf8'))
		);
		expect(offenders).toEqual([]);
	});
});
