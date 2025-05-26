// src/lib/data/grants/index.ts
import type { Grant } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';

type ModuleType = Record<string, any>;

const templateIds: string[] = [
	// 'grant-template-id'
];

const grantModules = import.meta.glob<ModuleType>(['./*.ts'], { eager: true });

const allGrants: Grant[] = loadData<Grant>(grantModules, templateIds, 'grant');

// Sort by start date (most recent first)
export const grantsByDate = [...allGrants].sort((a, b) => {
	const dateComparison = new Date(b.dateISOStart).getTime() - new Date(a.dateISOStart).getTime();
	if (dateComparison !== 0) {
		return dateComparison;
	}
	if (a.endYear === null && b.endYear !== null) return -1;
	if (a.endYear !== null && b.endYear === null) return 1;
	if (a.dateISOEnd && b.dateISOEnd) {
		return new Date(b.dateISOEnd).getTime() - new Date(a.dateISOEnd).getTime();
	}
	return 0;
});

export { allGrants };
