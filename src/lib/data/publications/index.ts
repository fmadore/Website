import type { Publication } from '$lib/types';

// Define a type for module imports
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
	'phd-dissertation-template-id'
];

// Use a single static glob import
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

// Process the loaded modules to add sourceDirType
const allPublications: (Publication & { sourceDirType: string })[] = Object.entries(
	publicationModules
)
	.map(([path, module]) => {
		// Extract the publication data (assuming one export per file)
		const publication = Object.values(module)[0] as Publication;

		// Filter out templates based on ID before determining type
		if (templateIds.includes(publication.id)) {
			return null;
		}

		// Determine sourceDirType from the path
		let sourceDirType = 'unknown';
		if (path.startsWith('./books/')) sourceDirType = 'books';
		else if (path.startsWith('./articles/')) sourceDirType = 'articles';
		else if (path.startsWith('./chapters/')) sourceDirType = 'chapters';
		else if (path.startsWith('./special-issues/')) sourceDirType = 'specialIssues';
		else if (path.startsWith('./reports/')) sourceDirType = 'reports';
		else if (path.startsWith('./encyclopedia/')) sourceDirType = 'encyclopedia';
		else if (path.startsWith('./blogposts/')) sourceDirType = 'blogposts';
		else if (path.startsWith('./dissertations/')) sourceDirType = 'dissertations';

		return { ...publication, sourceDirType };
	})
	.filter(Boolean) as (Publication & { sourceDirType: string })[]; // Filter out the nulls (templates)

// Sort by date (most recent first)
export const publicationsByDate = [...allPublications].sort((a, b) => {
	return new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime();
});

// Group publications by year
export const publicationsByYear = allPublications.reduce<
	Record<number, (Publication & { sourceDirType: string })[]>
>((acc, publication) => {
	if (!acc[publication.year]) {
		acc[publication.year] = [];
	}
	acc[publication.year].push(publication);
	return acc;
}, {});

// Group publications by type (using the original 'type' field from data)
export const publicationsByType = allPublications.reduce<
	Record<string, (Publication & { sourceDirType: string })[]>
>((acc, publication) => {
	const pubType = publication.type;
	if (!acc[pubType]) {
		acc[pubType] = [];
	}
	acc[pubType].push(publication);
	return acc;
}, {});

// Get all unique tags
export const allTags = Array.from(new Set(allPublications.flatMap((pub) => pub.tags || []))).sort();

// Get all unique languages
export const allLanguages = Array.from(
	new Set(
		allPublications.flatMap((pub) =>
			pub.language ? pub.language.split(',').map((lang) => lang.trim()) : []
		)
	)
).sort();

// Get all unique countries
export const allCountries = Array.from(
	new Set(allPublications.flatMap((pub) => pub.country || []))
).sort();

// Get all unique projects
export const allProjects = Array.from(
	new Set(allPublications.map((pub) => pub.project).filter(Boolean) as string[])
).sort();

// Explicitly export the main list again
export { allPublications };
