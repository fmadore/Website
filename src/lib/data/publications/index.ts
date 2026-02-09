import type { Publication } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';
import {
	sortByDate,
	groupByYear,
	groupByField,
	extractUniqueTags,
	extractUnique,
	extractUniqueDelimited
} from '$lib/utils/dataAggregation';

// Define all template IDs to filter out
const templateIds = [
	'book-template-id',
	'edited-volume-template-id',
	'article-template-id',
	'bulletin-article-template-id',
	'chapter-template-id',
	'special-issue-template-id',
	'report-template-id',
	'encyclopedia-template-id',
	'blogpost-template-id',
	'phd-dissertation-template-id',
	'conference-proceedings-template-id'
];

// Directory-to-type mapping for sourceDirType extraction
const dirTypeMap: Record<string, string> = {
	'./books/': 'books',
	'./articles/': 'articles',
	'./chapters/': 'chapters',
	'./special-issues/': 'specialIssues',
	'./reports/': 'reports',
	'./encyclopedia/': 'encyclopedia',
	'./blogposts/': 'blogposts',
	'./dissertations/': 'dissertations',
	'./proceedings/': 'proceedings'
};

// Use a single static glob import
const publicationModules = import.meta.glob(
	[
		'./books/*.ts',
		'./articles/*.ts',
		'./chapters/*.ts',
		'./special-issues/*.ts',
		'./reports/*.ts',
		'./encyclopedia/*.ts',
		'./blogposts/*.ts',
		'./dissertations/*.ts',
		'./proceedings/*.ts'
	],
	{ eager: true }
);

// Load publications using loadData with transform to add sourceDirType
const allPublications = loadData<Publication>(
	publicationModules,
	templateIds,
	'publication',
	(item, path) => {
		const sourceDirType =
			Object.entries(dirTypeMap).find(([prefix]) => path.startsWith(prefix))?.[1] ?? 'unknown';
		return { ...item, sourceDirType } as Publication;
	}
) as (Publication & { sourceDirType: string })[];

// Sort by date (most recent first)
export const publicationsByDate = sortByDate(allPublications);

// Group publications by year and type
export const publicationsByYear = groupByYear(allPublications);
export const publicationsByType = groupByField(allPublications, 'type');

// Get all unique values for filtering
export const allTags = extractUniqueTags(allPublications, 'tags');
export const allLanguages = extractUniqueDelimited(allPublications, 'language');
export const allCountries = extractUniqueTags(allPublications, 'country');
export const allProjects = extractUnique(allPublications, 'project');
export const allPublisherLocations = extractUnique(allPublications, 'publisherLocation');

export { allPublications };
