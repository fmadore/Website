import { describe, it, expect } from 'vitest';

import { allDhProjects } from '$lib/data/digital-humanities';
import { allDhProjectSummaries } from '$lib/data/digital-humanities/summaries';
import { HEAVY_DH_FIELDS } from '$lib/data/digital-humanities/summaryConfig';

/**
 * The committed summaries must be a faithful projection of the full dataset:
 * this is what lets the /digital-humanities index and the CV drop the project
 * descriptions without rendering anything differently. It fails when a data
 * file changes without `npm run gen:summaries` (CI also runs the generator's
 * --check).
 */
describe('digital-humanities summaries', () => {
	it('list exactly the projects of the full index, in the same order', () => {
		expect(allDhProjectSummaries.map((s) => s.id)).toEqual(allDhProjects.map((p) => p.id));
	});

	it('carry none of the heavy fields', () => {
		for (const summary of allDhProjectSummaries) {
			for (const field of HEAVY_DH_FIELDS) {
				expect(field in summary, `${summary.id} carries ${field}`).toBe(false);
			}
		}
	});

	it('keep every other field identical to the full record', () => {
		const byId = new Map(allDhProjectSummaries.map((s) => [s.id, s]));
		const heavy: readonly string[] = HEAVY_DH_FIELDS;
		for (const project of allDhProjects) {
			const summary = byId.get(project.id)!;
			for (const [key, value] of Object.entries(project)) {
				if (heavy.includes(key)) continue;
				expect(summary[key as keyof typeof summary], `${project.id}.${key}`).toEqual(value);
			}
		}
	});
});
