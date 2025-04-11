// src/lib/data/education/index.ts
import type { Education } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';

// Define a type for module imports
type ModuleType = Record<string, any>;

// Define template IDs to filter out (if you create one)
const templateIds: string[] = [
    // 'education-template-id' 
];

// Dynamically import all education files
const educationModules = import.meta.glob<ModuleType>(
    ['./*.ts'],
    { eager: true }
);

// Load and filter all education entries using the utility function
const allEducation: Education[] = loadData<Education>(
    educationModules,
    templateIds,
    'education' 
);

// Sort by date (most recent first) using dateISO
export const educationByDate = [...allEducation].sort((a, b) => {
    // Add fallback to year if dateISO is missing, though it's required in the type
    const dateB = b.dateISO ? new Date(b.dateISO).getTime() : b.year;
    const dateA = a.dateISO ? new Date(a.dateISO).getTime() : a.year;
    // Handle potential mix of date strings and years if fallback is used
    if (typeof dateB === 'number' && typeof dateA === 'number') {
        return dateB - dateA; // Sort years descending
    }
    return (dateB as number) - (dateA as number); // Sort timestamps descending
});

// Export the full list
export { allEducation };

// Group by year 
export const educationByYear = allEducation.reduce<Record<number, Education[]>>((acc, edu) => {
    if (!acc[edu.year]) {
        acc[edu.year] = [];
    }
    acc[edu.year].push(edu);
    return acc;
}, {}); 