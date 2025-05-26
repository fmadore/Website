// src/lib/data/awards/index.ts
import type { Award } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';

type ModuleType = Record<string, any>;

const templateIds: string[] = [
	// 'award-template-id'
];

const awardModules = import.meta.glob<ModuleType>(['./*.ts'], { eager: true });

const allAwards: Award[] = loadData<Award>(awardModules, templateIds, 'award');

// Sort by date (most recent first)
export const awardsByDate = [...allAwards].sort((a, b) => {
	return new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime();
});

export { allAwards };
