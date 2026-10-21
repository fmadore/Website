import type { DigitalHumanitiesProject } from '#lib/types/digitalHumanities.ts';

export const burkinaFasoDigitalExhibits: DigitalHumanitiesProject = {
	id: 'burkina-faso-digital-exhibits',
	title: 'Digital Exhibits on Islam in West Africa',
	years: '2021-2026',
	shortDescription:
		"Four digital exhibits that open thematic paths through the Islam West Africa Collection: the hajj and Muslim student activism in Burkina Faso, intégrisme in Côte d'Ivoire, and the debate over secularism across the region.",
	description: `
		<p>These four exhibits turn the <a href="/digital-humanities/iwac">Islam West Africa Collection</a> into guided paths through a single theme. Each ties the collection's sources to a focused historical analysis: two as interactive timelines with selected bibliographies, two as essays and dashboards that read across the whole corpus.</p>

		<h2>Hajj in Burkina Faso</h2>
		<p>The history of the pilgrimage to Mecca from Burkina Faso, formerly Upper Volta, told through newspaper articles from the collection. An interactive <a href="https://timeline.knightlab.com/" target="_blank" rel="noopener noreferrer">TimelineJS</a> timeline runs from the colonial period to the present: early overland journeys, the colonial administration of the hajj, state-organised pilgrimages after independence, and today's debates over how the pilgrimage is managed.</p>

		<h2>Student activism in Burkina Faso</h2>
		<p>The rise of Muslim student movements in Burkina Faso, above all the Association des Élèves et Étudiants Musulmans au Burkina (AEEMB). Drawing on my doctoral research, the timeline follows Muslim youth organising from early groups in Ouagadougou to the networks of francophone Muslim intellectuals, through tensions between generations, the rise of reformist currents, and students' engagement with citizenship and religious authority.</p>

		<h2>Intégrisme in Côte d'Ivoire</h2>
		<p>In the early 1990s, as Côte d'Ivoire moved to multiparty politics, the word <em>intégrisme</em>, first used for Catholic fundamentalism, was increasingly applied to the country's Muslims and cast them as a source of instability. This exhibit shows how state authorities and their allies used that shift in vocabulary to define a domestic "other", and how francophone Muslim intellectuals answered the label in their own periodicals, drawing on the collection's Islamic publications from 1990 onwards.</p>

		<h2>Secularism</h2>
		<p>An interactive dashboard on how <em>laïcité</em> has been debated across six decades of West African newspapers, Islamic periodicals, archival documents, recordings and scholarship: when the word surges, who uses it and where, the arguments it carries, and how it circulates. A concordance shows every passage in context, and each record says how it entered the dossier, so that a single passing mention can be set aside. An AI model's reading of each record's relevance is shown with its caveats, as a guide rather than a validated finding.</p>
	`,
	imageUrl: `/images/digital-humanities/burkina-faso-digital-exhibits.webp`,
	order: 9,
	links: [
		{ url: 'https://islam.zmo.de/s/westafrica/page/exhibits', label: 'All exhibits' },
		{ url: 'https://islam.zmo.de/s/westafrica/page/hajj-bf', label: 'Hajj in Burkina Faso' },
		{
			url: 'https://islam.zmo.de/s/westafrica/page/student-activism-bf',
			label: 'Student activism in Burkina Faso'
		},
		{
			url: 'https://islam.zmo.de/s/westafrica/page/integrisme-cote-d-ivoire',
			label: "Intégrisme in Côte d'Ivoire"
		},
		{ url: 'https://islam.zmo.de/s/westafrica/page/secularism', label: 'Secularism' }
	],
	skills: [
		'Digital exhibitions',
		'Timeline JS',
		'Omeka S',
		'Data Visualisation',
		'Corpus Linguistics'
	],
	seoKeywords: [
		'digital exhibitions',
		'hajj',
		'Burkina Faso',
		"Côte d'Ivoire",
		'laïcité',
		'secularism',
		'intégrisme',
		'Muslim students',
		'Islam West Africa',
		'IWAC',
		'digital humanities'
	],
	embeddableContent: [
		{
			type: 'iframe',
			id: 'hajj-burkina-faso-timeline',
			title: 'Hajj in Burkina Faso',
			src: 'https://cdn.knightlab.com/libs/timeline3/latest/embed/index.html?source=1StFgUqQxqOMlo6GqiKGQWP2GC92W1YG51vHvoNijDdQ&font=Default&lang=en&initial_zoom=2&height=650',
			height: '650px', // Timeline JS requires specific height matching URL parameter
			variant: 'fixed',
			showTitle: true
		},
		{
			type: 'iframe',
			id: 'student-activism-burkina-faso-timeline',
			title: 'Student activism in Burkina Faso',
			src: 'https://cdn.knightlab.com/libs/timeline3/latest/embed/index.html?source=1AmCWiL1QbMztXxJ48TXNUgaoodYc8aBFG-7dFsiz3jc&font=Default&lang=en&initial_zoom=2&height=650',
			height: '650px', // Timeline JS requires specific height matching URL parameter
			variant: 'fixed',
			showTitle: true
		}
	]
};
