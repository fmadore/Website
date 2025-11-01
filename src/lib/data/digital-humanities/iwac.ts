import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwac: DigitalHumanitiesProject = {
	id: 'iwac',
	title: 'Islam West Africa Collection',
	years: '2023-',
	shortDescription:
		"A collection of over 14,000 documents on Islam and Muslims in Burkina Faso, Benin, Niger, Nigeria, Togo and Côte d'Ivoire.",
	description:
		"<p>The <em>Islam West Africa Collection (IWAC)</em> is an open access digital archive that brings together a wide range of materials related to Islam and Muslim societies in West Africa. It currently comprises over 13,000 items, including newspaper articles, official documents, scholarly publications, and grey literature, primarily focusing on Benin, Burkina Faso, Côte d'Ivoire, Niger, Nigeria, and Togo.</p><p>The collection aims to provide a rich resource for researchers, students, and the general public interested in the history and contemporary dynamics of Islam in the region. It is an ongoing project, with new materials being added regularly.</p>",
	imageUrl: `/images/digital-humanities/IWAC.webp`, // Assuming base is handled globally or in component
	linkUrl: 'https://islam.zmo.de/s/westafrica/',
	reviews: [
		{
			text: 'Anaïs Wion, "Islam West Africa Collection: Dataset, Distant Reading, and Uses of AI for Discourse Analysis", <em>The Digital Orientalist</em> 23 September 2025.',
			url: 'https://digitalorientalist.com/2025/09/23/islam-west-africa-collection-dataset-distant-reading-and-uses-of-ai-for-discourse-analysis/',
			quote:
				'On the one hand, it is a database providing access to material that is difficult to access and highly specific, which can be reused by others and addressed with other research questions. But it is also an exemplary project that can inspire researchers to use the open access tools available to create their own platforms for analyzing and sharing their data. The care taken to comply with open access best practices is truly admirable.'
		}
	],
	order: 1,
	skills: [
		'Omeka S',
		'OpenRefine',
		'Metadata Standards',
		'Docker',
		'Linux System Administration',
		'Nginx',
		'Python',
		'Tesseract',
		'IIIF',
		'Apache Solr',
		'Linked Data',
		'Rclone',
		'spaCy',
		'pandas',
		'Web scraping'
	]
	// iframes: [], // No specific iframes for the main project page itself, but sub-projects might have them
};
