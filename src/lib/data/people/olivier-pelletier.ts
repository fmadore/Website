import type { Person } from '$lib/types/person';

export const person: Person = {
	"id": "olivier-pelletier",
	"name": "Olivier Pelletier",
	"affiliations": [
		{
			"institution": "Université Laval",
			"years": [
				2016
			],
			"confidence": "verified",
			"sources": [
				{
					"url": "https://github.com/fmadore/Website/blob/main/static/images/communications/evolutions-nouvelles-formes-islam-afrique-ouest-hero.webp",
					"label": "Contemporaneous event poster",
					"quote": "Olivier Pelletier, Étudiant à la maîtrise aux HEI, Université Laval"
				}
			],
			"institutionId": "universite-laval",
			"note": "Evidence supports 2016; continuous employment is not inferred. Affiliation read directly from the organizer’s poster, dated 24 March 2016."
		}
	]
};
