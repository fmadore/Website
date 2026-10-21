// src/lib/data/editorial-memberships/index.ts
import type { EditorialMembership } from '#lib/types/index.ts';
import { loadData } from '#lib/utils/dataLoader.ts';
import { sortByStartDate } from '#lib/utils/dataAggregation.ts';

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
