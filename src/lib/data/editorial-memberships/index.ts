// src/lib/data/editorial-memberships/index.ts
import type { EditorialMembership } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';

type ModuleType = Record<string, any>;

const templateIds: string[] = [
	// 'editorial-membership-template-id' 
];

const editorialModules = import.meta.glob<ModuleType>(
	['./*.ts'],
	{ eager: true }
);

const allEditorialMemberships: EditorialMembership[] = loadData<EditorialMembership>(
	editorialModules,
	templateIds,
	'editorial-membership'
);

// Sort by start date (most recent first)
export const editorialMembershipsByDate = [...allEditorialMemberships].sort((a, b) => {
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

export { allEditorialMemberships }; 