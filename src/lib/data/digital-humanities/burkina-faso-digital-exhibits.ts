import type { DigitalHumanitiesProject } from '#lib/types/digitalHumanities.ts';

export const burkinaFasoDigitalExhibits: DigitalHumanitiesProject = {
	id: 'burkina-faso-digital-exhibits',
	title: 'Digital Exhibits on Islam in West Africa',
	years: '2021-',
	shortDescription:
		"Five digital exhibits that open thematic paths through the Islam West Africa Collection: the hajj and Muslim student activism in Burkina Faso, intégrisme in Côte d'Ivoire, the debate over secularism across the region, and the sermons of Albani Zaria.",
	description: `
		<p>These five exhibits turn the <a href="/digital-humanities/iwac">Islam West Africa Collection</a> into guided paths through a single theme. Each ties the collection's sources to a focused historical analysis: two as interactive timelines, three as essays and dashboards that read across the corpus. All are built from the blocks of <a href="https://github.com/fmadore/IwacVisualizations" target="_blank" rel="noopener noreferrer">IWAC Visualizations</a>, the collection's own Omeka S module, and open in English and French.</p>

		<h2>Hajj in Burkina Faso</h2>
		<p>The history of the pilgrimage to Mecca from Burkina Faso, formerly Upper Volta, told through newspaper articles from the collection. An interactive timeline runs from the colonial period to the present: early overland journeys, the colonial administration of the hajj, state-organised pilgrimages after independence, and today's debates over how the pilgrimage is managed.</p>

		<h2>Student activism in Burkina Faso</h2>
		<p>The rise of Muslim student movements in Burkina Faso, above all the Association des Élèves et Étudiants Musulmans au Burkina (AEEMB). Drawing on my doctoral research, the timeline follows Muslim youth organising from early groups in Ouagadougou to the networks of francophone Muslim intellectuals, through tensions between generations, the rise of reformist currents, and students' engagement with citizenship and religious authority.</p>

		<h2>Intégrisme in Côte d'Ivoire</h2>
		<p>In the early 1990s, as Côte d'Ivoire moved to multiparty politics, the word <em>intégrisme</em>, first used for Catholic fundamentalism, was increasingly applied to the country's Muslims and cast them as a source of instability. This exhibit shows how state authorities and their allies used that shift in vocabulary to define a domestic "other", and how francophone Muslim intellectuals answered the label in their own periodicals, drawing on the collection's Islamic publications from 1990 onwards. A chart follows <em>intégrisme</em>, <em>extrémisme</em>, <em>terrorisme</em> and their kin through the press from 1961 to 2025.</p>

		<h2>Secularism</h2>
		<p>An interactive dashboard on how <em>laïcité</em> has been debated across six decades of West African newspapers, Islamic periodicals, archival documents, recordings and scholarship: when the word surges, who uses it and where, the arguments it carries, and how it circulates. A concordance shows every passage in context, and each record says how it entered the dossier, so that a single passing mention can be set aside. An AI model's reading of each record's relevance is shown with its caveats, as a guide rather than a validated finding.</p>

		<h2>Albani Zaria's sermons</h2>
		<p>The Hausa and Arabic sermon transcripts of Shaykh Muhammad Auwal Albani Zaria, read for their vocabulary, the people and places they name, and how they speak of youth and politics, with each passage linked to its recording. The word lists are drafts, awaiting review by a Hausa-speaking specialist.</p>
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
		{ url: 'https://islam.zmo.de/s/westafrica/page/secularism', label: 'Secularism' },
		{
			url: 'https://islam.zmo.de/s/westafrica/page/albani-zaria-sermons',
			label: "Albani Zaria's sermons"
		},
		{
			url: 'https://github.com/fmadore/IwacVisualizations',
			label: 'IwacVisualizations',
			type: 'code'
		}
	],
	skills: [
		'Digital Exhibitions',
		'ECharts',
		'Omeka S',
		'Data Visualisation',
		'Corpus Linguistics',
		'PHP'
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
		'Albani Zaria',
		'Hausa sermons',
		'Islam West Africa',
		'IWAC',
		'digital humanities'
	]
};
