import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const islamBurkinaFasoCollection: DigitalHumanitiesProject = {
	id: 'islam-burkina-faso-collection',
	title: 'Islam Burkina Faso Collection',
	years: '2018-2023',
	shortDescription:
		'An open-access digital database developed to address a critical gap in research infrastructure for West African Islamic studies, containing over 2,900 documents on Islam and Muslims in Burkina Faso. Now archived within the Islam West Africa Collection (IWAC).',
	description:
		'<p>The <em>Islam Burkina Faso Collection</em> is an open-access digital database that I developed between 2018 and 2023 to address a critical gap in research infrastructure for West African Islamic studies. The collection contains over 2,900 archival documents, newspaper articles, Islamic publications, and photographs documenting Islam and Muslims in Burkina Faso—materials that are often difficult or impossible to access outside, and sometimes even inside, the country.</p><p>Beyond primary sources, the database indexes more than 275 bibliographical references (books, chapters, journal articles, dissertations, and theses) and provides a comprehensive index of nearly 1,000 events, locations, organizations, people, and topics. Optical character recognition (OCR) has been applied to all documents, enabling full-text search across the entire collection.</p><p>The project was one of the first digital humanities initiatives published under <a href="https://librarypress.domains.uflib.ufl.edu/" target="_blank" rel="noopener noreferrer">LibraryPress@UF</a>, a program of the University of Florida Libraries and University of Florida Press that develops public scholarship across digital formats.</p><p><strong>Note:</strong> The <em>Islam Burkina Faso Collection</em> served as the foundational project for my ongoing digital humanities work and has now been archived. All materials have been integrated into the expanded <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection (IWAC)</em></a>, which covers six countries and continues to grow.</p>',
	imageUrl: `/images/digital-humanities/islam-burkinafaso-banner.webp`,
	award:
		"I won a <a href='https://etcl.uvic.ca/2023/01/17/2023-open-scholarship-awards/' target='_blank' rel='noopener noreferrer'>2023 Emerging Open Scholarship Award</a>, sponsored by the <a href='https://c-ski.ca/' target='_blank' rel='noopener noreferrer'>Canadian Social Knowledge Institute (C-SKI)</a> and its partners, for my work on the Islam Burkina Faso Collection.",
	reviews: [
		{
			text: 'Robert Launay, "Review: Islam Burkina Faso Collection", <em>Reviews in Digital Humanities</em> 4, no. 4 (2023).',
			url: 'https://doi.org/10.21428/3e88f64f.89e71c81',
			quote:
				'The collection is an invaluable research tool for scholars in or outside Burkina Faso, offering access to material that is difficult or impossible to find outside — and sometimes even inside — the country [...] The collection is an extremely important contribution and critical aid to scholarship on Islam in West Africa.'
		},
		{
			text: 'Vincent Hiribarren, "Review of Frédérick Madore \'Islam Burkina Faso Collection\'", <em>Mande Studies</em> 24 (2022): 325-27.',
			url: 'https://doi.org/10.2979/mnd.2022.a908483',
			quote:
				'Obviously, this is an impressive achievement, and the project launched in 2021 by Frédérick Madore will become an increasingly useful repository since travel in and to Burkina Faso has become more difficult. [...] What the interface also clearly offers is a potential re-interpretation of the documents used by Madore and new possible enquiries for students and professional researchers. The two exhibitions available on the website demonstrate the potential of such an approach and the way the database can also become part of our teaching. [...] the Islam Burkina Faso Collection is already a fascinating resource with a significant potential for future researchers.'
		}
	],
	publication: {
		text: 'To learn more about this project, see Frédérick Madore, "La Collection Islam Burkina Faso : promesses et défis des humanités numériques". <em>Revue d\'Histoire Contemporaine de l\'Afrique</em> 2021.',
		url: 'https://doi.org/10.51185/journals/rhca.2021.e610'
	},
	order: 9,
	skills: ['Omeka S', 'Tesseract', 'Metadata Standards', 'OpenRefine', 'Zotero', 'Linked Data']
};
