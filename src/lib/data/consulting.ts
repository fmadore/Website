import type { ConsultingEngagement } from '$lib/types/cv';

/**
 * Consulting and legal expertise, printed by `CVConsulting.svelte` and the
 * CV's Markdown twin. Newest first.
 */
export const consulting: ConsultingEngagement[] = [
	{
		year: '2025–',
		role: 'Consultant',
		organization: 'Communitology',
		descriptions: [
			'Provide research-driven analysis and expert testimony in asylum and immigration proceedings.',
			'Prepare Country of Origin Information (COI) reports for cases on Benin, Côte d’Ivoire, and Togo.'
		]
	}
];
