import type { Fieldwork } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';
import {
	sortByYear,
	groupByYear,
	groupByField,
	extractUnique
} from '$lib/utils/dataAggregation';

// Define all template IDs to filter out
const templateIds = ['fieldwork-template-id'];

// Dynamically import all fieldwork files, excluding index.ts and filters.svelte.ts
const fieldworkModules = import.meta.glob<Record<string, any>>(
	[
		'./*.ts',
		'!./index.ts', // Exclude index.ts
		'!./filters.svelte.ts' // Exclude filters.svelte.ts
	],
	{ eager: true }
);

// Load and filter all fieldworks using the utility function
const allFieldworks: Fieldwork[] = loadData<Fieldwork>(fieldworkModules, templateIds, 'fieldwork');

// Sort by year (most recent first)
export const fieldworksByDate = sortByYear(allFieldworks);

// Group fieldworks by country, city, year, and project
export const fieldworksByCountry = groupByField(allFieldworks, 'country');
export const fieldworksByCity = groupByField(allFieldworks, 'city');
export const fieldworksByYear = groupByYear(allFieldworks);
export const fieldworksByProject = groupByField(allFieldworks, 'project');

// Get all unique values
export const allCountries = extractUnique(allFieldworks, 'country');
export const allCities = extractUnique(allFieldworks, 'city');
export const allProjects = extractUnique(allFieldworks, 'project');

// Export the full list of fieldworks
export { allFieldworks };
