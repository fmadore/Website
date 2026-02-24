// src/lib/data/awards/index.ts
import type { Award } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';
import { sortByDate } from '$lib/utils/dataAggregation';

type ModuleType = Record<string, any>;

const templateIds: string[] = [
	// 'award-template-id'
];

const awardModules = import.meta.glob<ModuleType>(['./*.ts'], { eager: true });

const allAwards: Award[] = loadData<Award>(awardModules, templateIds, 'award');

// Sort by date (most recent first)
export const awardsByDate = sortByDate(allAwards);

export { allAwards };
