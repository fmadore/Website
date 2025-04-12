import type { Communication } from '$lib/types/communication';
import { loadData } from '$lib/utils/dataLoader'; // Import the new utility function

// Define a type for module imports (can be kept or potentially inferred)
type ModuleType = Record<string, any>;

// Define all template IDs to filter out
const templateIds = [
    'paper-template-id',
    'panel-template-id',
    'talk-template-id',
    'event-template-id'
];

// Dynamically import all communication files from relevant subfolders
const communicationModules = import.meta.glob<ModuleType>(
    [
        './papers/*.ts',
        './panels/*.ts',
        './talks/*.ts',
        './events/*.ts'
    ],
    { eager: true }
);

// Debug: Log the keys we're importing (optional, can be removed)
console.log('Communication files being loaded (using glob): ', Object.keys(communicationModules));

// Filter out index.ts and template.ts files explicitly
const filteredModules = Object.fromEntries(
    Object.entries(communicationModules).filter(([path]) => 
        !path.endsWith('index.ts') && !path.endsWith('template.ts')
    )
);

// Load and filter all communications using the utility function
const allCommunications: Communication[] = loadData<Communication>(
    filteredModules, // Use the filtered modules
    templateIds,
    'communication' // Optional type name for logging
);

// Sort by date (most recent first)
export const communicationsByDate = [...allCommunications].sort((a, b) => {
    return new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime();
});

// Group communications by year
export const communicationsByYear = allCommunications.reduce<Record<number, Communication[]>>((acc, communication) => {
    if (communication.year && !acc[communication.year]) {
        acc[communication.year] = [];
    }
    if (communication.year) {
        acc[communication.year].push(communication);
    }
    return acc;
}, {});

// Group communications by type
export const communicationsByType = allCommunications.reduce<Record<string, Communication[]>>((acc, communication) => {
    if (communication.type) {
        if (!acc[communication.type]) {
            acc[communication.type] = [];
        }
        acc[communication.type].push(communication);
    }
    return acc;
}, {});

// Group communications by country
export const communicationsByCountry = allCommunications.reduce<Record<string, Communication[]>>((acc, communication) => {
    if (communication.country) {
        if (!acc[communication.country]) {
            acc[communication.country] = [];
        }
        acc[communication.country].push(communication);
    }
    return acc;
}, {});

// Group communications by project
export const communicationsByProject = allCommunications.reduce<Record<string, Communication[]>>((acc, communication) => {
    if (communication.project) {
        if (!acc[communication.project]) {
            acc[communication.project] = [];
        }
        acc[communication.project].push(communication);
    }
    return acc;
}, {});

// Get all unique tags
export const allTags = Array.from(new Set(
    allCommunications.flatMap(comm => comm.tags || [])
)).sort();

// Get all unique projects
export const allProjects = Array.from(new Set(
    allCommunications.map(comm => comm.project).filter(Boolean)
)).sort();

// Get all coordinates for map visualization
export const allCoordinates = allCommunications
    .filter(comm => comm.coordinates)
    .map(comm => {
        const communicationItem = comm as Communication; // Explicitly cast to Communication type
        // console.log(`Mapping item ID: ${communicationItem.id}, Type found: ${communicationItem.type}`); // Log type after cast
        return {
            id: communicationItem.id,
            title: communicationItem.title,
            coordinates: communicationItem.coordinates!,
            year: communicationItem.year,
            activityType: communicationItem.type // Access type from the casted item
        };
    });

// Export the full list of communications
export { allCommunications }; 