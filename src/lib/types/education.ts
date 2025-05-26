// src/lib/types/education.ts
export interface Education {
	id: string; // Unique identifier (e.g., 'phd-pol-sci-uo')
	degree: string; // e.g., 'Ph.D. in Political Science' or 'Digital Humanities Winter School'
	institution: string; // e.g., 'Université Laval' or 'Hebrew University'
	location?: string; // e.g., 'Québec City, QC, Canada' or 'Mount Scopus Campus (Israel)'
	year: number; // Year of completion/attendance
	type?: 'Degree' | 'Training' | 'Certificate' | string; // Add 'Certificate'
	thesisTitle?: string; // Optional thesis title (likely for degrees)
	details?: string; // Any additional details
	dateISO: string; // Full date for sorting, e.g., '2018-09-01'
}
