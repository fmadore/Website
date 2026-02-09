import type { TeachingExperience } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';

export type { TeachingExperience };

// Dynamically import teaching experience files (excluding guest-lectures which has a different type)
const teachingModules = import.meta.glob<Record<string, TeachingExperience>>(
	['./*.ts', '!./index.ts', '!./guest-lectures.ts'],
	{ eager: true }
);

// Load and validate teaching experiences using loadData
const teaching: TeachingExperience[] = loadData<TeachingExperience>(
	teachingModules,
	[],
	'teaching-experience'
);

export default teaching;
