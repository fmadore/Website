// src/lib/types/education.ts
export interface Education {
	id: string; // Unique identifier (e.g., 'phd-pol-sci-uo')
	degree: string; // e.g., 'Ph.D. in Political Science'
	institution: string; // e.g., 'University of Ottawa'
	location?: string; // e.g., 'Ottawa, ON, Canada'
	year: number; // Year of completion
	thesisTitle?: string; // Optional thesis title
	details?: string; // Any additional details (e.g., specialization, honors)
	dateISO: string; // Full date for sorting, e.g., '2018-09-01'
} 