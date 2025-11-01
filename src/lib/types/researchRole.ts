export interface ResearchRole {
	id: string;
	title: string;
	institution: string;
	startYear: number;
	endYear?: number | null;
	details: string | string[];
}
