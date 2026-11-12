import { afterEach, beforeEach, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import { urlFilterSync } from '../src/lib/actions/urlFilterSync.svelte';
import { page } from './app-state.svelte';
import { replaced } from './app-navigation';
import { createSystem, ids, PROJECT } from './filterFixture';

let stop: (() => void) | undefined;
beforeEach(() => {
	replaced.length = 0;
});
afterEach(() => {
	stop?.();
	stop = undefined;
});

const ORIGIN = 'https://www.frederickmadore.com';

/** A navigation: Kit assigns a fresh `page.url` and clears `page.shallow`. */
function at(path: string) {
	page.shallow = null;
	page.url = new URL(path, ORIGIN);
}

/**
 * A popstate onto a history entry the filter writer last edited: Kit restores
 * the address the page was loaded at as `page.url` and puts the real one on
 * `page.shallow.url`, in one synchronous update.
 */
function popTo(loadedAt: string, realAddress: string) {
	page.shallow = { url: new URL(realAddress, ORIGIN) };
	page.url = new URL(loadedAt, ORIGIN);
}

/** Mount the action on a page, as an index page does, after `arrive` has set the address. */
function mount(path: string, arrive: () => void = () => at(path)) {
	arrive();
	const system = createSystem();
	let term = $state('');
	const search = {
		get value() {
			return term;
		},
		set value(next: string) {
			term = next;
		}
	};
	stop = $effect.root(() => {
		urlFilterSync({} as HTMLElement, {
			filters: system.activeFilters,
			setters: system.setters,
			search
		});
	});
	flushSync();
	return { system, search };
}

it('applies a deep link on mount without writing it back', () => {
	const { system, search } = mount(
		'/publications?type=article&type=book&tag=Islam&year_min=2015&year_max=2020&q=campus'
	);
	expect(system.activeFilters.types).toEqual(['article', 'book']);
	expect(system.activeFilters.tags).toEqual(['Islam']);
	expect(system.activeFilters.yearRange).toEqual({ min: 2015, max: 2020 });
	expect(search.value).toBe('campus');
	expect(ids(system.filteredItems)).toEqual(['a', 'b']);
	expect(replaced).toEqual([]);
});

it('writes each change to the address bar once, keeping the path and hash', () => {
	const { system, search } = mount('/publications#list');
	expect(replaced).toEqual([]);

	system.toggle('types', 'book');
	flushSync();
	expect(replaced).toEqual(['/publications?type=book#list']);
	// The URL-to-state effect must not undo the change it has not been told about.
	expect(system.activeFilters.types).toEqual(['book']);

	system.toggle('tags', 'Togo');
	search.value = 'Lomé';
	flushSync();
	expect(replaced.at(-1)).toBe('/publications?type=book&tag=Togo&q=Lom%C3%A9#list');
	expect(replaced).toHaveLength(2);

	system.clearAllFilters();
	search.value = '';
	flushSync();
	expect(replaced.at(-1)).toBe('/publications#list');
});

it('follows a navigation to another query without echoing it', () => {
	const { system } = mount('/publications?type=book');
	at('/publications?tag=Benin&year_min=2020&year_max=2025');
	flushSync();
	expect(system.activeFilters.types).toEqual([]);
	expect(system.activeFilters.tags).toEqual(['Benin']);
	expect(ids(system.filteredItems)).toEqual(['c', 'd']);
	expect(replaced).toEqual([]);

	// And a change after that is written from the state the URL left behind.
	system.toggle('tags', 'Islam');
	flushSync();
	expect(replaced).toEqual(['/publications?tag=Benin&tag=Islam&year_min=2020&year_max=2025']);
});

it('restores a filter written by a chip click when Back returns to the index', () => {
	// /publications → click Books → open a record (the index unmounts).
	const first = mount('/publications');
	first.system.toggle('types', 'book');
	flushSync();
	expect(replaced).toEqual(['/publications?type=book']);
	stop?.();

	// Back: the index mounts again. The entry's stored page URL is the plain
	// index; the address is not.
	replaced.length = 0;
	const { system } = mount('/publications', () =>
		popTo('/publications', '/publications?type=book')
	);
	expect(system.activeFilters.types).toEqual(['book']);
	expect(ids(system.filteredItems)).toEqual(['a']);
	expect(replaced).toEqual([]);
});

it('follows Back and Forward between two filtered entries of one index', () => {
	const { system } = mount('/publications');
	system.toggle('types', 'book');
	flushSync();
	// A link on the page to another filtered view of the same index: a navigation.
	at('/publications?tag=Benin');
	flushSync();
	expect(system.activeFilters.types).toEqual([]);
	expect(system.activeFilters.tags).toEqual(['Benin']);

	popTo('/publications', '/publications?type=book');
	flushSync();
	expect(system.activeFilters.types).toEqual(['book']);
	expect(system.activeFilters.tags).toEqual([]);

	at('/publications?tag=Benin'); // Forward: an entry no shallow edit touched
	flushSync();
	expect(system.activeFilters.tags).toEqual(['Benin']);
	expect(system.activeFilters.types).toEqual([]);
});

it('clears the filters on a real navigation to the plain index', () => {
	const { system } = mount('/publications');
	system.toggle('types', 'book');
	flushSync();
	expect(page.shallow?.url.search).toBe('?type=book');
	at('/publications');
	flushSync();
	expect(system.activeFilters.types).toEqual([]);
	expect(ids(system.filteredItems)).toHaveLength(4);
});

it('does not replay its own shallow edit over a later click', () => {
	const { system } = mount('/publications');
	system.toggle('types', 'book');
	system.toggle('types', 'article');
	flushSync();
	// The first, slower replaceState lands after the second click.
	page.shallow = { url: new URL('/publications?type=book', ORIGIN) };
	flushSync();
	expect(system.activeFilters.types).toEqual(['book', 'article']);
});

it('reads a mixed-case, repeated deep link onto the chips the page prints', () => {
	const { system } = mount('/publications?tag=islam&tag=Islam&tag=NONEXISTENT&year_min=2020');
	expect(system.activeFilters.tags).toEqual(['Islam']);
	expect(system.activeFilters.yearRange).toEqual({ min: 2020, max: Infinity });
	expect(ids(system.filteredItems)).toEqual([]);
	system.setters.setTags([]);
	flushSync();
	expect(ids(system.filteredItems)).toEqual(['c', 'd']);
	expect(replaced.at(-1)).toBe('/publications?year_min=2020');
});

it('keeps a comma inside one value', () => {
	const project = PROJECT;
	const first = mount('/publications');
	first.system.setters.setProjects([project]);
	flushSync();
	const written = new URL(replaced.at(-1)!, ORIGIN);
	stop?.();

	// A shared link to the written address, opened afresh.
	const { system } = mount(`${written.pathname}${written.search}`);
	expect(system.activeFilters.projects).toEqual([project]);
});

/** Mount with the system's own search accessor and a page-local sort, as the index pages do. */
function mountWithSort(path: string, arrive: () => void = () => at(path)) {
	arrive();
	const system = createSystem();
	let order = $state('date');
	const sort = {
		get value() {
			return order;
		},
		set value(next: string) {
			order = next;
		},
		options: ['date', 'title', 'citations'],
		fallback: 'date'
	};
	stop = $effect.root(() => {
		urlFilterSync({} as HTMLElement, {
			filters: system.activeFilters,
			setters: system.setters,
			search: system.search,
			sort
		});
	});
	flushSync();
	return { system, sort };
}

it('writes a non-default sort and drops the parameter for the default', () => {
	const { system, sort } = mountWithSort('/publications');
	sort.value = 'citations';
	flushSync();
	expect(replaced.at(-1)).toBe('/publications?sort=citations');
	system.searchTerm = 'islam';
	flushSync();
	expect(replaced.at(-1)).toBe('/publications?q=islam&sort=citations');
	sort.value = 'date';
	system.clearAll();
	flushSync();
	expect(replaced.at(-1)).toBe('/publications');
});

it('reads the sort from a deep link and from Back, ignoring an unknown order', () => {
	const { sort, system } = mountWithSort('/publications?sort=Title&q=campus');
	expect(sort.value).toBe('title');
	expect(system.searchTerm).toBe('campus');
	expect(replaced).toEqual([]);

	at('/publications?sort=popularity');
	flushSync();
	expect(sort.value).toBe('date');

	popTo('/publications', '/publications?sort=citations');
	flushSync();
	expect(sort.value).toBe('citations');
});
