import { describe, it, expect } from 'vitest';
import { readFileSync, globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * The print-register guard: the "never add" rules, executable.
 *
 * CLAUDE.md § Styling Rules and § Animation System forbid a list of things —
 * shadows, rounded corners, glass, gradients, `rgba()`, raw colour literals
 * outside the token sheet, keyframes, resting `will-change`, `!important`, and
 * transforms on hover. Every one of them reads as polish in review and none of
 * them is an error anywhere in the toolchain, so each audit found the codebase
 * clean only because someone had just swept it. This test is the sweep.
 *
 * It reads every authored style source (`src/**\/*.css` and every `.svelte`
 * `<style>` block, comments stripped), parses each declaration together with
 * the selectors and at-rules that enclose it, and fails on any of the above.
 * The sanctioned exceptions that exist are named below, each with its file and
 * its reason; an exception that no longer exists fails too, so the cover
 * cannot go stale (the `hairlinePairing` idiom). Two allowances are rules
 * rather than sites, because they are categories the brief itself carves out:
 * `!important` inside a `prefers-reduced-motion` block, and `!important` in the
 * map chrome, which overrides MapLibre's own stylesheet.
 */

const root = fileURLToPath(new URL('..', import.meta.url));

interface Declaration {
	file: string;
	line: number;
	property: string;
	value: string;
	/** Enclosing preludes, outermost first: at-rules and selectors. */
	context: string[];
}

interface Source {
	file: string;
	/** CSS text, comments blanked (newlines kept, so line numbers hold). */
	css: string;
	/** Line of the stylesheet's first character within the file (0-based). */
	offset: number;
	/** Markup outside `<style>` (Svelte only): checked for inline gradients. */
	markup: string;
}

/** Blank comments but keep their newlines, so later line numbers stay true. */
function stripComments(text: string): string {
	return text.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
}

function loadSources(): Source[] {
	return globSync('**/*.{css,svelte}', { cwd: root })
		.map((f) => f.replace(/\\/g, '/'))
		.filter((f) => !f.includes('node_modules'))
		.flatMap((file): Source[] => {
			const text = readFileSync(`${root}/${file}`, 'utf8');
			if (file.endsWith('.css')) return [{ file, css: stripComments(text), offset: 0, markup: '' }];
			const out: Source[] = [];
			const markup = text.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '');
			const re = /<style[^>]*>([\s\S]*?)<\/style>/g;
			let m: RegExpExecArray | null;
			while ((m = re.exec(text))) {
				const start = m.index + m[0].indexOf('>') + 1;
				const offset = text.slice(0, start).split('\n').length - 1;
				out.push({ file, css: stripComments(m[1]!), offset, markup: '' });
			}
			// One markup record per file, so inline `style=""` gradients are seen.
			out.push({ file, css: '', offset: 0, markup: stripComments(markup) });
			return out;
		});
}

/** A brace-tracking pass: enough CSS parsing to know what encloses what. */
function parse(source: Source): Declaration[] {
	const decls: Declaration[] = [];
	const stack: string[] = [];
	const { css } = source;
	let buf = '';
	let bufLine = 0;
	let line = 0;
	let quote: string | null = null;
	let paren = 0;

	const flush = () => {
		const text = buf.trim();
		buf = '';
		if (!text || stack.length === 0) return;
		const colon = text.indexOf(':');
		if (colon < 0 || text.startsWith('@')) return;
		decls.push({
			file: source.file,
			line: source.offset + bufLine + 1,
			property: text.slice(0, colon).trim().toLowerCase(),
			value: text
				.slice(colon + 1)
				.trim()
				.replace(/\s+/g, ' '),
			context: [...stack]
		});
	};

	for (const ch of css) {
		if (ch === '\n') line++;
		if (!buf.trim() && !/\s/.test(ch)) bufLine = line;
		if (quote) {
			buf += ch;
			if (ch === quote) quote = null;
			continue;
		}
		if (ch === '"' || ch === "'") {
			quote = ch;
			buf += ch;
		} else if (ch === '(') {
			paren++;
			buf += ch;
		} else if (ch === ')') {
			paren--;
			buf += ch;
		} else if (ch === '{' && paren === 0) {
			stack.push(buf.trim().replace(/\s+/g, ' '));
			buf = '';
		} else if (ch === ';' && paren === 0) {
			flush();
		} else if (ch === '}' && paren === 0) {
			flush();
			stack.pop();
		} else {
			buf += ch;
		}
	}
	return decls;
}

const sources = loadSources();
const declarations = sources.flatMap(parse);

const inReducedMotion = (d: Declaration) =>
	d.context.some((c) => /^@media.*(prefers-reduced-motion|--reduced-motion)/.test(c));
const inKeyframes = (d: Declaration) => d.context.some((c) => /^@(-webkit-)?keyframes\b/.test(c));
const selectorOf = (d: Declaration) => d.context.filter((c) => !c.startsWith('@')).join(' ');
const site = (d: Declaration) =>
	`${d.file}:${d.line} — ${selectorOf(d)} { ${d.property}: ${d.value} }`;

/**
 * A named exception: the file it lives in, how to recognise the declaration,
 * and why the brief allows it. Every entry must match at least one live site.
 */
interface Exception {
	file: string;
	matches: (d: Declaration) => boolean;
	reason: string;
}

/** The findings of one rule that no exception covers, and the dead exceptions. */
function audit(findings: Declaration[], exceptions: Exception[]) {
	const uncovered = findings
		.filter((d) => !exceptions.some((e) => e.file === d.file && e.matches(d)))
		.map(site);
	const dead = exceptions
		.filter((e) => !findings.some((d) => e.file === d.file && e.matches(d)))
		.map((e) => `${e.file} — ${e.reason}`);
	return { uncovered, dead };
}

describe('the print register', () => {
	it('reads a representative sample of style sources', () => {
		// Guards the parser and the glob: if either collapses, every assertion
		// below passes vacuously.
		expect(sources.filter((s) => s.css).length).toBeGreaterThan(100);
		expect(declarations.length).toBeGreaterThan(5000);
		expect(declarations.some((d) => d.file === 'styles/components/ink-signal.css')).toBe(true);
		expect(declarations.some((d) => inReducedMotion(d))).toBe(true);
	});

	it('casts no shadow, no glow and no glass', () => {
		// `none` is the reset that neutralises an inherited or UA value: allowed.
		const findings = declarations.filter(
			(d) =>
				/^(box-shadow|text-shadow|(-webkit-)?backdrop-filter)$/.test(d.property) &&
				d.value !== 'none'
		);
		const filters = declarations.filter(
			(d) => d.property === 'filter' && /drop-shadow|blur/.test(d.value)
		);
		expect([...findings, ...filters].map(site)).toEqual([]);
	});

	it('keeps every corner square', () => {
		// `--border-radius-sm` and `--border-radius` are legacy names that resolve
		// to 0 by design; prove that here so allowing them stays sound.
		const tokens = readFileSync(`${root}/styles/base/variables.css`, 'utf8');
		expect(tokens).toMatch(/--border-radius-sm:\s*0;/);
		expect(tokens).toMatch(/--border-radius:\s*0;/);

		const findings = declarations.filter(
			(d) =>
				/^border(-[a-z]+)*-radius$/.test(d.property) &&
				!/^(0|var\(--border-radius(-sm)?\))$/.test(d.value)
		);
		const round = (d: Declaration) => d.value === 'var(--border-radius-full)';
		const { uncovered, dead } = audit(findings, [
			{
				file: 'styles/components/network-viz.css',
				matches: (d) => round(d) && selectorOf(d).includes('.viz-legend-swatch--round'),
				reason: 'legend key for a circular node mark: the shape is the encoding'
			},
			{
				file: 'lib/components/visualisations/MapVisualization.svelte',
				matches: (d) => round(d) && selectorOf(d).includes('.legend-swatch'),
				reason: 'legend key for the circular map markers'
			},
			{
				file: 'lib/components/media/MediaPlayer.svelte',
				matches: (d) => round(d) && selectorOf(d).includes('spinner'),
				reason: 'the loading spinner is a ring'
			}
		]);
		expect(uncovered).toEqual([]);
		expect(dead).toEqual([]);
	});

	it('draws no gradient except a real data proportion', () => {
		const findings = declarations.filter((d) => /gradient\(/.test(d.value));
		const { uncovered, dead } = audit(findings, [
			{
				file: 'styles/components/ink-signal.css',
				matches: (d) => /^\.hbar(--current)?$/.test(selectorOf(d)),
				reason: '.hbar: a hard stop whose position is the value (year meter)'
			}
		]);
		expect(uncovered).toEqual([]);
		expect(dead).toEqual([]);

		// Inline `style="…"` gradients in markup, which no <style> block sees.
		const inline = sources.flatMap(({ file, markup }) =>
			markup.split('\n').flatMap((text, i) => (/gradient\(/.test(text) ? [`${file}:${i + 1}`] : []))
		);
		const sanctionedInline = [
			// .viz-legend-ramp: the matrix's continuous weight scale, a real ramp.
			'lib/components/visualisations/NetworkMatrix.svelte',
			// The volume slider's fill: a hard stop at the current volume.
			'lib/components/media/VolumeControl.svelte'
		];
		expect(inline.filter((hit) => !sanctionedInline.includes(hit.split(':')[0]!))).toEqual([]);
		for (const file of sanctionedInline) {
			expect(
				inline.some((hit) => hit.startsWith(`${file}:`)),
				`dead cover: ${file}`
			).toBe(true);
		}
	});

	it('writes colour through tokens: no rgba(), hsla() or hex outside variables.css', () => {
		const findings = declarations.filter(
			(d) =>
				/\b(rgba|hsla)\(/.test(d.value) ||
				(d.file !== 'styles/base/variables.css' && /#[0-9a-fA-F]{3,8}\b/.test(d.value))
		);
		expect(findings.map(site)).toEqual([]);
	});

	it('animates nothing but the loading spinners', () => {
		const keyframes: { file: string; name: string }[] = [];
		for (const { file, css } of sources) {
			for (const m of css.matchAll(/@(?:-webkit-)?keyframes\s+([\w-]+)/g)) {
				keyframes.push({ file, name: m[1]! });
			}
		}
		// Each is a loading indicator: CLAUDE.md § Animation System.
		const sanctioned = [
			{ file: 'lib/components/atoms/Button.svelte', name: 'btn-spin' },
			{ file: 'lib/components/atoms/Button.svelte', name: 'btn-spinner-fill' },
			{ file: 'lib/components/cv/PdfGenerator.svelte', name: 'spin' },
			{ file: 'lib/components/media/MediaPlayer.svelte', name: 'spin' }
		];
		const key = (k: { file: string; name: string }) => `${k.file} @keyframes ${k.name}`;
		expect(keyframes.map(key).sort()).toEqual(sanctioned.map(key).sort());
	});

	it('holds no resting will-change', () => {
		// `will-change: auto` inside a reduced-motion block releases a hint; fine.
		const findings = declarations.filter(
			(d) => d.property === 'will-change' && !(d.value.startsWith('auto') && inReducedMotion(d))
		);
		expect(findings.map(site)).toEqual([]);
	});

	it('moves nothing on hover', () => {
		const findings = declarations.filter(
			(d) =>
				/^(transform|translate|scale|rotate)$/.test(d.property) &&
				!/^none\b/.test(d.value) &&
				!inKeyframes(d) &&
				/:hover/.test(selectorOf(d))
		);
		/**
		 * Two sites write a transform under `:hover` that is not motion. Each is
		 * matched on its exact value, so a real nudge added beside it still fails.
		 */
		const { uncovered, dead } = audit(findings, [
			{
				file: 'lib/components/menu/MobileNavItem.svelte',
				matches: (d) => /^translateY\(-50%\) scaleY\([01]\)$/.test(d.value),
				reason:
					'the left marker is drawn or not (scaleY 0/1, no transition): a state, not a movement'
			},
			{
				file: 'lib/components/media/ProgressBar.svelte',
				matches: (d) => d.value === 'translate(-50%, -50%)',
				reason:
					'restates the resting centring transform; the thumb only fades in (redundant, can go)'
			}
		]);
		expect(uncovered).toEqual([]);
		expect(dead).toEqual([]);
	});

	it('uses !important only where the brief allows it', () => {
		const findings = declarations.filter((d) => /!\s*important$/i.test(d.value));

		/**
		 * Two category allowances, by rule rather than by site:
		 * - inside a `prefers-reduced-motion` block, where it must outrank
		 *   whatever component rule set the motion (CLAUDE.md § Styling Rules);
		 * - the map chrome, which overrides MapLibre's own stylesheet. Matched by
		 *   path so restyling the map does not flap this test: any
		 *   `visualisations/*Map*.svelte`, and a `map-chrome.css` if one appears.
		 */
		const mapChrome = (file: string) =>
			/^lib\/components\/visualisations\/[^/]*Map[^/]*\.svelte$/.test(file) ||
			/(^|\/)map-chrome\.css$/.test(file);
		const categorical = findings.filter((d) => !inReducedMotion(d) && !mapChrome(d.file));

		const { uncovered, dead } = audit(categorical, [
			{
				file: 'routes/cv/+page.svelte',
				matches: (d) => d.context.some((c) => /^@media print/.test(c)),
				reason: "the CV's print sheet, the one documented exception (CLAUDE.md § Styling Rules)"
			},
			{
				file: 'lib/components/cv/CVTableOfContents.svelte',
				matches: (d) => d.context.some((c) => /^@media print/.test(c)) && d.property === 'display',
				reason: "part of the CV's print sheet: the contents rail must not print"
			},
			{
				file: 'lib/components/visualisations/NetworkControls.svelte',
				matches: (d) => selectorOf(d).includes('::-webkit-calendar-picker-indicator'),
				reason: "overrides Chrome's own datalist arrow, a UA (third-party) style"
			},
			{
				file: 'styles/components/buttons.css',
				matches: (d) =>
					/\.btn:disabled/.test(selectorOf(d)) &&
					d.property === 'transform' &&
					d.value.startsWith('none'),
				reason:
					'defensive: a disabled .btn never moves, whatever a consumer adds (no hover transforms remain, so this can go)'
			}
		]);
		expect(uncovered).toEqual([]);
		expect(dead).toEqual([]);
	});
});
