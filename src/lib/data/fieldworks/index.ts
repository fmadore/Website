import type { Fieldwork } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';

// Define all template IDs to filter out
const templateIds = [
    'fieldwork-template-id'
];

// Dynamically import all fieldwork files
const fieldworkModules = import.meta.glob<Record<string, any>>(
    [
        './*.ts'
    ],
    { eager: true }
);

// Load and filter all fieldworks using the utility function
const allFieldworks: Fieldwork[] = loadData<Fieldwork>(
    fieldworkModules,
    templateIds,
    'fieldwork'
);

// Sort by year (most recent first)
export const fieldworksByDate = [...allFieldworks].sort((a, b) => {
    return b.year - a.year;
});

// Group fieldworks by country
export const fieldworksByCountry = allFieldworks.reduce<Record<string, Fieldwork[]>>((acc, fieldwork) => {
    if (!acc[fieldwork.country]) {
        acc[fieldwork.country] = [];
    }
    acc[fieldwork.country].push(fieldwork);
    return acc;
}, {});

// Group fieldworks by city
export const fieldworksByCity = allFieldworks.reduce<Record<string, Fieldwork[]>>((acc, fieldwork) => {
    if (!acc[fieldwork.city]) {
        acc[fieldwork.city] = [];
    }
    acc[fieldwork.city].push(fieldwork);
    return acc;
}, {});

// Group fieldworks by year
export const fieldworksByYear = allFieldworks.reduce<Record<number, Fieldwork[]>>((acc, fieldwork) => {
    if (!acc[fieldwork.year]) {
        acc[fieldwork.year] = [];
    }
    acc[fieldwork.year].push(fieldwork);
    return acc;
}, {});

// Group fieldworks by project
export const fieldworksByProject = allFieldworks.reduce<Record<string, Fieldwork[]>>((acc, fieldwork) => {
    if (fieldwork.project) {
        if (!acc[fieldwork.project]) {
            acc[fieldwork.project] = [];
        }
        acc[fieldwork.project].push(fieldwork);
    }
    return acc;
}, {});

// Get all unique countries
export const allCountries = Array.from(new Set(
    allFieldworks.map(fieldwork => fieldwork.country)
)).sort();

// Get all unique cities
export const allCities = Array.from(new Set(
    allFieldworks.map(fieldwork => fieldwork.city)
)).sort();

// Get all unique projects
export const allProjects = Array.from(new Set(
    allFieldworks.map(fieldwork => fieldwork.project).filter(Boolean) as string[]
)).sort();

// Export the full list of fieldworks
export { allFieldworks }; 