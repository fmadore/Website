import type { Communication } from '$lib/types/communication';
import { loadData } from '$lib/utils/dataLoader';
import {
	sortByDate,
	groupByYear,
	groupByField,
	extractUniqueTags,
	extractUnique
} from '$lib/utils/dataAggregation';

type ModuleType = Record<string, any>;

// Define all template IDs to filter out
const templateIds = [
	'paper-template-id',
	'panel-template-id',
	'talk-template-id',
	'event-template-id',
	'podcast-template-id'
];

// Dynamically import all communication files from relevant subfolders
const communicationModules = import.meta.glob<ModuleType>(
	['./papers/*.ts', './panels/*.ts', './talks/*.ts', './events/*.ts', './podcasts/*.ts'],
	{ eager: true }
);

// Filter out index.ts and template.ts files explicitly
const filteredModules = Object.fromEntries(
	Object.entries(communicationModules).filter(
		([path]) => !path.endsWith('index.ts') && !path.endsWith('template.ts')
	)
);

// Load and filter all communications using the utility function
const allCommunications: Communication[] = loadData<Communication>(
	filteredModules,
	templateIds,
	'communication'
);

// Sort by date (most recent first)
export const communicationsByDate = sortByDate(allCommunications);

// Group communications by year, type, country, and project
export const communicationsByYear = groupByYear(allCommunications);
export const communicationsByType = groupByField(allCommunications, 'type');
export const communicationsByCountry = groupByField(allCommunications, 'country');
export const communicationsByProject = groupByField(allCommunications, 'project');

// Get all unique tags and projects
export const allTags = extractUniqueTags(allCommunications, 'tags');
export const allProjects = extractUnique(allCommunications, 'project');

// Get all coordinates for map visualization
export const allCoordinates = allCommunications
	.filter((comm) => comm.coordinates)
	.map((comm) => ({
		id: comm.id,
		title: comm.title,
		coordinates: comm.coordinates!,
		year: comm.year,
		activityType: comm.type
	}));

// Export the full list of communications
export { allCommunications };
