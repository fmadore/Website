import { afterEach, beforeEach, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import { urlFilterSync } from '../src/lib/actions/urlFilterSync.svelte';
import { page } from './app-state.svelte';
import { replaced } from './app-navigation';
import { createSystem, ids } from './filterFixture';

let stop: (() => void) | undefined;
beforeEach(() => {
	replaced.length = 0;
});
afterEach(() => {
	stop?.();
	stop = undefined;
});

const at = (path: string) => (page.url = new URL(path, 'https://www.frederickmadore.com'));

/** Mount the action on a page at `path`, as an index page does. */
function mount(path: string) {
	at(path);
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

it('keeps a comma inside one value', () => {
	const project = "Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis";
	const { system } = mount('/publications');
	system.setters.setProjects([project]);
	flushSync();
	const written = new URL(replaced.at(-1)!, 'https://www.frederickmadore.com');
	at(`${written.pathname}${written.search}`);
	system.setters.setProjects([]);
	flushSync();
	expect(system.activeFilters.projects).toEqual([project]);
});
