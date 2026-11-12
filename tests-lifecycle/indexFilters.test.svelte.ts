import { describe, expect, it } from 'vitest';
import { publicationFilters } from '../src/lib/data/publications/filters.svelte';
import { communicationFilters } from '../src/lib/data/communications/filters.svelte';
import { activityFilters } from '../src/lib/data/activities/filters.svelte';
import {
	ENTITY_ARRAY_FILTER_KEYS,
	type EntityFilterSystem
} from '../src/lib/utils/entityFilterSystem.svelte';

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
		for (const key of ENTITY_ARRAY_FILTER_KEYS) {
			expect(system.totals[key], key).toBe(everything);
			for (const [value, count] of Object.entries(system.counts[key])) {
				system.setValues(key, [value]);
				expect(system.filteredItems.length, `${key} = ${value}`).toBe(count);
			}
			system.setValues(key, []);
		}
	});

	it('offers no value that would empty the index', () => {
		system.clearAllFilters();
		for (const key of ENTITY_ARRAY_FILTER_KEYS) {
			for (const value of system.filterOptions[key]) {
				expect(system.counts[key][value] ?? 0, `${key} = ${value}`).toBeGreaterThan(0);
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
		if (!system.filterOptions.tags.includes('Artificial Intelligence')) return;
		system.setters.setTags(['AI', 'ai']);
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
