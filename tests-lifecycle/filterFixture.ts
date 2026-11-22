import { EntityFilterSystem } from '../src/lib/utils/entityFilterSystem.svelte';

export interface Item {
	id: string;
	type: string;
	tags: string[];
	year: number;
}

export const items: Item[] = [
	{ id: 'a', type: 'book', tags: ['Islam', 'Togo'], year: 2016 },
	{ id: 'b', type: 'article', tags: ['Islam'], year: 2019 },
	{ id: 'c', type: 'article', tags: ['Benin'], year: 2021 },
	{ id: 'd', type: 'chapter', tags: ['Togo', 'Benin'], year: 2023 }
];

/** A project name with a comma and apostrophes inside it, for the round trip. */
export const PROJECT = "Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis";

export type Key = 'types' | 'tags' | 'projects' | 'countries';

/** A small system over `items`, wired the way the index pages wire theirs. */
export function createSystem(
	extra: {
		searchFields?: (item: Item) => readonly string[];
		labels?: Partial<Record<Key, string>>;
	} = {}
): EntityFilterSystem<Item, Key> {
	const label = (key: Key, fallback: string) => extra.labels?.[key] ?? fallback;
	return new EntityFilterSystem<Item, Key>({
		items,
		searchFields: extra.searchFields,
		years: [2023, 2021, 2019, 2016],
		matchesYearRange: (item, range) => item.year >= range.min && item.year <= range.max,
		dimensions: [
			{
				key: 'types',
				param: 'type',
				label: label('types', 'Type'),
				placement: 'bar-primary',
				options: ['article', 'book', 'chapter'],
				match: (item, values) => values.includes(item.type),
				countExtractor: (item) => item.type
			},
			{
				key: 'projects',
				param: 'project',
				label: label('projects', 'Projects'),
				placement: 'grid-list',
				options: [PROJECT],
				match: () => true,
				countExtractor: () => undefined
			},
			{
				key: 'countries',
				param: 'country',
				label: label('countries', 'Countries'),
				placement: 'grid-list',
				options: [],
				match: () => true,
				countExtractor: () => undefined
			},
			{
				key: 'tags',
				param: 'tag',
				label: label('tags', 'Tags'),
				placement: 'grid-chips',
				options: ['Islam', 'Togo', 'Benin'],
				match: (item, values) => item.tags.some((tag) => values.includes(tag)),
				countExtractor: (item) => item.tags
			}
		]
	});
}

export const ids = (list: Item[]): string[] => list.map((item) => item.id);
