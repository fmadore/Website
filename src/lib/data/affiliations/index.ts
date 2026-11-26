import type { ProfessionalAffiliation } from '#lib/types/index.ts';
import { loadData } from '#lib/utils/dataLoader.ts';

// Dynamically import all affiliation files (excluding template and index)
const affiliationModules = import.meta.glob<Record<string, ProfessionalAffiliation>>(
	['./*.ts', '!./template.ts', '!./index.ts', '!./*.test.ts'],
	{ eager: true }
);

// Load and validate affiliations (the glob already leaves out the template)
export const allAffiliations: ProfessionalAffiliation[] = loadData<ProfessionalAffiliation>(
	affiliationModules,
	[],
	'affiliation'
);

// Sort by start year of the affiliation period (most recent first, then by name)
export const affiliationsByStartDate = [...allAffiliations].sort((a, b) => {
	if (b.period.start !== a.period.start) {
		return b.period.start - a.period.start;
	}
	return a.name.localeCompare(b.name);
});
