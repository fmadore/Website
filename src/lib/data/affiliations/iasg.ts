import type { ProfessionalAffiliation } from './template';

export const iasg: ProfessionalAffiliation = {
	id: 'iasg-asa', // Unique ID for this affiliation entry
	name: 'Islam in Africa Studies Group',
	abbreviation: 'IASG',
	parentOrganization: 'African Studies Association (ASA)',
	period: { start: 2017, end: 'present' },
	url: 'https://iasg.hcommons.org/',
	roles: [
		{
			title: 'Secretary',
			period: { start: 2024, end: 'present' }
		}
	]
};
