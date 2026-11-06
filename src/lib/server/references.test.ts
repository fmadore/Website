import { describe, it, expect } from 'vitest';
import { referencesForRoute, referencesIn } from './references';
import { referenceIndex } from '#lib/data/referenceIndex.generated.ts';

describe('referencesIn', () => {
	it('picks the entries a piece of markup cites, and nothing else', () => {
		const references = referencesIn(
			'<p>See <ItemReference id="religious-activism-campuses" /> and <ItemReference label="x" id="sphere-publique-musulmane">.</p>'
		);
		expect(Object.keys(references).sort()).toEqual([
			'religious-activism-campuses',
			'sphere-publique-musulmane'
		]);
		expect(references['religious-activism-campuses']).toEqual(
			referenceIndex['religious-activism-campuses']
		);
	});

	it('skips an id the index does not hold rather than inventing an entry', () => {
		expect(referencesIn('<ItemReference id="no-such-record" />')).toEqual({});
	});
});

describe('referencesForRoute', () => {
	it("returns what a page's own source cites", () => {
		const page = referencesForRoute('/research/dh-ai-african-studies');
		expect(Object.keys(page)).toContain('for-whom-for-what-purpose-dh-ai-african-studies-2026');
		// A handful, not the index: the point of passing entries per page.
		expect(Object.keys(page).length).toBeLessThan(Object.keys(referenceIndex).length / 4);
	});

	it('covers a research project, and is empty for a page that cites nothing', () => {
		expect(
			Object.keys(referencesForRoute('/research/dh-ai-african-studies')).length
		).toBeGreaterThan(0);
		expect(referencesForRoute('/teaching')).toEqual({});
		expect(referencesForRoute('/')).toEqual({});
		expect(referencesForRoute(null)).toEqual({});
	});
});
