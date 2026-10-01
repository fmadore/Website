import type { Person } from '$lib/types/person';

export const person: Person = {
	"id": "jean-pierre-olivier-de-sardan",
	"name": "Jean Pierre Olivier de Sardan",
	"affiliations": [
		{
			"institution": "LASDEL (Niamey)",
			"years": [
				2022
			],
			"confidence": "verified",
			"sources": [
				{
					"url": "https://github.com/fmadore/Remoboko/blob/master/Final%20report/Data/Publications_and_activities_data.json",
					"label": "Dated workshop report mirror",
					"quote": "Jean Pierre Olivier de Sardan (LASDEL)"
				}
			],
			"institutionId": "lasdel-niamey",
			"note": "Evidence supports 2022; continuous employment is not inferred. Report dated 2023-02-17 explicitly describes the 2022 workshop. Title: Report of the Workshop \"Religions on Campus: Coexisting Traditions, Reformulating the Secular and Life Projects\""
		}
	]
};
