import { test, expect, ready } from './fixtures';
import type { Page } from '@playwright/test';

/**
 * Contrast in the hover state, which no scanner enters.
 *
 * axe evaluates the page at rest, so a hover rule that repaints a label into
 * its own fill passes every scan. That shipped twice in one idiom family:
 * `.pager-item--current` went to 1.00:1 on hover and `.page-btn--current` to
 * 1.92:1 (the September 2026 design audit), both because a family `:hover` rule
 * out-ranked the selected state it sat under, and `.btn-accent:hover` and
 * `.btn-danger:hover` had the midnight version of the same fault.
 *
 * So hover the controls themselves, in both themes, and read the result off
 * the rendered page: every text run inside a hovered control must clear AA
 * against the background actually painted behind it. `/style-guide` renders
 * every control idiom; `/publications` adds the live pagination and facet
 * chips as the index pages ship them. One control per class signature is
 * enough: the rule shape is per class, not per instance.
 */

const ROUTES = ['/style-guide', '/publications'];
const CONTROLS = 'button, a.btn, .chip, .page-btn, .pager-item, .sort-opt, .mono-action';
/** Idioms the sweep must reach, or it has silently stopped testing them. */
const REQUIRED: Record<string, string[]> = {
	'/style-guide': ['chip--selected', 'pager-item--current', 'btn-accent', 'btn-danger'],
	'/publications': ['chip--selected', 'page-btn--current']
};
const AA = 4.5;

interface Probe {
	index: number;
	signature: string;
}

/** Tag one visible, enabled, text-bearing control per class signature. */
async function tagControls(page: Page): Promise<Probe[]> {
	return page.evaluate((selector) => {
		const seen = new Set<string>();
		const probes: { index: number; signature: string }[] = [];
		for (const el of document.querySelectorAll<HTMLElement>(selector)) {
			if ((el as HTMLButtonElement).disabled || !el.checkVisibility()) continue;
			if (!el.textContent?.trim()) continue;
			const box = el.getBoundingClientRect();
			if (box.width < 1 || box.height < 1) continue;
			const signature = `${el.tagName.toLowerCase()}.${[...el.classList].sort().join('.')}`;
			if (seen.has(signature)) continue;
			seen.add(signature);
			el.dataset.hoverProbe = String(probes.length);
			probes.push({ index: probes.length, signature });
		}
		return probes;
	}, CONTROLS);
}

/**
 * The lowest contrast of any text run in the hovered control, with the colours
 * that produced it. Colours are normalised through a canvas, so `color-mix()`
 * and `oklch()` serialisations read the same as `rgb()`; translucent
 * backgrounds are composited up the ancestor chain to the first opaque one.
 */
async function measureHovered(page: Page, index: number) {
	return page.evaluate((i) => {
		const el = document.querySelector<HTMLElement>(`[data-hover-probe="${i}"]`)!;
		const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
		const rgba = (color: string): [number, number, number, number] => {
			ctx.clearRect(0, 0, 1, 1);
			ctx.fillStyle = '#000';
			ctx.fillStyle = color;
			ctx.fillRect(0, 0, 1, 1);
			const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
			return [r!, g!, b!, a! / 255];
		};
		const over = (
			top: [number, number, number, number],
			bottom: [number, number, number, number]
		): [number, number, number, number] => {
			const a = top[3] + bottom[3] * (1 - top[3]);
			if (a === 0) return [0, 0, 0, 0];
			const mix = (t: number, b: number) => (t * top[3] + b * bottom[3] * (1 - top[3])) / a;
			return [mix(top[0], bottom[0]), mix(top[1], bottom[1]), mix(top[2], bottom[2]), a];
		};
		const backgroundOf = (node: Element) => {
			const layers: [number, number, number, number][] = [];
			for (let at: Element | null = node; at; at = at.parentElement) {
				const layer = rgba(getComputedStyle(at).backgroundColor);
				if (layer[3] > 0) layers.push(layer);
				if (layer[3] >= 1) break;
			}
			let painted: [number, number, number, number] = [255, 255, 255, 1];
			for (const layer of layers.reverse()) painted = over(layer, painted);
			return painted;
		};
		const luminance = ([r, g, b]: number[]) => {
			const channel = (c: number) => {
				const s = c / 255;
				return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
			};
			return 0.2126 * channel(r!) + 0.7152 * channel(g!) + 0.0722 * channel(b!);
		};

		let worst = { ratio: Infinity, text: '', color: '', background: '' };
		for (const node of [el, ...el.querySelectorAll<HTMLElement>('*')]) {
			const ownText = [...node.childNodes]
				.filter((child) => child.nodeType === Node.TEXT_NODE)
				.map((child) => child.textContent ?? '')
				.join('')
				.trim();
			if (!ownText || !node.checkVisibility({ opacityProperty: true })) continue;
			const background = backgroundOf(node);
			const color = over(rgba(getComputedStyle(node).color), background);
			const [light, dark] = [luminance(color), luminance(background)].sort((a, b) => b - a);
			const ratio = (light! + 0.05) / (dark! + 0.05);
			if (ratio < worst.ratio) {
				worst = {
					ratio,
					text: ownText.slice(0, 24),
					color: getComputedStyle(node).color,
					background: `rgb(${background.slice(0, 3).map(Math.round).join(',')})`
				};
			}
		}
		return { hovered: el.matches(':hover'), ...worst };
	}, index);
}

for (const theme of ['light', 'dark'] as const) {
	for (const path of ROUTES) {
		test(`${path}: hovered controls keep AA contrast (${theme})`, async ({ page }) => {
			test.setTimeout(90_000);
			await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
			await page.goto(path);
			await ready(page);
			await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`));
			// Read the settled hover colour, not a frame of its transition.
			await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important }' });

			const probes = await tagControls(page);
			const reached = probes.map((probe) => probe.signature).join(' ');
			for (const idiom of REQUIRED[path]!)
				expect(reached, `no ${idiom} on ${path}`).toContain(idiom);

			const failures: string[] = [];
			let measured = 0;
			for (const { index, signature } of probes) {
				const target = page.locator(`[data-hover-probe="${index}"]`);
				await target.scrollIntoViewIfNeeded();
				await target.hover({ force: true });
				const result = await measureHovered(page, index);
				// Covered by sticky chrome at this scroll position: not this control's hover.
				if (!result.hovered) continue;
				measured++;
				if (result.ratio < AA) {
					failures.push(
						`${signature} "${result.text}": ${result.ratio.toFixed(2)}:1 (${result.color} on ${result.background})`
					);
				}
			}
			expect(measured, 'controls actually hovered').toBeGreaterThan(probes.length * 0.8);
			expect(failures).toEqual([]);
		});
	}
}
