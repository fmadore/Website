import type { Publication } from '$lib/types';

// Define a type for module imports
type ModuleType = Record<string, any>;

// Dynamically import all book files
const bookContext = import.meta.glob<ModuleType>('./books/*.ts', { eager: true });
const bookPublications: Publication[] = Object.values(bookContext)
    .filter((module): module is ModuleType => !!module && (typeof module === 'object'))
    .map(module => {
        // If there's a default export, use it, otherwise take the first exported value
        const publication = 'default' in module 
            ? module.default 
            : Object.values(module)[0];
        return publication as Publication;
    })
    .filter(pub => pub.id && pub.id !== 'book-template-id' && pub.id !== 'edited-volume-template-id'); // Filter out templates

// Dynamically import all article files
const articleContext = import.meta.glob<ModuleType>('./articles/*.ts', { eager: true });
const articlePublications: Publication[] = Object.values(articleContext)
    .filter((module): module is ModuleType => !!module && (typeof module === 'object'))
    .map(module => {
        const publication = 'default' in module ? module.default : Object.values(module)[0];
        return publication as Publication;
    })
    .filter(pub => pub.id && pub.id !== 'article-template-id'); // Filter out templates

// Dynamically import all chapter files
const chapterContext = import.meta.glob<ModuleType>('./chapters/*.ts', { eager: true });
const chapterPublications: Publication[] = Object.values(chapterContext)
    .filter((module): module is ModuleType => !!module && (typeof module === 'object'))
    .map(module => {
        const publication = 'default' in module ? module.default : Object.values(module)[0];
        return publication as Publication;
    })
    .filter(pub => pub.id && pub.id !== 'chapter-template-id'); // Filter out templates

// Dynamically import all special issue files
const specialIssueContext = import.meta.glob<ModuleType>('./special-issues/*.ts', { eager: true });
const specialIssuePublications: Publication[] = Object.values(specialIssueContext)
    .filter((module): module is ModuleType => !!module && (typeof module === 'object'))
    .map(module => {
        const publication = 'default' in module ? module.default : Object.values(module)[0];
        return publication as Publication;
    })
    .filter(pub => pub.id && pub.id !== 'special-issue-template-id'); // Filter out templates

// Dynamically import all report files
const reportContext = import.meta.glob<ModuleType>('./reports/*.ts', { eager: true });
const reportPublications: Publication[] = Object.values(reportContext)
    .filter((module): module is ModuleType => !!module && (typeof module === 'object'))
    .map(module => {
        const publication = 'default' in module ? module.default : Object.values(module)[0];
        return publication as Publication;
    })
    .filter(pub => pub.id && pub.id !== 'report-template-id'); // Filter out templates

// Combine all publications
const allPublications: Publication[] = [
    ...bookPublications,
    ...articlePublications,
    ...chapterPublications,
    ...specialIssuePublications,
    ...reportPublications
];

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

// Export the full list of publications
export { allPublications }; 