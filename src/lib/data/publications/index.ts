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

// Define the glob patterns for publication types
const publicationGlobs = {
    books: './books/*.ts',
    articles: './articles/*.ts',
    chapters: './chapters/*.ts',
    specialIssues: './special-issues/*.ts',
    reports: './reports/*.ts',
    encyclopedia: './encyclopedia/*.ts',
    blogposts: './blogposts/*.ts',
    dissertations: './dissertations/*.ts'
};

// Load publications category by category to capture the source type
let allPublicationsWithType: (Publication & { sourceDirType: string })[] = [];

for (const [type, globPattern] of Object.entries(publicationGlobs)) {
    const modules = import.meta.glob<ModuleType>(globPattern, { eager: true });
    const loadedItems = loadData<Publication>(modules, templateIds, type);
    
    // Add the sourceDirType to each loaded item
    const itemsWithType = loadedItems.map(item => ({ ...item, sourceDirType: type }));
    allPublicationsWithType = allPublicationsWithType.concat(itemsWithType);
}

// Export the enhanced list
export const allPublications: (Publication & { sourceDirType: string })[] = allPublicationsWithType;

// Sort by date (most recent first)
export const publicationsByDate = [...allPublications].sort((a, b) => {
    return new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime();
});

// Group publications by year
export const publicationsByYear = allPublications.reduce<Record<number, (Publication & { sourceDirType: string })[]>>((acc, publication) => {
    if (!acc[publication.year]) {
        acc[publication.year] = [];
    }
    acc[publication.year].push(publication);
    return acc;
}, {});

// Group publications by type (using the original 'type' field from data, not sourceDirType)
export const publicationsByType = allPublications.reduce<Record<string, (Publication & { sourceDirType: string })[]>>((acc, publication) => {
    const pubType = publication.type; // Use the type defined in the publication data
    if (!acc[pubType]) {
        acc[pubType] = [];
    }
    acc[pubType].push(publication);
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