// src/lib/types/editorial-membership.ts
export interface EditorialMembership {
	id: string; // Unique identifier (e.g., 'rhca-committee-2025')
	journal: string; // Name of the journal or publication
	role: string; // e.g., 'Editorial committee', 'Editorial board member', 'Advisory board'
	startYear: number;
	endYear?: number | null; // Null or omitted if ongoing
	dateRangeString: string; // Display string like '2025', '2021–Present'
	dateISOStart: string; // Start date for sorting, e.g., '2025-01-01'
	dateISOEnd?: string | null; // Optional end date for sorting
	details?: string; // Optional extra details
}
