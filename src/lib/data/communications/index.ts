import type { Communication } from '$lib/types/communication';

// Define a type for module imports
type ModuleType = Record<string, any>;

// Dynamically import all communication files (including subdirectories)
const communicationContext = import.meta.glob<ModuleType>('./**/*.ts', { eager: true });
const allCommunications: Communication[] = Object.values(communicationContext)
    .filter((module): module is ModuleType => !!module && (typeof module === 'object'))
    .map(module => {
        // If there's a default export, use it, otherwise take the first exported value
        const communication = 'default' in module 
            ? module.default 
            : Object.values(module)[0];
        return communication as Communication;
    })
    .filter(comm => comm.id && comm.id !== 'communication-template-id'); // Filter out template

// Sort by date (most recent first)
export const communicationsByDate = [...allCommunications].sort((a, b) => {
    return new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime();
});

// Group communications by year
export const communicationsByYear = allCommunications.reduce<Record<number, Communication[]>>((acc, communication) => {
    if (!acc[communication.year]) {
        acc[communication.year] = [];
    }
    acc[communication.year].push(communication);
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
    if (!acc[communication.country]) {
        acc[communication.country] = [];
    }
    acc[communication.country].push(communication);
    return acc;
}, {});

// Get all unique tags
export const allTags = Array.from(new Set(
    allCommunications.flatMap(comm => comm.tags || [])
)).sort();

// Get all coordinates for map visualization
export const allCoordinates = allCommunications
    .filter(comm => comm.coordinates)
    .map(comm => ({
        id: comm.id,
        title: comm.title,
        coordinates: comm.coordinates!,
        year: comm.year
    }));

// Export the full list of communications
export { allCommunications }; 