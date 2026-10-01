import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'ashleigh-harris',
	name: 'Ashleigh Harris',
	affiliations: [
		{
			institution: 'Uppsala University',
			years: [2025],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/panels/ecas-2025.ts#L40',
					label: 'Existing site data',
					quote: "name: 'Ashleigh Harris', affiliation: 'Uppsala University'"
				}
			],
			institutionId: 'uppsala-university',
			note: 'Evidence supports 2025; continuous employment is not inferred. Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		},
		{
			institution: 'Uppsala University',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/dh-ai-african-studies-2026/blob/main/src/lib/data/participants/ashleigh-harris.ts',
					label:
						'Charting New Territory: Digital Humanities and AI in African Studies — participant record',
					quote:
						"affiliation: 'African Literary Metadata (ALMEDA)'\nAshleigh Harris is Professor of English at Uppsala University and team leader of the ALMEDA project. ALMEDA collects and links data on African literary and expressive culture that does not usually get catalogued in formal archives. Harris works more specifically on Zimbabwean and South African literature, as well as print and online ephemeral literatures from across the sub-Saharan continent."
				},
				{
					url: 'https://doi.org/10.58144/20260827-000',
					label: 'Publication DOI'
				},
				{
					url: 'https://github.com/fmadore/dh-ai-african-studies-2026/blob/main/src/lib/data/position-paper-meta.ts',
					label: 'Published paper affiliation statement',
					quote:
						'Affiliations and short biographies of all workshop participants are available on the workshop website: https://fmadore.github.io/dh-ai-african-studies-2026/participants.'
				}
			],
			institutionId: 'uppsala-university',
			note: 'Evidence supports 2026; continuous employment is not inferred. Attested for the 2026 paper via its explicit link to participant affiliations. Start/end delimit supported year only, not employment tenure. Affiliation field names the ALMEDA project; biography explicitly says Professor of English at Uppsala University. University used as institution. The organiser’s public participant biography corroborates this institution in the 2026 workshop context. Do not transfer verification to earlier conference years or infer continuous employment. Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
