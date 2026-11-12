import { describe, expect, it } from 'vitest';
import { addNewTabHints, NEW_TAB_HINT_HTML } from './newTabHint.ts';
import { allActivities } from '#lib/data/activities/index.ts';

describe('addNewTabHints', () => {
	it('adds the hidden notice to a target="_blank" anchor', () => {
		expect(
			addNewTabHints('See <a href="https://x.org" target="_blank" rel="noopener">AMIRA</a>.')
		).toBe(
			`See <a href="https://x.org" target="_blank" rel="noopener">AMIRA${NEW_TAB_HINT_HTML}</a>.`
		);
	});

	it('handles single quotes, bare values, attribute order and several anchors', () => {
		const html =
			"<a target='_blank' href='a'>One</a> and <a href=b target=_blank>Two</a> and <a href=c>Three</a>";
		const out = addNewTabHints(html);
		expect(out.split(NEW_TAB_HINT_HTML)).toHaveLength(3);
		expect(out).toContain('<a href=c>Three</a>');
	});

	it('leaves an anchor that already names the new tab, and is idempotent', () => {
		const authored =
			'<a href="a" target="_blank">A<span class="sr-only"> (opens in new tab)</span></a>';
		expect(addNewTabHints(authored)).toBe(authored);
		const labelled = '<a href="a" target="_blank" aria-label="A (opens in new tab)">A</a>';
		expect(addNewTabHints(labelled)).toBe(labelled);
		const once = addNewTabHints('<a href="a" target="_blank">A</a>');
		expect(addNewTabHints(once)).toBe(once);
	});

	it('keeps inner markup and leaves same-tab links untouched', () => {
		expect(addNewTabHints('<a href="a" target="_blank"><em>A</em> b</a>')).toBe(
			`<a href="a" target="_blank"><em>A</em> b${NEW_TAB_HINT_HTML}</a>`
		);
		expect(addNewTabHints('<a href="/x">x</a>')).toBe('<a href="/x">x</a>');
		expect(addNewTabHints('')).toBe('');
	});

	it('leaves no target="_blank" link in an activity body without the notice', () => {
		for (const activity of allActivities) {
			if (!activity.content) continue;
			const out = addNewTabHints(activity.content);
			for (const m of out.matchAll(/<a\b[^>]*target=["']?_blank[\s\S]*?<\/a>/gi)) {
				expect(m[0], activity.id).toMatch(/new tab/i);
			}
		}
	});
});
