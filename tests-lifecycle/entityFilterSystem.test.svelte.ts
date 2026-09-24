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
