import type { Publication } from '$lib/types';

// Import all publication files
const publicationFiles: Promise<{ [key: string]: Publication }>[] = [
    import('./religious-activism-campuses'),
    import('./sphere-publique-musulmane'),
    import('./religiosity-university-campuses'),
    // Add other publication imports here
    // import('./book-template'),
    // import('./other-publications'),
];

// Convert the modules to an array of publications
const allPublications: Publication[] = await Promise.all(
    publicationFiles.map(async (module) => {
        const publication = Object.values(await module)[0] as Publication;
        return publication;
    })
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
    allPublications.map(pub => pub.language)
)).sort();

// Export the full list of publications
export { allPublications }; 