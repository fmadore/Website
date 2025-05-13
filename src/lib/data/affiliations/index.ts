import type { ProfessionalAffiliation } from './template';
import { iasg } from './iasg';

// Define a type for module imports, similar to publications
type AffiliationModuleType = Record<string, { default: ProfessionalAffiliation } | ProfessionalAffiliation>;

// Use a single static glob import for all affiliation data files in this directory
// (excluding template.ts and index.ts itself)
const affiliationModules = import.meta.glob<AffiliationModuleType>(
    ['./!(template|index).ts'], 
    { eager: true } 
);

// Process the loaded modules
export const allAffiliations: ProfessionalAffiliation[] = Object.entries(affiliationModules)
    .map(([path, moduleContent]) => {
        // Extract the affiliation data
        // It could be the default export or a named export like `export const iasg = ...`
        let affiliationData: ProfessionalAffiliation | undefined;
        if ('default' in moduleContent && typeof moduleContent.default === 'object' && moduleContent.default !== null && 'id' in moduleContent.default) {
            affiliationData = moduleContent.default as ProfessionalAffiliation;
        } else if (Object.values(moduleContent).length > 0) {
            const firstExport = Object.values(moduleContent)[0];
            if (typeof firstExport === 'object' && firstExport !== null && 'id' in firstExport) {
                 affiliationData = firstExport as ProfessionalAffiliation;
            }
        }
        
        // Basic validation or transformation if needed in the future
        if (!affiliationData || !affiliationData.id) {
            console.warn(`Skipping module ${path} as it does not seem to export a valid affiliation or has no id.`);
            return null;
        }
        return affiliationData;
    })
    .filter(Boolean) as ProfessionalAffiliation[];

// Sort by start year of the affiliation period (most recent first, then by name)
// Handling cases where period might be YearRange or { start: number, end: ... }
export const affiliationsByStartDate = [...allAffiliations].sort((a, b) => {
    const getStartYear = (affiliation: ProfessionalAffiliation): number => {
        if ('min' in affiliation.period) { // YearRange type
            return affiliation.period.min;
        }
        return affiliation.period.start; // { start: number, end: ... } type
    };

    const startYearA = getStartYear(a);
    const startYearB = getStartYear(b);

    if (startYearB !== startYearA) {
        return startYearB - startYearA; // Sort by year descending
    }
    return a.name.localeCompare(b.name); // Then by name ascending
});

// You can add more specific exports or groupings here if needed
// For example, group by parent organization, etc. 