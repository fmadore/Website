import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

// Define a type for module imports
// Adjust the type 'any' if you have a more specific type for the module exports
type ModuleType = Record<string, DigitalHumanitiesProject>;

// Use a dynamic glob import to get all .ts files in the current directory,
// excluding this index.ts file itself.
const projectModules = import.meta.glob<ModuleType>(
    ['./*.ts', '!./index.ts'], 
    { eager: true } 
);

// Process the loaded modules to extract the project data
export const allDhProjects: DigitalHumanitiesProject[] = Object.values(projectModules)
    .map(module => {
        // Assuming each file exports a single project object
        // Adjust if a file can export multiple or has a different export structure
        const projectKey = Object.keys(module)[0];
        return module[projectKey];
    })
    .filter(Boolean) // Filter out any undefined or null projects if any
    .sort((a, b) => {
        const orderA = a.order === undefined ? Infinity : a.order;
        const orderB = b.order === undefined ? Infinity : b.order;
        
        if (orderA === orderB) {
            // If orders are the same (or both undefined), sort by title
            return a.title.localeCompare(b.title);
        }
        return orderA - orderB; // Sort by order number
    });

// Optional: Sort projects by a specific field if needed, e.g., years or title
// For example, to sort by title:
// export const allDhProjectsSortedByTitle = [...allDhProjects].sort((a, b) => a.title.localeCompare(b.title));

// You can also export other derived data structures if necessary, for example:
// export const projectsByYear = ...
// export const projectsBySkill = ... 