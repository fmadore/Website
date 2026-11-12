import { describe, it, expect } from 'vitest';
import academiconsDoi from '@iconify-icons/academicons/doi';
import academiconsGoogleScholar from '@iconify-icons/academicons/google-scholar';
import academiconsOrcid from '@iconify-icons/academicons/orcid';
import academiconsPublons from '@iconify-icons/academicons/publons';
import academiconsResearchgate from '@iconify-icons/academicons/researchgate';
import mdiEmail from '@iconify-icons/mdi/email';
import mdiGithub from '@iconify-icons/mdi/github';
import mdiLinkedin from '@iconify-icons/mdi/linkedin';
import mdiMapMarker from '@iconify-icons/mdi/map-marker';
import mdiRss from '@iconify-icons/mdi/rss';
import mdiWeb from '@iconify-icons/mdi/web';
import lucideContrast from '@iconify-icons/lucide/contrast';
import lucideFileText from '@iconify-icons/lucide/file-text';
import lucideMap from '@iconify-icons/lucide/map';
import {
	compactBody,
	compactPath,
	glyphId,
	glyphStep,
	parsePath,
	pathPoints
} from './glyphPath.ts';

/** Largest distance, on either axis, between corresponding points of two paths. */
function maxDeviation(a: string, b: string): number {
	const pa = pathPoints(a);
	const pb = pathPoints(b);
	expect(pb).toHaveLength(pa.length);
	return Math.max(
		0,
		...pa.map(([x, y], i) => {
			const [bx, by] = pb[i] ?? [Infinity, Infinity];
			return Math.max(Math.abs(x - bx), Math.abs(y - by));
		})
	);
}

describe('glyphId', () => {
	it('turns an Iconify name into a valid fragment id', () => {
		expect(glyphId('academicons:doi')).toBe('glyph-academicons-doi');
		expect(glyphId('simple-icons:bluesky')).toBe('glyph-simple-icons-bluesky');
	});
});

describe('glyphStep', () => {
	it('is the largest power of ten at most 1/200 of the box', () => {
		expect(glyphStep(24, 24)).toBeCloseTo(0.1);
		expect(glyphStep(16, 16)).toBeCloseTo(0.01);
		expect(glyphStep(384, 512)).toBe(1);
		expect(glyphStep(512, 512)).toBe(1);
		expect(glyphStep(2000, 2000)).toBe(10);
	});
});

describe('parsePath', () => {
	it('reads packed numbers, implicit repeats and arc flags written without separators', () => {
		expect(parsePath('M1.5.5l-1-2 3 4a1 1 0 011 1z')).toEqual([
			{ command: 'M', args: [1.5, 0.5] },
			{ command: 'l', args: [-1, -2] },
			{ command: 'l', args: [3, 4] },
			{ command: 'a', args: [1, 1, 0, 0, 1, 1, 1] },
			{ command: 'z', args: [] }
		]);
	});

	it('makes a moveto’s further pairs linetos of the same case', () => {
		expect(parsePath('m1 1 2 2M3 3 4 4').map((s) => s.command)).toEqual(['m', 'l', 'M', 'L']);
	});

	it('refuses what it cannot read', () => {
		expect(() => parsePath('1 2')).toThrow();
		expect(() => parsePath('M1 2 X')).toThrow();
		expect(() => parsePath('M0 0a1 1 0 2 1 1 1')).toThrow();
	});
});

describe('pathPoints', () => {
	it('resolves relative, horizontal, vertical and closing segments to absolute points', () => {
		expect(pathPoints('M10 10h5v5l-5 0zm1 1c1 1 2 2 3 3')).toEqual([
			[10, 10],
			[15, 10],
			[15, 15],
			[10, 15],
			[11, 11],
			[12, 12],
			[13, 13],
			[14, 14]
		]);
	});
});

describe('compactPath', () => {
	it('keeps every point within half a step, with no drift along relative segments', () => {
		// A thousand relative steps of 0.04 each: rounding each offset alone to
		// 0.1 would drop them all and end 40 units short.
		const long = `M0 0${'l.04 .04'.repeat(1000)}`;
		const compact = compactPath(long, 0.1);
		expect(maxDeviation(long, compact)).toBeLessThanOrEqual(0.05 + 1e-9);
		expect(pathPoints(compact).at(-1)?.[0]).toBeCloseTo(40, 6);
	});

	it('round-trips a path already on the grid', () => {
		expect(compactPath('M2 3h4v-5l-1.5 2z', 0.1)).toBe('M2 3h4v-5l-1.5 2z');
	});

	it('writes implicit repeats and drops redundant separators', () => {
		expect(compactPath('M 0.25 0.75 L 1.25 -1.75 L 2.04 3.06', 0.1)).toBe('M.3.8 1.3-1.7 2 3.1');
	});

	it('rounds arc radii in place and leaves the flags alone', () => {
		expect(compactPath('M0 0a2.04 2.04 0 0 1 4.08 0', 0.1)).toBe('M0 0a2 2 0 0 1 4.1 0');
	});
});

describe('compactBody on the glyphs the sprites draw', () => {
	const icons = {
		academiconsDoi,
		academiconsGoogleScholar,
		academiconsOrcid,
		academiconsPublons,
		academiconsResearchgate,
		mdiEmail,
		mdiGithub,
		mdiLinkedin,
		mdiMapMarker,
		mdiRss,
		mdiWeb,
		lucideContrast,
		lucideFileText,
		lucideMap
	};

	for (const [name, icon] of Object.entries(icons)) {
		it(`${name}: no point moves more than 0.25% of the box, and the body never grows`, () => {
			const width = icon.width ?? 16;
			const height = icon.height ?? 16;
			const compact = compactBody(icon.body, width, height);
			const before = [...icon.body.matchAll(/\sd="([^"]*)"/g)].map((m) => m[1] ?? '');
			const after = [...compact.matchAll(/\sd="([^"]*)"/g)].map((m) => m[1] ?? '');
			expect(after).toHaveLength(before.length);
			const limit = Math.max(width, height) * 0.0025 + 1e-9;
			before.forEach((d, i) => {
				expect(maxDeviation(d, after[i] ?? '')).toBeLessThanOrEqual(limit);
			});
			expect(compact.length).toBeLessThanOrEqual(icon.body.length);
			// Everything but the path data is untouched.
			expect(compact.replace(/\sd="[^"]*"/g, '')).toBe(icon.body.replace(/\sd="[^"]*"/g, ''));
		});
	}

	it('keeps a path that rounding would lengthen', () => {
		const d = 'M7.5 9.75h4v4h-4zm5 0h4v4h-4z';
		const body = `<path d="${d}"/>`;
		expect(compactPath(d, 0.1).length).toBeGreaterThan(d.length);
		expect(compactBody(body, 24, 24)).toBe(body);
	});

	it('saves most of the Academicons digits', () => {
		const { body, width = 16, height = 16 } = academiconsGoogleScholar;
		expect(compactBody(body, width, height).length).toBeLessThan(body.length * 0.7);
	});
});
