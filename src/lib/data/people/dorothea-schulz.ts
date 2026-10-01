import type { Person } from '$lib/types/person';

export const person: Person = {
	"id": "dorothea-schulz",
	"name": "Dorothea Schulz",
	"affiliations": [
		{
			"institution": "University of Münster",
			"years": [
				2019
			],
			"confidence": "uncertain",
			"sources": [
				{
					"url": "https://github.com/fmadore/Website/blob/main/src/lib/data/communications/panels/asa-2019.ts",
					"label": "Existing site event record",
					"quote": "authors: [{ name: 'Dorothea E. Schulz', affiliation: 'University of Münster' }]"
				},
				{
					"url": "https://github.com/fmadore/Website/blob/main/src/lib/data/communications/panels/asa-2019.ts#L33",
					"label": "Existing site data",
					"quote": "name: 'Dorothea E. Schulz', affiliation: 'University of Münster'"
				}
			],
			"institutionId": "university-of-munster",
			"note": "Evidence supports 2019; continuous employment is not inferred. Affiliation exists in an event record. Publisher verification and exact publication-year coverage remain unconfirmed; no employment interval inferred. Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected."
		},
		{
			"institution": "University of Münster",
			"years": [
				2021
			],
			"confidence": "uncertain",
			"sources": [
				{
					"url": "https://github.com/fmadore/Website/blob/main/src/lib/data/communications/panels/asa-2019.ts",
					"label": "Candidate affiliation evidence from another year",
					"quote": "authors: [{ name: 'Dorothea E. Schulz', affiliation: 'University of Münster' }]"
				}
			],
			"institutionId": "university-of-munster",
			"note": "Evidence supports 2021; continuous employment is not inferred. Publisher issue-page request returned HTTP405. University of Münster is only documented in the existing 2019 panel record; no 2021 affiliation is inferred."
		},
		{
			"institution": "University of Münster",
			"years": [
				2021
			],
			"confidence": "verified",
			"sources": [
				{
					"url": "https://github.com/fmadore/Remoboko/blob/master/Final%20report/Data/Publications_and_activities_data.json",
					"label": "Dated workshop report mirror",
					"quote": "Dorothea E. Schulz (University of Münster)"
				}
			],
			"institutionId": "university-of-munster",
			"note": "Evidence supports 2021; continuous employment is not inferred. Report dated 2022-01-24 explicitly describes the 2021 workshop. Title: Report – Workshop 16-17 November, 2021"
		},
		{
			"institution": "University of Münster",
			"years": [
				2022
			],
			"confidence": "uncertain",
			"sources": [
				{
					"url": "https://github.com/fmadore/Website/blob/main/src/lib/data/communications/panels/asa-2019.ts",
					"label": "Candidate affiliation evidence from another year",
					"quote": "authors: [{ name: 'Dorothea E. Schulz', affiliation: 'University of Münster' }]"
				}
			],
			"institutionId": "university-of-munster",
			"note": "Evidence supports 2022; continuous employment is not inferred. Publisher issue-page request returned HTTP405. University of Münster is only documented in the existing 2019 panel record; no 2022 affiliation is inferred."
		}
	],
	"aliases": [
		"Dorothea E. Schulz"
	]
};
