// src/lib/types/award.ts
export interface Award {
	id: string; // Unique identifier (e.g., 'cski-emerging-2023')
	title: string; // e.g., 'Emerging Open Scholarship Award', 'Author of the month'
	institution: string; // e.g., 'Canadian Social Knowledge Institute (C-SKI)', 'Africa Today'
	year: number;
	dateISO: string; // Full date for sorting, e.g., '2023-01-01'
	location?: string; // Optional location if relevant
	details?: string; // Optional extra details
}
