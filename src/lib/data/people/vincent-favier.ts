import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'vincent-favier',
	name: 'Vincent Favier',
	affiliations: [
		{
			institution: 'Freie Universität Berlin',
			years: [2021],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Remoboko/blob/master/Final%20report/Data/Publications_and_activities_data.json',
					label: 'Dated workshop report mirror',
					quote: 'Vincent Favier (Freie  Universität Berlin/ZMO)'
				}
			],
			institutionId: 'freie-universitat-berlin',
			note: 'Evidence supports 2021; continuous employment is not inferred. Report dated 2022-01-24 explicitly describes the 2021 workshop. Title: Report – Workshop 16-17 November, 2021'
		},
		{
			institution: 'Leibniz-Zentrum Moderner Orient',
			years: [2021],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Remoboko/blob/master/Final%20report/Data/Publications_and_activities_data.json',
					label: 'Dated workshop report mirror',
					quote: 'Vincent Favier (Freie  Universität Berlin/ZMO)'
				}
			],
			institutionId: 'leibniz-zentrum-moderner-orient',
			note: 'Evidence supports 2021; continuous employment is not inferred. Report dated 2022-01-24 explicitly describes the 2021 workshop. Title: Report – Workshop 16-17 November, 2021'
		},
		{
			institution: 'Leibniz-Zentrum Moderner Orient',
			years: [2022],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Remoboko/blob/master/Final%20report/Data/Publications_and_activities_data.json',
					label: 'Dated workshop report mirror',
					quote: 'Vincent Favier (Leibniz-Zentrum Moderner Orient, ZMO)'
				}
			],
			institutionId: 'leibniz-zentrum-moderner-orient',
			note: 'Evidence supports 2022; continuous employment is not inferred. Report dated 2023-02-17 explicitly describes the 2022 workshop. Title: Report of the Workshop "Religions on Campus: Coexisting Traditions, Reformulating the Secular and Life Projects"'
		},
		{
			institution: 'Freie Universität Berlin',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Existing site data',
					quote:
						"{ name: 'Vincent Favier', role: 'Speaker', affiliation: 'ZMO / Freie Universität, Germany' }"
				}
			],
			institutionId: 'freie-universitat-berlin',
			note: 'Uncertain affiliation considered for 2023; continuous employment is not inferred. Existing website affiliation; independent event-year confirmation was not obtained. Existing display string names two institutions; each affiliation is kept separately and remains uncertain for this event year.'
		},
		{
			institution: 'Leibniz-Zentrum Moderner Orient',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Existing site data',
					quote:
						"{ name: 'Vincent Favier', role: 'Speaker', affiliation: 'ZMO / Freie Universität, Germany' }"
				}
			],
			institutionId: 'leibniz-zentrum-moderner-orient',
			note: 'Uncertain affiliation considered for 2023; continuous employment is not inferred. Existing website affiliation; independent event-year confirmation was not obtained. Existing display string names two institutions; each affiliation is kept separately and remains uncertain for this event year.'
		}
	]
};
