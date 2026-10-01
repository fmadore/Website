import type { Person } from '$lib/types/person';

export const person: Person = {
	"id": "muriel-gomez-perez",
	"name": "Muriel Gomez-Perez",
	"affiliations": [
		{
			"institution": "Université Laval",
			"years": [
				2013
			],
			"confidence": "verified",
			"sources": [
				{
					"url": "https://www.erudit.org/fr/revues/theologi/2013-v21-n2-theologi01684/1028465ar/",
					"label": "Publisher publication author affiliation",
					"quote": "citation_author: Gomez-Perez, Muriel; citation_author_institution: Sciences historiques, Université Laval (Canada)"
				},
				{
					"url": "https://doi.org/10.7202/1028465ar",
					"label": "Publication DOI"
				},
				{
					"url": "https://api.crossref.org/works/10.7202%2F1028465ar",
					"label": "Corroborating DOI registration"
				}
			],
			"institutionId": "universite-laval",
			"note": "Evidence supports 2013; continuous employment is not inferred. Affiliation is explicitly attached to the article in the 2013 issue (citation_year and citation_publication_date both 2013). Online publication is 2015-02-03; observedYear denotes the bibliographic issue year, not a verified employment interval. Crossref independently repeats the author affiliation."
		},
		{
			"institution": "Université Laval",
			"years": [
				2014
			],
			"confidence": "uncertain",
			"sources": [
				{
					"url": "https://github.com/fmadore/Website/blob/main/src/lib/data/communications/events/evolutions-nouvelles-formes-islam-afrique-ouest.ts",
					"label": "Candidate affiliation evidence from another year",
					"quote": "{ name: 'Muriel Gomez-Perez', role: 'Panelist', affiliation: 'Université Laval' }"
				},
				{
					"url": "https://api.crossref.org/works/10.1163%2F21540993-00702001",
					"label": "Candidate affiliation evidence from another year",
					"quote": "Muriel Gomez-Perez — affiliation: Université Laval"
				},
				{
					"url": "https://www.erudit.org/fr/revues/theologi/2013-v21-n2-theologi01684/1028465ar/",
					"label": "Candidate affiliation evidence from another year",
					"quote": "citation_author: Gomez-Perez, Muriel; citation_author_institution: Sciences historiques, Université Laval (Canada)"
				}
			],
			"institutionId": "universite-laval",
			"note": "Evidence supports 2014; continuous employment is not inferred. Live Crossref record was retrieved but provides no author affiliations; DOI/publisher requests returned HTTP405. Other-year Laval evidence does not establish this 2014 publication affiliation."
		},
		{
			"institution": "Université Laval",
			"years": [
				2016
			],
			"confidence": "uncertain",
			"sources": [
				{
					"url": "https://github.com/fmadore/Website/blob/main/src/lib/data/communications/events/evolutions-nouvelles-formes-islam-afrique-ouest.ts",
					"label": "Existing site event record",
					"quote": "{ name: 'Muriel Gomez-Perez', role: 'Panelist', affiliation: 'Université Laval' }"
				},
				{
					"url": "https://api.crossref.org/works/10.1163%2F21540993-00702001",
					"label": "Candidate affiliation evidence from another year",
					"quote": "Muriel Gomez-Perez — affiliation: Université Laval"
				},
				{
					"url": "https://www.erudit.org/fr/revues/theologi/2013-v21-n2-theologi01684/1028465ar/",
					"label": "Candidate affiliation evidence from another year",
					"quote": "citation_author: Gomez-Perez, Muriel; citation_author_institution: Sciences historiques, Université Laval (Canada)"
				}
			],
			"institutionId": "universite-laval",
			"note": "Evidence supports 2016; continuous employment is not inferred. Affiliation exists in an event record. Publisher verification and exact publication-year coverage remain unconfirmed; no employment interval inferred. Crossref identifies the chapter authors but their affiliation arrays are empty. DOI/publisher HTML is a JSTOR challenge page, not chapter content. No publication-specific author institution was recovered."
		},
		{
			"institution": "Université Laval",
			"years": [
				2016
			],
			"confidence": "verified",
			"sources": [
				{
					"url": "https://api.crossref.org/works/10.1163%2F21540993-00702001",
					"label": "Doi registration author affiliation",
					"quote": "Muriel Gomez-Perez — affiliation: Université Laval"
				},
				{
					"url": "https://doi.org/10.1163/21540993-00702001",
					"label": "Publication DOI"
				},
				{
					"url": "https://github.com/fmadore/Website/blob/main/static/images/communications/evolutions-nouvelles-formes-islam-afrique-ouest-hero.webp",
					"label": "Contemporaneous event poster",
					"quote": "Muriel Gomez-Perez, Professeure, Dép d’histoire, Université Laval"
				}
			],
			"institutionId": "universite-laval",
			"note": "Evidence supports 2016; continuous employment is not inferred. Crossref author.affiliation explicitly gives Université Laval for this paper, published 2016-11-02. Supports this publication, not uninterrupted employment. Affiliation read directly from the organizer’s poster, dated 24 March 2016."
		}
	]
};
