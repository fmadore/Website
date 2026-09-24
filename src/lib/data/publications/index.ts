import type { Publication } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';
import {
	groupByYear,
	groupByField,
	extractUniqueTags,
	extractUnique,
	extractUniqueDelimited
} from '$lib/utils/dataAggregation';

import {
	PUBLICATION_TEMPLATE_IDS as templateIds,
	PUBLICATION_DIRECTORY_TYPES
} from '$lib/dataMetadata';
import { sortPublicationsByDate } from './order';

// Use a single static glob import (excluding per-type template files)
const publicationModules = import.meta.glob(
	[
		'./books/*.ts',
		'./articles/*.ts',
		'./bulletins/*.ts',
		'./chapters/*.ts',
		'./special-issues/*.ts',
		'./reports/*.ts',
		'./encyclopedia/*.ts',
		'./blogposts/*.ts',
		'./dissertations/*.ts',
		'./proceedings/*.ts',
		'./working-papers/*.ts',
		'!./*/*-template.ts'
	],
	{ eager: true }
);

// Load publications using loadData with transform to add sourceDirType
const allPublications = loadData<Publication>(
	publicationModules,
	templateIds,
	'publication',
	(item, path) => {
		const sourceDirType = PUBLICATION_DIRECTORY_TYPES[path.split('/')[1] ?? ''] ?? 'unknown';
		return { ...item, sourceDirType } as Publication;
	}
) as (Publication & { sourceDirType: string })[];

// Sort by date (most recent first), with forthcoming items floated to the top
export const publicationsByDate = sortPublicationsByDate(allPublications);

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
