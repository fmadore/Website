import type { ResearchRole } from '$lib/types/researchRole';
import { loadData } from '$lib/utils/dataLoader';

// Dynamically import all research role files
const roleModules = import.meta.glob<Record<string, ResearchRole>>(
	['./*.ts', '!./index.ts'],
	{ eager: true }
);

// Load and validate research roles using loadData
const allResearchRoles: ResearchRole[] = loadData<ResearchRole>(roleModules, [], 'research-role');

// Sort by start year (most recent first)
export const researchRolesByDate = [...allResearchRoles].sort((a, b) => {
	return b.startYear - a.startYear;
});
