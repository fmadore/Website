import type { YearRange } from '$lib/types'; // Assuming YearRange might be useful

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

// Example Template - Replace with actual data
/*
export const affiliationTemplate: ProfessionalAffiliation = {
    id: 'affiliation-template-id', // Replace with a unique ID
    name: 'Islam in Africa Studies Group',
    abbreviation: 'IASG',
    parentOrganization: 'African Studies Association (ASA)',
    period: { start: 2017, end: 'present' },
    url: 'https://example.com/iasg', // Optional: Add URL if available
    roles: [
        {
            title: 'Secretary',
            period: { start: 2024, end: 'present' }
        }
    ]
};
*/
