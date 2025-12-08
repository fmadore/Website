// src/lib/types/grant.ts
export interface Grant {
	id: string; // Unique identifier (e.g., 'fritz-thyssen-2023')
	title: string; // e.g., 'Support for an international conference', 'Banting Postdoctoral Fellowship'
	funder: string; // e.g., 'Fritz Thyssen Foundation', 'SSHRC'
	startYear: number;
	endYear?: number | null; // Null or omitted if single year or ongoing
	dateRangeString: string; // Display string like '2023', '2018–2020'
	dateISOStart: string; // Start date for sorting, e.g., '2023-01-01'
	dateISOEnd?: string | null; // Optional end date for sorting
	amount?: number;
	currency?: string; // e.g., 'EUR', 'CAD'
	status?: 'Awarded' | 'Turned Down' | string; // Optional status
	details?: string; // Optional extra details
	coApplicants?: string[]; // Optional list of co-applicants
}
