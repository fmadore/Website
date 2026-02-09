/**
 * dataLoader.ts
 *
 * This module provides utility functions for loading and processing data
 * from various content sources (e.g., Markdown files defining publications,
 * communications, etc.) using Vite's `import.meta.glob` feature.
 * It focuses on robustly handling potentially malformed or missing data
 * during the import process.
 */
import type { Publication } from '$lib/types/publication';
import type { Communication } from '$lib/types/communication';
import type { Fieldwork } from '$lib/types/fieldwork';
import type { Appointment } from '$lib/types/appointment';
import type { Education } from '$lib/types/education';
import type { Grant } from '$lib/types/grant';
import type { Award } from '$lib/types/award';
import type { PeerReview } from '$lib/types/peer-review';
import type { MediaAppearance } from '$lib/types/media-appearance';
import type { EditorialMembership } from '$lib/types/editorial-membership';
import type { Language } from '$lib/types/language';
import type { Activity } from '$lib/types/activity';
import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';
import type { ProfessionalAffiliation } from '$lib/types/affiliation';
import type { ResearchRole } from '$lib/types/researchRole';
import type { TeachingExperience } from '$lib/types/teachingExperience';

// Define a generic type for the expected module structure
type DataModule = Record<string, any>;

// Define a union type for the data items we expect to load
type DataItem =
	| Publication
	| Communication
	| Fieldwork
	| Appointment
	| Education
	| Grant
	| Award
	| PeerReview
	| MediaAppearance
	| EditorialMembership
	| Language
	| Activity
	| DigitalHumanitiesProject
	| ProfessionalAffiliation
	| ResearchRole
	| TeachingExperience;

/**
 * Loads and processes data modules based on a glob pattern, expecting each module
 * to export a data object (typically as `default` or the first suitable export).
 * It filters out modules that aren't valid objects, checks for an 'id' property,
 * and excludes specific template IDs. Handles errors gracefully by logging issues
 * and skipping problematic modules/items rather than throwing an error.
 *
 * @template T - The expected type of the data items being loaded, extending DataItem.
 * @param {Record<string, unknown>} modules - The raw modules object obtained from Vite's `import.meta.glob`. Keys are file paths, values are the imported modules (or functions to load them).
 * @param {string | string[]} templateIdFilter - A single ID or an array of IDs to exclude from the results. Items matching these IDs will be filtered out.
 * @param {string} [dataTypeName='item'] - An optional descriptive name for the type of data being loaded (e.g., 'publication', 'communication'), used in log messages for clarity.
 * @returns {T[]} An array of loaded, validated, and filtered data items of type T. Returns an empty array if no valid items are found or all are filtered out.
 */
export function loadData<T extends DataItem>(
	modules: Record<string, unknown>, // Accept unknown initially
	templateIdFilter: string | string[],
	dataTypeName: string = 'item'
): T[] {
	const filterIds = Array.isArray(templateIdFilter) ? templateIdFilter : [templateIdFilter];

	// First, filter the entries to ensure the module part is a valid DataModule (Record<string, any>)
	const validModuleEntries = Object.entries(modules).filter(
		(entry): entry is [string, DataModule] => {
			const [, module] = entry; // Destructure here
			if (!module || typeof module !== 'object') {
				console.warn(
					`Skipping module that is not a valid object while loading ${dataTypeName}s:`,
					module
				);
				return false;
			}
			// Add any other basic checks for module structure if necessary
			return true;
		}
	);

	// Now map and filter the valid modules
	return validModuleEntries
		.map(([path, module]) => {
			// module is now guaranteed to be DataModule
			try {
				let dataItem: T | null = null;

				if (
					'default' in module &&
					typeof module.default === 'object' &&
					module.default !== null &&
					'id' in module.default
				) {
					dataItem = module.default as T;
				} else {
					// Find the first exported value that looks like a valid data item (object with an id)
					for (const key in module) {
						if (Object.prototype.hasOwnProperty.call(module, key)) {
							const potentialItem = module[key];
							if (potentialItem && typeof potentialItem === 'object' && 'id' in potentialItem) {
								dataItem = potentialItem as T;
								break; // Found the first valid item
							}
						}
					}
				}

				// Check if a valid data item was found
				if (!dataItem) {
					console.warn(
						`Module at path ${path} does not seem to contain a valid ${dataTypeName} (no suitable export found):`,
						module
					);
					return null; // Skip this module gracefully
				}

				// Check for circular references explicitly (though less likely with this approach)
				if (dataItem === module) {
					console.warn(`Circular reference detected in module at path ${path}`);
					return null;
				}

				// Debug: Log the extracted data item before filtering
				// console.log(`DataLoader extracted for path ${path}:`, dataItem);

				return dataItem; // Return the found data item
			} catch (error) {
				console.error(`Error processing ${dataTypeName} module at path ${path}:`, error);
				return null;
			}
		})
		.filter((item): item is T => {
			// Type guard to filter out nulls and ensure type T
			if (!item) {
				return false; // Already logged errors or invalid items
			}
			// Ensure item has an 'id' property before accessing it
			if (!item.id) {
				// This check might be redundant if the check inside map is sufficient, but kept for safety.
				console.warn(`Loaded ${dataTypeName} missing id:`, item);
				return false;
			}
			// Filter out specified template IDs
			if (filterIds.includes(item.id)) {
				return false;
			}
			return true;
		});
}

/**
 * Helper to combine multiple glob imports for different subdirectories.
 * Handles potential overlaps or issues if needed.
 * Vite's import.meta.glob handles multiple patterns, so direct combination is often fine.
 */
// Example of how you might combine contexts if needed, though Vite might handle it directly
// export function combineGlobContexts(...contexts: Record<string, DataModule>[]): Record<string, DataModule> {
//     return contexts.reduce((acc, context) => ({ ...acc, ...context }), {});
// }
