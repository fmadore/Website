import type { Person } from '$lib/types/person';

export const person: Person = {
	"id": "marie-brossier",
	"name": "Marie Brossier",
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
					"quote": "Marie Brossier, Professeure, Dép de science politique, Université Laval"
				}
			],
			"institutionId": "universite-laval",
			"note": "Evidence supports 2016; continuous employment is not inferred. Affiliation read directly from the organizer’s poster, dated 24 March 2016."
		}
	]
};
