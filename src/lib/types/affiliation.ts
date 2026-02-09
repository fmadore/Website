import type { YearRange } from './utils';

export interface ProfessionalAffiliation {
	id: string; // Unique identifier for the affiliation data entry
	name: string; // Name of the organization or group
	abbreviation?: string; // Optional abbreviation (e.g., IASG)
	parentOrganization?: string; // Optional parent organization (e.g., ASA)
	period: YearRange | { start: number; end: 'present' | number }; // Membership period
	url?: string; // Optional URL for the affiliation
	roles?: {
		// Optional roles held within the affiliation
		title: string; // e.g., Secretary
		period: YearRange | { start: number; end: 'present' | number }; // Role period
	}[];
}
