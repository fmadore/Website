// src/lib/data/education/index.ts
import type { Education } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';
import { sortByDate, groupByYear } from '$lib/utils/dataAggregation';

// Define a type for module imports
type ModuleType = Record<string, any>;

// Define template IDs to filter out (if you create one)
const templateIds: string[] = [
	// 'education-template-id'
];

// Dynamically import all education files
const educationModules = import.meta.glob<ModuleType>(['./*.ts'], { eager: true });

// Load and filter all education entries using the utility function
const allEducation: Education[] = loadData<Education>(educationModules, templateIds, 'education');

// Sort by date (most recent first)
export const educationByDate = sortByDate(allEducation);

// Export the full list
export { allEducation };

// Group by year
export const educationByYear = groupByYear(allEducation);
