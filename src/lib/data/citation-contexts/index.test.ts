import { expect, it } from 'vitest';
import { allPublications } from '#lib/data/publications/index.ts';
import { buildCitationContextSections } from '#lib/utils/citationContexts.ts';
import { citationContextSets } from './index';

/**
 * The recorded contexts against the live `citedBy` lists: the page would fail
 * to prerender on any of these, so the unit run catches them first.
 */
it('answers only citations its publication still lists', () => {
	expect(() => buildCitationContextSections(citationContextSets, allPublications)).not.toThrow();
});

it('records passages for every quoted work, and only for those', () => {
	for (const set of citationContextSets) {
		for (const context of set.contexts) {
			const passages = context.passages ?? [];
			if (context.status === 'quoted') expect(passages.length, context.citing).toBeGreaterThan(0);
			else expect(passages, context.citing).toEqual([]);
			for (const passage of passages) {
				expect(passage.text.trim(), context.citing).not.toBe('');
				// Note numbers are removed for display: none may stay glued to a word.
				expect(passage.text, context.citing).not.toMatch(/[a-zà-ÿ.)”’]\d{1,3}(?=[\s.,;:]|$)/);
			}
			expect(context.language, context.citing).toMatch(/^[a-z]{2}$/);
		}
	}
});
