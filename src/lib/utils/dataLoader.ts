import type { Publication } from '$lib/types/publication'; // Assuming this is the primary type for now
import type { Communication } from '$lib/types/communication'; // Add communication type
import type { Fieldwork } from '$lib/types/fieldwork'; // Add fieldwork type
import type { Appointment } from '$lib/types/appointment'; // <-- Import Appointment type
import type { Education } from '$lib/types/education'; // <-- Import Education type
import type { Grant } from '$lib/types/grant'; // <-- Import Grant type
import type { Award } from '$lib/types/award'; // <-- Import Award type
import type { PeerReview } from '$lib/types/peer-review'; // <-- Import PeerReview type
import type { MediaAppearance } from '$lib/types/media-appearance'; // <-- Import MediaAppearance type

// Define a generic type for the expected module structure
type DataModule = Record<string, any>;

// Define a union type for the data items we expect to load
type DataItem = Publication | Communication | Fieldwork | Appointment | Education | Grant | Award | PeerReview | MediaAppearance; // <-- Add MediaAppearance to union

/**
 * Loads and processes data modules based on a glob pattern.
 * Filters out modules that are not objects and specific template IDs.
 *
 * @param modules - The raw modules object from Vite's import.meta.glob.
 * @param templateIdFilter - A string or array of strings representing template IDs to exclude.
 * @param dataTypeName - Optional name for the data type being loaded (for logging).
 * @returns An array of loaded and filtered data items.
 */
export function loadData<T extends DataItem>(
    modules: Record<string, unknown>, // Accept unknown initially
    templateIdFilter: string | string[],
    dataTypeName: string = 'item'
): T[] {
    const filterIds = Array.isArray(templateIdFilter) ? templateIdFilter : [templateIdFilter];

    // First, filter the entries to ensure the module part is a valid DataModule (Record<string, any>)
    const validModuleEntries = Object.entries(modules)
        .filter((entry): entry is [string, DataModule] => {
            const [, module] = entry; // Destructure here
            if (!module || typeof module !== 'object') {
                console.warn(`Skipping module that is not a valid object while loading ${dataTypeName}s:`, module);
                return false;
            }
            // Add any other basic checks for module structure if necessary
            return true;
        });

    // Now map and filter the valid modules
    return validModuleEntries
        .map(([path, module]) => { // module is now guaranteed to be DataModule
            try {
                let dataItem: T | null = null;

                if ('default' in module && typeof module.default === 'object' && module.default !== null && 'id' in module.default) {
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
                     console.warn(`Module at path ${path} does not seem to contain a valid ${dataTypeName} (no suitable export found):`, module);
                     return null;
                }

                // Check for circular references explicitly (though less likely with this approach)
                 if (dataItem === module) {
                    console.warn(`Circular reference detected in module at path ${path}`);
                    return null;
                }

                return dataItem; // Return the found data item
            } catch (error) {
                console.error(`Error processing ${dataTypeName} module at path ${path}:`, error);
                return null;
            }
        })
        .filter((item): item is T => { // Type guard to filter out nulls and ensure type T
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
