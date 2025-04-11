// src/lib/types/appointment.ts
export interface Appointment {
	id: string; // Unique identifier (e.g., 'visiting-ehess-2025')
	title: string; // e.g., 'Visiting Scholar', 'Research Fellow'
	institution: string; // e.g., 'EHESS', 'Leibniz-Zentrum Moderner Orient'
	location?: string; // e.g., 'Paris (France)', 'Berlin (Germany)'
	startYear: number;
	endYear?: number | null; // Null or omitted if ongoing
	dateRangeString: string; // Display string like '2025', '2021–Present', '2018–2020'
	dateISOStart: string; // Start date for sorting, e.g., '2025-01-01'
	dateISOEnd?: string | null; // Optional end date for sorting
	details?: string; // Optional extra details
} 