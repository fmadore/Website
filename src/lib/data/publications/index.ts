import type { Publication } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader'; // Import the new utility function

// Define a type for module imports (can be kept or potentially inferred)
type ModuleType = Record<string, any>;

// Define all template IDs to filter out
const templateIds = [
    'book-template-id',
    'edited-volume-template-id',
    'article-template-id',
    'chapter-template-id',
    'special-issue-template-id',
    'report-template-id',
    'encyclopedia-template-id',
    'blogpost-template-id',
    'dissertation-template-id'
];

// Dynamically import all publication files from all relevant subdirectories at once
const publicationModules = import.meta.glob<ModuleType>(
    [
        './books/*.ts',
        './articles/*.ts',
        './chapters/*.ts',
        './special-issues/*.ts',
        './reports/*.ts',
        './encyclopedia/*.ts',
        './blogposts/*.ts',
        './dissertations/*.ts'
    ], 
    { eager: true }
);

// Load and filter all publications using the utility function
const allPublications: Publication[] = loadData<Publication>(
    publicationModules, 
    templateIds, 
    'publication' // Optional type name for logging
);

// Sort by date (most recent first)
export const publicationsByDate = [...allPublications].sort((a, b) => {
    return new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime();
});

// Group publications by year
export const publicationsByYear = allPublications.reduce<Record<number, Publication[]>>((acc, publication) => {
    if (!acc[publication.year]) {
        acc[publication.year] = [];
    }
    acc[publication.year].push(publication);
    return acc;
}, {});

// Group publications by type
export const publicationsByType = allPublications.reduce<Record<string, Publication[]>>((acc, publication) => {
    if (!acc[publication.type]) {
        acc[publication.type] = [];
    }
    acc[publication.type].push(publication);
    return acc;
}, {});

// Get all unique tags
export const allTags = Array.from(new Set(
    allPublications.flatMap(pub => pub.tags || [])
)).sort();

// Get all unique languages
export const allLanguages = Array.from(new Set(
    allPublications.flatMap(pub => 
        pub.language ? pub.language.split(',').map(lang => lang.trim()) : []
    )
)).sort();

// Get all unique countries
export const allCountries = Array.from(new Set(
    allPublications.flatMap(pub => pub.country || [])
)).sort();

// Get all unique projects
export const allProjects = Array.from(new Set(
    allPublications.map(pub => pub.project).filter(Boolean) as string[]
)).sort();

// Export the full list of publications
export { allPublications }; 