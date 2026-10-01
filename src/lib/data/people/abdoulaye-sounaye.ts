import type { Person } from '$lib/types/person';

export const person: Person = {
	"id": "abdoulaye-sounaye",
	"name": "Abdoulaye Sounaye",
	"affiliations": [
		{
			"institution": "Leibniz-Zentrum Moderner Orient",
			"years": [
				2021
			],
			"confidence": "verified",
			"sources": [
				{
					"url": "https://github.com/fmadore/Remoboko/blob/master/Final%20report/Data/Publications_and_activities_data.json",
					"label": "Dated workshop report mirror",
					"quote": "Dr. Abdoulaye Sounaye (ZMO)"
				}
			],
			"institutionId": "leibniz-zentrum-moderner-orient",
			"note": "Evidence supports 2021; continuous employment is not inferred. Report dated 2022-01-24 explicitly describes the 2021 workshop. Title: Report – Workshop 16-17 November, 2021"
		},
		{
			"institution": "Leibniz-Zentrum Moderner Orient",
			"years": [
				2022
			],
			"confidence": "uncertain",
			"sources": [
				{
					"url": "https://github.com/fmadore/Website/blob/main/src/lib/data/communications/events/workshop-religions-on-campus-2022.ts",
					"label": "Existing site data",
					"quote": "{\n\t\t\tname: 'Abdoulaye Sounaye',\n\t\t\trole: 'Convenor and Speaker',\n\t\t\taffiliation: 'Leibniz-Zentrum Moderner Orient'\n\t\t}"
				}
			],
			"institutionId": "leibniz-zentrum-moderner-orient",
			"note": "Evidence supports 2022; continuous employment is not inferred. Existing website affiliation; independent event-year confirmation was not obtained."
		},
		{
			"institution": "Leibniz-Zentrum Moderner Orient",
			"years": [
				2023
			],
			"confidence": "uncertain",
			"sources": [
				{
					"url": "https://github.com/fmadore/Website/blob/main/src/lib/data/communications/events/university-campuses-africa.ts",
					"label": "Existing site event record",
					"quote": "name: 'Abdoulaye Sounaye', role: 'Convenor and Speaker', affiliation: 'Leibniz-Zentrum Moderner Orient'"
				}
			],
			"institutionId": "leibniz-zentrum-moderner-orient",
			"note": "Evidence supports 2023; continuous employment is not inferred. Affiliation exists in an event record. Publisher verification and exact publication-year coverage remain unconfirmed; no employment interval inferred. DOI/publisher response redirects to a ZMO proof-of-work challenge despite HTTP200. Existing event affiliation is contextual and has not been verified against the 2023 chapter. DOI/publisher response redirects to a ZMO proof-of-work challenge despite HTTP200. Existing event affiliation is contextual and has not been verified against the 2023 publication. Existing website affiliation; independent event-year confirmation was not obtained."
		}
	]
};
