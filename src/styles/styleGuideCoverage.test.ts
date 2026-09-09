import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * The style-guide coverage guard.
 *
 * `DESIGN.md` tells every reader to check its claims against `/style-guide`
 * before trusting them, which makes the guide the arbiter of what the system
 * looks like. Nothing enforced that it was complete. The values on the page
 * cannot drift, because they are read live off `:root` — but *coverage* drifted
 * silently for three weeks: `.key-terms` was named a signature component in
 * DESIGN.md, built out on four surfaces, and documented nowhere, alongside
 * `.apparatus-line`, `.rail-plate`, `.meta-link` and `.section--flush`. Lint
 * has no opinion about an undocumented class, and neither does the build.
 *
 * So this test reads the idiom stylesheet rather than restating its contents:
 * every class `ink-signal.css` declares must occur either in the style guide's
 * own source or in the source of a component the guide renders — because a
 * class emitted by `<FacetCombobox>`, `<ContentsLedger>`, `<RecordLedger>` or
 * `<Button>` is documented by the page that renders them, even though the page
 * never types the class itself.
 *
 * That is a coverage test, not a rendering test: it proves the guide mentions
 * every idiom, not that it demonstrates each one well. The second half is a
 * judgement a test cannot make. The first half is exactly the half that rotted.
 *
 * See: DESIGN.md ("when you add a reusable idiom, document it there in the same
 * change"), `/style-guide` § 9 "Colophon — where the system lives", and the
 * sibling guards `trackingScale.test.ts`, `hairlinePairing.test.ts` and
 * `midnightWeight.test.ts`.
 */

const src = fileURLToPath(new URL('..', import.meta.url));

const IDIOM_SHEET = 'styles/components/ink-signal.css';
const GUIDE = 'routes/style-guide/+page.svelte';

/**
 * Sub-part classes that exist only inside another idiom's markup and are
 * covered by documenting the parent.
 *
 * Deliberately empty. Every class in the sheet is either typed on the guide or
 * emitted by a component the guide renders, and an entry added here has to
 * carry the reason it cannot be. An allowlist is where this kind of guard goes
 * to die, so it starts at zero and any growth is a reviewed decision.
 */
const ALLOWED_UNDOCUMENTED: string[] = [];

function read(relative: string): string {
	return readFileSync(`${src}/${relative}`, 'utf8');
}

/**
 * Every top-level class name the stylesheet declares.
 *
 * Comments are stripped first: the sheet's notes name classes that live in
 * other files (`.bib-action`, `.project-prose`, `.pub-search`) and those are
 * not this sheet's to document. What remains is matched inside selector text
 * only — the run before each `{` — so a class named in a `content:` string or a
 * custom-property value is not mistaken for a declaration.
 */
function declaredClasses(css: string): string[] {
	const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
	const names = new Set<string>();
	// Selector text is everything from the end of the previous block or at-rule
	// preamble up to the opening brace; declarations inside a block never match
	// because they are consumed by the preceding block's own scan.
	for (const match of withoutComments.matchAll(/(^|[};])([^{};]*)\{/g)) {
		const selector = match[2] ?? '';
		// At-rule preambles (`@media (--md)`) hold no class selectors.
		if (selector.trimStart().startsWith('@')) continue;
		for (const name of selector.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
			if (name[1]) names.add(name[1]);
		}
	}
	return [...names].sort();
}

/**
 * The `$lib` component sources the guide imports, resolved one level deep.
 *
 * One level is the right depth: the guide is responsible for the idioms it puts
 * on the page, and a component it renders directly is part of that page. A
 * class only reachable three components down is not something the guide can
 * fairly be said to show.
 */
function importedComponentSources(guide: string): { file: string; source: string }[] {
	const script = guide.slice(0, guide.indexOf('</script>'));
	const files = new Set<string>();
	for (const match of script.matchAll(/from\s+'(\$lib\/[^']+\.svelte)'/g)) {
		const spec = match[1];
		if (spec) files.add(spec.replace('$lib/', 'lib/'));
	}
	return [...files]
		.filter((file) => existsSync(`${src}/${file}`))
		.map((file) => ({ file, source: read(file) }));
}

const idiomSheet = read(IDIOM_SHEET);
const guideSource = read(GUIDE);
const componentSources = importedComponentSources(guideSource);

/** A class occurrence, matched as a whole token so `.plate` ≠ `.plate-caption`. */
function occurs(name: string, source: string): boolean {
	return new RegExp(`(?<![\\w-])${name.replace(/[-]/g, '\\-')}(?![\\w-])`).test(source);
}

describe('the style guide documents every idiom it ships', () => {
	const classes = declaredClasses(idiomSheet);

	it('reads a plausible number of classes off the idiom sheet', () => {
		// A guard against the parser silently matching nothing and the suite
		// passing vacuously — the sheet held ~95 classes when this was written.
		expect(classes.length).toBeGreaterThan(60);
	});

	it('resolves the components the guide renders', () => {
		expect(componentSources.length).toBeGreaterThan(0);
	});

	it('shows every class ink-signal.css declares', () => {
		const undocumented = classes.filter((name) => {
			if (ALLOWED_UNDOCUMENTED.includes(name)) return false;
			if (occurs(name, guideSource)) return false;
			return !componentSources.some(({ source }) => occurs(name, source));
		});

		expect(
			undocumented,
			`These idioms ship in ${IDIOM_SHEET} but appear neither on ${GUIDE} nor in a component it ` +
				`renders. Document each one on the style guide in this change — a class the guide never ` +
				`shows is a class DESIGN.md cannot be checked against.`
		).toEqual([]);
	});

	it('keeps the allowlist justified rather than convenient', () => {
		// Anything listed must still be a class the sheet actually declares, so a
		// renamed idiom cannot be quietly exempted by a stale entry.
		for (const name of ALLOWED_UNDOCUMENTED) {
			expect(classes, `${name} is allowlisted but no longer declared`).toContain(name);
		}
		expect(ALLOWED_UNDOCUMENTED.length).toBeLessThanOrEqual(5);
	});
});
