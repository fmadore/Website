import type { Communication } from '$lib/types/communication';

// Define a type for module imports
type ModuleType = Record<string, any>;

// Dynamically import all communication files from papers, panels, and talks subfolders
const communicationContext = import.meta.glob<ModuleType>('./papers/**/*.ts', { eager: true });
const panelContext = import.meta.glob<ModuleType>('./panels/**/*.ts', { eager: true });
const talkContext = import.meta.glob<ModuleType>('./talks/**/*.ts', { eager: true });

// Merge the contexts
const allContexts = { ...communicationContext, ...panelContext, ...talkContext };

// Debug: Log the keys we're importing
console.log('Communication files being loaded:', Object.keys(allContexts));

const allCommunications: Communication[] = Object.values(allContexts)
    .filter((module): module is ModuleType => {
        if (!module || typeof module !== 'object') {
            console.warn('Skipping module that is not an object:', module);
            return false;
        }
        return true;
    })
    .map((module, index) => {
        try {
            // Log the module keys to see what's being processed
            const moduleKeys = Object.keys(module);
            // If there's a default export, use it, otherwise take the first exported value
            const communication = 'default' in module 
                ? module.default 
                : Object.values(module)[0];
                
            // Check for circular references that might cause serialization issues
            if (communication === module) {
                console.warn('Circular reference detected in module:', moduleKeys);
                return null;
            }
            
            return communication as Communication;
        } catch (error) {
            // Include more context about which file caused the error
            const files = Object.keys(allContexts);
            const fileName = files[index] || 'unknown';
            console.warn(`Error processing communication module ${fileName}:`, error);
            return null;
        }
    })
    .filter((comm): comm is Communication => {
        if (!comm) {
            return false;
        }
        if (!comm.id) {
            console.warn('Communication missing id:', comm);
            return false;
        }
        // Filter out template and invalid communications
        return comm.id !== 'paper-template-id' && comm.id !== 'panel-template-id' && comm.id !== 'talk-template-id'; 
    });

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