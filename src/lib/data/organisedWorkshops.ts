/**
 * Organiser-role schema.org Event graph for the workshops Frédérick Madore
 * co-organises. Surfaces them to Google's event results and makes the
 * organiser attribution machine-readable. Consumed by the
 * conference-activity route via useJsonLdScript.
 */
import { address, author, website } from '$lib/data/siteConfig';

const organiserPerson = {
	'@type': 'Person',
	name: author.name,
	url: website.url,
	affiliation: {
		'@type': 'Organization',
		// English form for schema.org consumers; siteConfig.address.institution
		// deliberately carries the German name ('Universität Bayreuth').
		name: 'University of Bayreuth',
		url: address.institutionUrl
	}
};

export const organisedWorkshopsJsonLd = JSON.stringify({
	'@context': 'https://schema.org',
	'@graph': [
		{
			'@type': 'Event',
			'@id': 'https://fmadore.github.io/dh-ai-african-studies-2026/#event',
			name: 'Digital Humanities and AI in African Studies 2026 — Charting New Territory',
			description:
				'A three-day international scoping workshop convening researchers to develop strategies for ethical integration of digital humanities and AI in African studies, prioritising collaboration over presentations.',
			startDate: '2026-02-18',
			endDate: '2026-02-20',
			eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
			eventStatus: 'https://schema.org/EventScheduled',
			url: 'https://fmadore.github.io/dh-ai-african-studies-2026/',
			location: {
				'@type': 'Place',
				name: 'Xplanatorium Herrenhausen',
				address: {
					'@type': 'PostalAddress',
					addressLocality: 'Hanover',
					addressCountry: 'DE'
				}
			},
			organizer: [
				organiserPerson,
				{
					'@type': 'Person',
					name: 'Vincent Hiribarren',
					affiliation: {
						'@type': 'Organization',
						name: "King's College London"
					}
				}
			],
			sponsor: [
				{ '@type': 'Organization', name: 'Volkswagen Foundation' },
				{ '@type': 'Organization', name: 'Leibniz-Zentrum Moderner Orient' },
				{
					'@type': 'Organization',
					name: 'Africa Multiple Cluster of Excellence, University of Bayreuth'
				}
			]
		},
		{
			'@type': 'Event',
			'@id': 'https://fmadore.github.io/stias-dh-ai-workshop-2026/#event',
			name: 'Digital Humanities and Artificial Intelligence in African Studies: Towards Sustainable and Equitable Practices',
			description:
				'A hybrid workshop examining how digital tools and AI are reshaping research methodologies in African Studies while prioritising sustainable infrastructure and indigenous knowledge systems.',
			startDate: '2026-09-21',
			endDate: '2026-09-24',
			eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
			eventStatus: 'https://schema.org/EventScheduled',
			url: 'https://fmadore.github.io/stias-dh-ai-workshop-2026/',
			location: {
				'@type': 'Place',
				name: 'Stellenbosch Institute for Advanced Study (STIAS)',
				address: {
					'@type': 'PostalAddress',
					addressLocality: 'Stellenbosch',
					addressCountry: 'ZA'
				}
			},
			organizer: [
				organiserPerson,
				{
					'@type': 'Person',
					name: 'Vincent Hiribarren',
					affiliation: { '@type': 'Organization', name: "King's College London" }
				},
				{ '@type': 'Person', name: 'Emmanuel Ngue Um' },
				{ '@type': 'Person', name: 'Menno van Zaanen' }
			],
			sponsor: [
				{ '@type': 'Organization', name: 'Point Sud' },
				{ '@type': 'Organization', name: 'STIAS' },
				{ '@type': 'Organization', name: 'Deutsche Forschungsgemeinschaft (DFG)' },
				{ '@type': 'Organization', name: 'Goethe University Frankfurt' },
				{
					'@type': 'Organization',
					name: 'Africa Multiple Cluster of Excellence, University of Bayreuth'
				},
				{ '@type': 'Organization', name: "King's College London" },
				{ '@type': 'Organization', name: 'SADiLaR' }
			]
		}
	]
});
