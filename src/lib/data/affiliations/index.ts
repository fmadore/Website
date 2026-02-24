import type { ProfessionalAffiliation } from './template';
import { loadData } from '$lib/utils/dataLoader';

// Dynamically import all affiliation files (excluding template and index)
const affiliationModules = import.meta.glob<Record<string, ProfessionalAffiliation>>(
	['./!(template|index).ts'],
	{ eager: true }
);

// Load and validate affiliations using loadData (template has no id to filter since it's commented out)
export const allAffiliations: ProfessionalAffiliation[] = loadData<ProfessionalAffiliation>(
	affiliationModules,
	'affiliation-template-id',
	'affiliation'
);

// Sort by start year of the affiliation period (most recent first, then by name)
export const affiliationsByStartDate = [...allAffiliations].sort((a, b) => {
	if (b.period.start !== a.period.start) {
		return b.period.start - a.period.start;
	}
	return a.name.localeCompare(b.name);
});
