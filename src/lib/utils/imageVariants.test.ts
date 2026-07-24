import { describe, it, expect } from 'vitest';
import { buildSrcset, VARIANT_WIDTHS } from './imageVariants';

describe('buildSrcset', () => {
	it('builds variant URLs for images under /images/', () => {
		expect(buildSrcset('/images/activities/talk.webp')).toBe(
			'/images/_r/activities/talk-400.webp 400w, /images/_r/activities/talk-800.webp 800w, /images/_r/activities/talk-1600.webp 1600w'
		);
	});

	it('preserves a base-path prefix', () => {
		const srcset = buildSrcset('/site/images/foo.jpg');
		expect(srcset).toContain('/site/images/_r/foo-400.webp 400w');
	});

	it('covers every configured width', () => {
		const srcset = buildSrcset('/images/foo.png')!;
		for (const w of VARIANT_WIDTHS) {
			expect(srcset).toContain(`-${w}.webp ${w}w`);
		}
	});

	it('returns undefined for external URLs', () => {
		expect(buildSrcset('https://example.com/images/foo.webp')).toBeUndefined();
		expect(buildSrcset('http://example.com/images/foo.webp')).toBeUndefined();
	});

	it('returns undefined for svg, non-image paths, empty and null input', () => {
		expect(buildSrcset('/images/logo.svg')).toBeUndefined();
		expect(buildSrcset('/files/paper.pdf')).toBeUndefined();
		expect(buildSrcset('')).toBeUndefined();
		expect(buildSrcset(null)).toBeUndefined();
		expect(buildSrcset(undefined)).toBeUndefined();
	});

	it('never derives variants of a variant', () => {
		expect(buildSrcset('/images/_r/foo-400.webp')).toBeUndefined();
	});
});
