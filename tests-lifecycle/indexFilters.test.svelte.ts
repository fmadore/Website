import { describe, expect, it } from 'vitest';
import { publicationFilters } from '../src/lib/data/publications/filters.svelte';
import { communicationFilters } from '../src/lib/data/communications/filters.svelte';
import { activityFilters } from '../src/lib/data/activities/filters.svelte';
import type { EntityFilterSystem } from '../src/lib/utils/entityFilterSystem.svelte';
import { PUBLICATION_URL_DIMENSIONS } from '../src/lib/utils/webmcp';
import { author } from '../src/lib/data/siteConfig';

/**
 * The index pages' real filter systems, over the real datasets. Each wires a
 * `match` and a `countExtractor` per dimension by hand; nothing but this test
 * holds the two to the same reading of the data, and when they drift a chip
 * promises a count that clicking it does not produce.
 */
const systems: [string, EntityFilterSystem<unknown>][] = [
	['publications', publicationFilters as EntityFilterSystem<unknown>],
	['talks', communicationFilters as EntityFilterSystem<unknown>],
	['activities', activityFilters as EntityFilterSystem<unknown>]
];

describe.each(systems)('%s', (_, system) => {
	it('returns exactly the count each chip prints', () => {
		system.clearAllFilters();
		const everything = system.filteredItems.length;
		for (const { key } of system.dimensions) {
			expect(system.totals[key], key).toBe(everything);
			for (const [value, count] of Object.entries(system.counts[key] ?? {})) {
				system.setValues(key, [value]);
				expect(system.filteredItems.length, `${key} = ${value}`).toBe(count);
			}
			system.setValues(key, []);
		}
	});

	it('offers no value that would empty the index', () => {
		system.clearAllFilters();
		for (const { key, options } of system.dimensions) {
			for (const value of options) {
				expect(system.counts[key]?.[value] ?? 0, `${key} = ${value}`).toBeGreaterThan(0);
			}
		}
		for (const year of system.filterOptions.years) {
			system.updateYearRange(year, year);
			expect(system.filteredItems.length, `year ${year}`).toBeGreaterThan(0);
		}
		system.clearAllFilters();
	});
});

describe('a link shared before a tag rename', () => {
	it.each(systems)('%s reads ?tag=AI as the renamed tag when it holds it', (_, system) => {
		system.clearAllFilters();
		if (!system.filterOptions.tags?.includes('Artificial Intelligence')) return;
		system.setFromUrl('tags', ['AI', 'ai']);
		expect(system.activeFilters.tags).toEqual(['Artificial Intelligence']);
		system.clearAllFilters();
	});
});

describe.each(systems)('%s search', (_, system) => {
	it('finds every entry by its own title, and narrows the counts with it', () => {
		system.clearAll();
		const everything = [...system.filteredItems] as { title: string }[];
		for (const item of everything) {
			system.searchTerm = `"${item.title}"`;
			expect(system.filteredItems, item.title).toContain(item);
			expect(system.totals.types, item.title).toBe(system.filteredItems.length);
		}
		system.clearAll();
		expect(system.filteredItems).toHaveLength(everything.length);
	});
});

describe('the co-author facets, keyed on people (#220)', () => {
	it.each([
		['publications', publicationFilters as EntityFilterSystem<unknown>],
		['talks', communicationFilters as EntityFilterSystem<unknown>]
	])('%s: a shared name link selects the person, who prints by name', (_, system) => {
		system.clearAllFilters();
		const authors = system.dimension('authors')!;
		const keyed = authors.options.find((key) => authors.valueLabel?.(key) !== key);
		expect(keyed, 'some co-author carries a person id').toBeDefined();
		const name = authors.valueLabel!(keyed!);
		// The old link form names the person; it lands on the same facet value.
		system.setFromUrl('authors', [name.toUpperCase()]);
		expect(system.activeFilters.authors).toEqual([keyed]);
		expect(system.filteredItems.length).toBe(system.counts.authors![keyed!]);
		system.clearAllFilters();
		// The site's own author is never a co-author.
		expect(authors.options.map((key) => authors.valueLabel?.(key) ?? key)).not.toContain(
			author.name
		);
	});
});

describe('the new facets (#220)', () => {
	it('offers open access and status on the publications index', () => {
		publicationFilters.clearAllFilters();
		expect(publicationFilters.filterOptions.access).toEqual(['Open access']);
		expect(publicationFilters.filterOptions.status).toContain('Published');
		const open = publicationFilters.counts.access['Open access'] ?? 0;
		publicationFilters.setFromUrl('access', ['open access']);
		expect(publicationFilters.filteredItems).toHaveLength(open);
		publicationFilters.clearAllFilters();
	});

	it('offers talks with slides on the talks index', () => {
		communicationFilters.clearAllFilters();
		const withSlides = communicationFilters.counts.slides['With slides'] ?? 0;
		expect(withSlides).toBeGreaterThan(0);
		communicationFilters.toggle('slides', 'With slides');
		expect(communicationFilters.filteredItems.every((talk) => Boolean(talk.slidesUrl))).toBe(true);
		expect(communicationFilters.filteredItems).toHaveLength(withSlides);
		communicationFilters.clearAllFilters();
	});
});

describe('show_publications', () => {
	it('writes the parameters the publications index reads', () => {
		for (const dimension of PUBLICATION_URL_DIMENSIONS) {
			expect(publicationFilters.dimension(dimension.key as never)?.param, dimension.key).toBe(
				dimension.param
			);
		}
	});
});
