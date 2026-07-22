import { describe, it, expect } from 'vitest';

import { allPublications } from '$lib/data/publications';
import { allCommunications } from '$lib/data/communications';
import { allActivities } from '$lib/data/activities';
import { allDhProjects } from '$lib/data/digital-humanities';
import { allAppointments } from '$lib/data/appointments';
import { allAwards } from '$lib/data/awards';
import { allEducation } from '$lib/data/education';
import { allEditorialMemberships } from '$lib/data/editorial-memberships';
import { allFieldworks } from '$lib/data/fieldworks';
import { allGrants } from '$lib/data/grants';
import { allLanguages } from '$lib/data/languages';
import { allMediaAppearances } from '$lib/data/media-appearances';
import { allPeerReviews } from '$lib/data/peer-reviews';
import { allResearchRoles } from '$lib/data/research-roles';
import { allAffiliations } from '$lib/data/affiliations';
import allTeaching from '$lib/data/teaching';
import { publicationAnalyses } from '$lib/data/analysis/publications';

/**
 * Integrity checks over the shipped datasets (the aggregated index exports —
 * i.e. exactly what the site builds from). `loadData()` is deliberately
 * fail-soft: in production it silently DROPS malformed items, so without this
 * suite a bad content file would vanish from the site with no CI signal.
 */

interface Dataset {
	name: string;
	items: { id: string }[];
	/** Minimum plausible item count — catches a glob or loader regression that silently empties a dataset. */
	atLeast: number;
}

const datasets: Dataset[] = [
	{ name: 'publications', items: allPublications, atLeast: 40 },
	{ name: 'communications', items: allCommunications, atLeast: 40 },
	{ name: 'activities', items: allActivities, atLeast: 10 },
	{ name: 'digital-humanities', items: allDhProjects, atLeast: 3 },
	{ name: 'appointments', items: allAppointments, atLeast: 2 },
	{ name: 'awards', items: allAwards, atLeast: 2 },
	{ name: 'education', items: allEducation, atLeast: 2 },
	{ name: 'editorial-memberships', items: allEditorialMemberships, atLeast: 1 },
	{ name: 'fieldworks', items: allFieldworks, atLeast: 3 },
	{ name: 'grants', items: allGrants, atLeast: 2 },
	{ name: 'languages', items: allLanguages, atLeast: 2 },
	{ name: 'media-appearances', items: allMediaAppearances, atLeast: 2 },
	{ name: 'peer-reviews', items: allPeerReviews, atLeast: 2 },
	{ name: 'research-roles', items: allResearchRoles, atLeast: 1 },
	{ name: 'affiliations', items: allAffiliations, atLeast: 1 },
	{ name: 'teaching', items: allTeaching, atLeast: 1 }
];

const ISO_DATE = /^\d{4}(-\d{2})?(-\d{2})?$/;
const CURRENT_YEAR = new Date().getFullYear();

describe.each(datasets)('dataset: $name', ({ items }) => {
	it('is non-empty (loader/glob did not silently drop everything)', () => {
		expect(items.length).toBeGreaterThan(0);
	});

	it('meets its minimum expected size', () => {
		const dataset = datasets.find((d) => d.items === items)!;
		expect(items.length).toBeGreaterThanOrEqual(dataset.atLeast);
	});

	it('every item has a non-empty, whitespace-free string id', () => {
		for (const item of items) {
			expect(item.id, JSON.stringify(item).slice(0, 120)).toBeTypeOf('string');
			expect(item.id.length).toBeGreaterThan(0);
			expect(item.id, `id "${item.id}" contains whitespace`).not.toMatch(/\s/);
		}
	});

	it('ids are unique within the dataset', () => {
		const seen = new Map<string, number>();
		for (const item of items) seen.set(item.id, (seen.get(item.id) ?? 0) + 1);
		const duplicates = [...seen.entries()].filter(([, count]) => count > 1).map(([id]) => id);
		expect(duplicates).toEqual([]);
	});

	it('no template item leaked into the dataset', () => {
		const leaked = items.filter((item) => item.id.toLowerCase().includes('template'));
		expect(leaked.map((item) => item.id)).toEqual([]);
	});
});

describe('dated datasets', () => {
	const datedDatasets = [
		{ name: 'publications', items: allPublications },
		{ name: 'communications', items: allCommunications },
		{ name: 'activities', items: allActivities }
	] as { name: string; items: { id: string; date?: string; dateISO?: string; year?: number }[] }[];

	it.each(datedDatasets)('$name: year is a plausible number', ({ items }) => {
		for (const item of items) {
			expect(item.year, `"${item.id}" has year ${item.year}`).toBeTypeOf('number');
			expect(item.year!, `"${item.id}" year out of range`).toBeGreaterThanOrEqual(1990);
			// Forthcoming items may sit a couple of years ahead.
			expect(item.year!, `"${item.id}" year out of range`).toBeLessThanOrEqual(CURRENT_YEAR + 3);
		}
	});

	it.each(datedDatasets)('$name: dateISO (when present) is parseable ISO', ({ items }) => {
		for (const item of items) {
			if (item.dateISO === undefined) continue;
			expect(item.dateISO, `"${item.id}" dateISO "${item.dateISO}"`).toMatch(ISO_DATE);
			expect(
				Number.isNaN(Date.parse(item.dateISO)),
				`"${item.id}" dateISO "${item.dateISO}" does not parse`
			).toBe(false);
		}
	});

	it.each(datedDatasets)('$name: dateISO year agrees with the year field', ({ items }) => {
		for (const item of items) {
			if (item.dateISO === undefined || item.year === undefined) continue;
			expect(
				Number(item.dateISO.slice(0, 4)),
				`"${item.id}" dateISO "${item.dateISO}" vs year ${item.year}`
			).toBe(item.year);
		}
	});
});

describe('cross-dataset invariants', () => {
	it('publication and communication ids do not collide (shared reference index)', () => {
		// The reference index (scripts/generate-reference-index.mjs) silently
		// resolves cross-dataset collisions by keeping the publication, so an
		// <ItemReference> intending the communication would show the article.
		// One historical collision predates this check; its ids are public URLs,
		// so renaming is an editorial decision. Any NEW collision fails here.
		const knownCollisions = new Set(['islam-ivoirien-burkinabe-numerique-2016']);
		const publicationIds = new Set(allPublications.map((p) => p.id));
		const collisions = allCommunications
			.map((c) => c.id)
			.filter((id) => publicationIds.has(id) && !knownCollisions.has(id));
		expect(collisions).toEqual([]);
	});

	it('every text-analysis entry references an existing publication', () => {
		const publicationIds = new Set(allPublications.map((p) => p.id));
		const orphaned = Object.keys(publicationAnalyses).filter((id) => !publicationIds.has(id));
		expect(orphaned).toEqual([]);
	});

	it('publications and communications have a non-empty title', () => {
		for (const item of [...allPublications, ...allCommunications]) {
			const { title } = item as { title?: string };
			expect(title, `"${item.id}" is missing a title`).toBeTypeOf('string');
			expect(title!.trim().length, `"${item.id}" has a blank title`).toBeGreaterThan(0);
		}
	});
});
