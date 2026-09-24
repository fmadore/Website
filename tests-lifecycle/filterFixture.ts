import {
	EntityFilterSystem,
	type EntityArrayDimension
} from '../src/lib/utils/entityFilterSystem.svelte';

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

const inert: EntityArrayDimension<Item> = { match: () => true, countExtractor: () => undefined };

/** A two-dimension system over `items`, wired the way the index pages wire theirs. */
export function createSystem(): EntityFilterSystem<Item> {
	return new EntityFilterSystem<Item>({
		items,
		matchesYearRange: (item, range) => item.year >= range.min && item.year <= range.max,
		dimensions: {
			types: {
				match: (item, values) => values.includes(item.type),
				countExtractor: (item) => item.type
			},
			tags: {
				match: (item, values) => item.tags.some((tag) => values.includes(tag)),
				countExtractor: (item) => item.tags
			},
			languages: inert,
			authors: inert,
			countries: inert,
			projects: inert
		},
		filterOptions: {
			types: ['article', 'book', 'chapter'],
			years: [2023, 2021, 2019, 2016],
			tags: ['Islam', 'Togo', 'Benin'],
			languages: [],
			authors: [],
			countries: [],
			projects: []
		}
	});
}

export const ids = (list: Item[]): string[] => list.map((item) => item.id);
