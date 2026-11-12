import { describe, it, expect } from 'vitest';

import { allPublications } from '#lib/data/publications/index.ts';
import { allCommunications } from '#lib/data/communications/index.ts';
import { allActivities } from '#lib/data/activities/index.ts';
import { allDhProjects } from '#lib/data/digital-humanities/index.ts';
import { allResearchProjects } from '#lib/data/research/index.ts';
import { allAppointments } from '#lib/data/appointments/index.ts';
import { allAwards } from '#lib/data/awards/index.ts';
import { allEducation } from '#lib/data/education/index.ts';
import { allEditorialMemberships } from '#lib/data/editorial-memberships/index.ts';
import { allFieldworks } from '#lib/data/fieldworks/index.ts';
import { allGrants } from '#lib/data/grants/index.ts';
import { allLanguages } from '#lib/data/languages/index.ts';
import { allMediaAppearances } from '#lib/data/media-appearances/index.ts';
import { allPeerReviews } from '#lib/data/peer-reviews/index.ts';
import { allResearchRoles } from '#lib/data/research-roles/index.ts';
import { allAffiliations } from '#lib/data/affiliations/index.ts';
import allTeaching from '#lib/data/teaching/index.ts';
import { publicationAnalyses } from '#lib/data/analysis/publications/index.ts';
import { allPeople } from '#lib/data/people/index.ts';
import { TAG_ALIASES, SKILL_ALIASES, vocabularyFoldKey } from '#lib/data/tagVocabulary.ts';

/**
 * Integrity checks over shipped datasets. The loader rejects malformed sources
 * before aggregation; these assertions validate their domain-level content.
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
	{ name: 'research', items: allResearchProjects, atLeast: 4 },
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
		// One historical collision predates this check and its ids are public URLs.
		// The reference index namespaces both records; any NEW collision still fails.
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

	it('every research project name is a live join key', () => {
		// `projectName` is matched as free text against the `project` field on
		// publications, communications, grants and fieldwork. A typo silently
		// empties the project page's related panels and the API's cross-references
		// rather than failing, so assert each name still reaches something.
		const referenced = new Set(
			[...allPublications, ...allCommunications, ...allGrants, ...allFieldworks]
				.map((item) => (item as { project?: string }).project)
				.filter((project): project is string => Boolean(project))
		);
		const orphaned = allResearchProjects
			.filter((project) => !referenced.has(project.projectName))
			.map((project) => project.id);
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

/** Values that fold to one key under `vocabularyFoldKey` but are spelled differently. */
function foldCollisions(values: Iterable<string>): string[][] {
	const byKey = new Map<string, Set<string>>();
	for (const value of values) {
		const key = vocabularyFoldKey(value);
		byKey.set(key, (byKey.get(key) ?? new Set()).add(value));
	}
	return [...byKey.values()].filter((spellings) => spellings.size > 1).map((s) => [...s].sort());
}

describe('controlled vocabulary (tagVocabulary.ts)', () => {
	const tagged = [
		...allPublications.map((item) => ({ dataset: 'publications', item })),
		...allCommunications.map((item) => ({ dataset: 'communications', item })),
		...allActivities.map((item) => ({ dataset: 'activities', item }))
	] as { dataset: string; item: { id: string; tags?: string[] } }[];
	const allTags = tagged.flatMap(({ item }) => item.tags ?? []);
	const allSkills = allDhProjects.flatMap((project) => project.skills ?? []);

	it('every tag is canonical (no record carries an alias)', () => {
		const aliased = tagged.flatMap(({ dataset, item }) =>
			(item.tags ?? [])
				.filter((tag) => Object.hasOwn(TAG_ALIASES, tag))
				.map((tag) => `${dataset}/${item.id}: "${tag}" → "${TAG_ALIASES[tag]}"`)
		);
		expect(aliased).toEqual([]);
	});

	it('no two tags fold to the same string (case, diacritics, punctuation)', () => {
		expect(foldCollisions(allTags)).toEqual([]);
	});

	it('no record repeats a tag', () => {
		const repeated = tagged
			.filter(({ item }) => new Set(item.tags ?? []).size !== (item.tags ?? []).length)
			.map(({ dataset, item }) => `${dataset}/${item.id}`);
		expect(repeated).toEqual([]);
	});

	it('every DH skill is canonical and no two skills fold together', () => {
		const aliased = allDhProjects.flatMap((project) =>
			(project.skills ?? [])
				.filter((skill) => Object.hasOwn(SKILL_ALIASES, skill))
				.map((skill) => `${project.id}: "${skill}" → "${SKILL_ALIASES[skill]}"`)
		);
		expect(aliased).toEqual([]);
		expect(foldCollisions(allSkills)).toEqual([]);
	});
});

describe('record field hygiene', () => {
	it('every non-empty project on publications and talks names a research project', () => {
		const projectNames = new Set(allResearchProjects.map((project) => project.projectName));
		const unknown = [...allPublications, ...allCommunications, ...allGrants, ...allFieldworks]
			.map((item) => ({ id: item.id, project: (item as { project?: string }).project }))
			.filter(({ project }) => project !== undefined && !projectNames.has(project))
			.map(({ id, project }) => `${id}: "${project}"`);
		expect(unknown).toEqual([]);
	});

	// An optional field is omitted, never set to ''. Several consumers test
	// `field ?? fallback`, so an empty string silently defeats the fallback.
	const hygieneDatasets = [
		{ name: 'publications', items: allPublications },
		{ name: 'communications', items: allCommunications },
		{ name: 'activities', items: allActivities },
		{ name: 'digital-humanities', items: allDhProjects },
		{ name: 'grants', items: allGrants },
		{ name: 'fieldworks', items: allFieldworks },
		{ name: 'people', items: allPeople }
	] as { name: string; items: { id: string }[] }[];

	// A talk's `heroImage.caption: ''` is deliberate: the record rail prints
	// `caption ?? location`, so an empty caption is how a talk opts out of the
	// venue fallback under its plate.
	const ALLOWED_EMPTY: Record<string, ReadonlySet<string>> = {
		communications: new Set(['heroImage.caption'])
	};

	function emptyStringPaths(value: unknown, path: string, out: string[]): string[] {
		if (typeof value === 'string') {
			if (value.trim() === '') out.push(path);
		} else if (Array.isArray(value)) {
			value.forEach((entry, index) => emptyStringPaths(entry, `${path}[${index}]`, out));
		} else if (value && typeof value === 'object') {
			for (const [key, entry] of Object.entries(value)) {
				emptyStringPaths(entry, path ? `${path}.${key}` : key, out);
			}
		}
		return out;
	}

	it.each(hygieneDatasets)('$name: no empty-string fields', ({ name, items }) => {
		const allowed = ALLOWED_EMPTY[name] ?? new Set<string>();
		const empty = items.flatMap((item) =>
			emptyStringPaths(item, '', [])
				.filter((path) => !allowed.has(path))
				.map((path) => `${item.id}: ${path}`)
		);
		expect(empty).toEqual([]);
	});
});
