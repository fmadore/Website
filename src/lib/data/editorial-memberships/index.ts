// src/lib/data/editorial-memberships/index.ts
import type { EditorialMembership } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';
import { sortByStartDate } from '$lib/utils/dataAggregation';

type ModuleType = Record<string, unknown>;

const templateIds: string[] = [
	// 'editorial-membership-template-id'
];

const editorialModules = import.meta.glob<ModuleType>(['./*.ts', '!./index.ts'], { eager: true });

const allEditorialMemberships: EditorialMembership[] = loadData<EditorialMembership>(
	editorialModules,
	templateIds,
	'editorial-membership'
);

// Sort by start date (most recent first)
export const editorialMembershipsByDate = sortByStartDate(allEditorialMemberships);

export { allEditorialMemberships };
