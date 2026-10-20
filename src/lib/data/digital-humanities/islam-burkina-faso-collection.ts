import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const islamBurkinaFasoCollection: DigitalHumanitiesProject = {
	id: 'islam-burkina-faso-collection',
	title: 'Islam Burkina Faso Collection',
	years: '2018-2023',
	shortDescription:
		'The open-access database of over 2,900 documents on Islam and Muslims in Burkina Faso that I launched in 2021, and the foundation of the Islam West Africa Collection. Now archived.',
	description: `
		<p>How do you study Islam in Burkina Faso when the newspapers, magazines and archives you need are scattered, fragile and often impossible to consult, even inside the country? The <em>Islam Burkina Faso Collection</em>, which I developed from 2018 and launched in 2021, was my answer: an open-access database of over 2,900 archival documents, newspaper articles, Islamic publications and photographs on Islam and Muslims in Burkina Faso since the 1960s.</p>
		<p>Optical character recognition (OCR) made every document searchable in full. Alongside the sources, the database indexed more than 275 books, chapters, articles and theses, and nearly 1,000 events, places, organisations, people and topics. Two <a href="/digital-humanities/burkina-faso-digital-exhibits">digital exhibits</a>, on the hajj and on Muslim student activism, showed how the material could be read.</p>
		<p>It was one of the first digital humanities projects published by <a href="https://librarypress.domains.uflib.ufl.edu/" target="_blank" rel="noopener noreferrer">LibraryPress@UF</a>, a programme of the University of Florida Libraries and University of Florida Press for public scholarship in digital formats.</p>

		<h2>From Burkina Faso to West Africa</h2>
		<p>The collection became the foundation of my digital humanities work. Its materials now live in the <a href="/digital-humanities/iwac">Islam West Africa Collection</a>, which covers six countries and has grown far beyond it: Burkina Faso alone now accounts for more than 8,000 of its newspaper articles. The original site is archived and can still be viewed through the Internet Archive.</p>
	`,
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
	order: 10,
	// The LibraryPress@UF host still serves the static pages, but item browsing,
	// search and the API fail (HTTP 500, October 2026), so the Internet Archive
	// snapshot is the working copy; labelled rather than shown bare.
	links: [
		{
			url: 'https://web.archive.org/web/20240312164955/https://islam.domains.uflib.ufl.edu/s/bf/page/home',
			label: 'islam.domains.uflib.ufl.edu (Internet Archive)'
		}
	],
	skills: [
		'Omeka S',
		'Tesseract',
		'OCR',
		'Metadata Standards',
		'OpenRefine',
		'Zotero',
		'Linked Data'
	],
	seoKeywords: [
		'Islam Burkina Faso Collection',
		'Burkina Faso',
		'Islam',
		'digital archive',
		'open access',
		'Omeka S',
		'LibraryPress@UF',
		'Islam West Africa Collection',
		'digital humanities'
	]
};
