import { afterEach, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import { createSystem, ids } from './filterFixture';

let stop: (() => void) | undefined;
afterEach(() => {
	stop?.();
	stop = undefined;
});

it('starts unfiltered, with every value counted', () => {
	const system = createSystem();
	expect(ids(system.filteredItems)).toEqual(['a', 'b', 'c', 'd']);
	expect(system.activeFilterCount).toBe(0);
	expect(system.counts.types).toEqual({ book: 1, article: 2, chapter: 1 });
	expect(system.counts.tags).toEqual({ Islam: 2, Togo: 2, Benin: 2 });
	expect(system.totals.types).toBe(4);
});

it('narrows the other facets by a selection, never its own', () => {
	const system = createSystem();
	system.toggle('types', 'article');
	expect(ids(system.filteredItems)).toEqual(['b', 'c']);
	expect(system.activeFilterCount).toBe(1);
	// Disjunctive: the type row still says what each other type would add.
	expect(system.counts.types).toEqual({ book: 1, article: 2, chapter: 1 });
	expect(system.totals.types).toBe(4);
	expect(system.counts.tags).toEqual({ Islam: 1, Benin: 1 });
	expect(system.totals.tags).toBe(2);

	// OR within a dimension, AND across dimensions.
	system.toggle('types', 'book');
	system.toggle('tags', 'Togo');
	expect(ids(system.filteredItems)).toEqual(['a']);
	expect(system.activeFilterCount).toBe(3);

	system.toggle('types', 'article');
	system.toggle('types', 'book');
	expect(system.activeFilters.types).toEqual([]);
	expect(ids(system.filteredItems)).toEqual(['a', 'd']);
});

it('orders a year range and counts it as one filter', () => {
	const system = createSystem();
	system.updateYearRange(2022, 2018);
	expect(system.activeFilters.yearRange).toEqual({ min: 2018, max: 2022 });
	expect(ids(system.filteredItems)).toEqual(['b', 'c']);
	expect(system.activeFilterCount).toBe(1);
	expect(system.totals.tags).toBe(2);

	system.setYearRange({ min: 2016, max: 2016 });
	expect(ids(system.filteredItems)).toEqual(['a']);
	system.setYearRange(null);
	expect(system.activeFilters.yearRange).toBeNull();
	system.updateYearRange(2019, 2019);
	system.resetYearRange();
	expect(ids(system.filteredItems)).toHaveLength(4);
});

it('clears in place, so references captured by pages and actions stay live', () => {
	const system = createSystem();
	const captured = system.activeFilters;
	// Arrow-bound: pages pass these around detached from the instance.
	const { toggle, clearAllFilters } = system;
	system.setters.setTags(['Togo']);
	toggle('tags', 'Benin');
	system.setters.setYearRange({ min: 2020, max: 2030 });
	expect(ids(system.filteredItems)).toEqual(['c', 'd']);

	clearAllFilters();
	expect(system.activeFilters).toBe(captured);
	expect(captured.tags).toEqual([]);
	expect(captured.yearRange).toBeNull();
	expect(system.activeFilterCount).toBe(0);
});

it('maps URL values onto the option lists, dropping what the corpus lacks', () => {
	const system = createSystem();
	system.setters.setTags(['islam', 'ISLAM', 'Nonexistent', 'Togo']);
	system.setters.setTypes(['Book']);
	expect(system.activeFilters.tags).toEqual(['Islam', 'Togo']);
	expect(system.activeFilters.types).toEqual(['book']);
	expect(system.activeFilterCount).toBe(3);
	expect(ids(system.filteredItems)).toEqual(['a']);
});

it('takes an open-ended year range from the URL', () => {
	const system = createSystem();
	system.setters.setYearRange({ min: 2020, max: Infinity });
	expect(ids(system.filteredItems)).toEqual(['c', 'd']);
	system.setters.setYearRange({ min: -Infinity, max: 2016 });
	expect(ids(system.filteredItems)).toEqual(['a']);
});

it('re-runs a subscribed effect when a filter changes', () => {
	const system = createSystem();
	const seen: string[] = [];
	stop = $effect.root(() => {
		$effect(() => {
			seen.push(`${ids(system.filteredItems).join('')}/${system.counts.tags.Islam ?? 0}`);
		});
	});
	flushSync();
	system.toggle('tags', 'Benin');
	flushSync();
	system.toggle('types', 'chapter');
	flushSync();
	expect(seen).toEqual(['abcd/2', 'cd/2', 'd/0']);
});

it('narrows the list, every count and every total by the search', () => {
	const system = createSystem({ searchFields: (item) => [item.id, ...item.tags] });
	system.searchTerm = 'islam';
	expect(ids(system.filteredItems)).toEqual(['a', 'b']);
	expect(system.counts.types).toEqual({ book: 1, article: 1 });
	expect(system.totals.types).toBe(2);
	expect(system.counts.tags).toEqual({ Islam: 2, Togo: 1 });
	expect(system.hasSearch).toBe(true);
	expect(system.activeFilterCount).toBe(0);
	expect(system.narrowingCount).toBe(1);

	system.toggle('types', 'book');
	expect(ids(system.filteredItems)).toEqual(['a']);
	// The type row ignores its own selection, never the search.
	expect(system.totals.types).toBe(2);
	expect(system.narrowingCount).toBe(2);

	// A quoted phrase is one needle; the accessor is what `urlFilterSync` drives.
	system.clearAllFilters();
	system.search.value = '"islam togo"';
	expect(ids(system.filteredItems)).toEqual([]);
	expect(system.search.value).toBe('"islam togo"');

	system.clearAll();
	expect(system.searchTerm).toBe('');
	expect(system.narrowingCount).toBe(0);
	expect(ids(system.filteredItems)).toHaveLength(4);
});

it('ignores the search when it is given no fields to read', () => {
	const system = createSystem();
	system.searchTerm = 'nothing matches this';
	expect(ids(system.filteredItems)).toHaveLength(4);
	expect(system.labels.tags).toBe('Tags');
});

it('takes facet headings from its config over the defaults', () => {
	const system = createSystem({ labels: { countries: 'Held in' } });
	expect(system.labels.countries).toBe('Held in');
	expect(system.labels.types).toBe('Type');
});
