import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwac: DigitalHumanitiesProject = {
	id: 'iwac',
	title: 'Islam West Africa Collection',
	years: '2023-',
	shortDescription:
		"A collection of over 13,000 documents on Islam and Muslims in Burkina Faso, Benin, Niger, Nigeria, Togo and Côte d'Ivoire.",
	description:
		"<p>The <em>Islam West Africa Collection (IWAC)</em> is an open access digital archive that brings together a wide range of materials related to Islam and Muslim societies in West Africa. It currently comprises over 13,000 items, including newspaper articles, official documents, scholarly publications, and grey literature, primarily focusing on Benin, Burkina Faso, Côte d'Ivoire, Niger, Nigeria, and Togo.</p><p>The collection aims to provide a rich resource for researchers, students, and the general public interested in the history and contemporary dynamics of Islam in the region. It is an ongoing project, with new materials being added regularly.</p>",
	imageUrl: `/images/digital-humanities/IWAC.webp`, // Assuming base is handled globally or in component
	linkUrl: 'https://islam.zmo.de/s/westafrica/',
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
