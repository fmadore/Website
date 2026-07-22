// src/lib/data/grants/index.ts
import type { Grant } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';
import { sortByStartDate } from '$lib/utils/dataAggregation';

type ModuleType = Record<string, unknown>;

const templateIds: string[] = [
	// 'grant-template-id'
];

const grantModules = import.meta.glob<ModuleType>(['./*.ts', '!./index.ts'], { eager: true });

const allGrants: Grant[] = loadData<Grant>(grantModules, templateIds, 'grant');

// Sort by start date (most recent first)
export const grantsByDate = sortByStartDate(allGrants);

export { allGrants };
