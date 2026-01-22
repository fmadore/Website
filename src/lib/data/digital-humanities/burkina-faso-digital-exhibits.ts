import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const burkinaFasoDigitalExhibits: DigitalHumanitiesProject = {
	id: 'burkina-faso-digital-exhibits',
	title: 'Digital Exhibits on Islam in Burkina Faso',
	years: '2021',
	shortDescription:
		'Two digital exhibits featuring curated materials from the Islam West Africa Collection, each with an interactive timeline, contextual narratives, and selective bibliography.',
	description:
		'<p>These two digital exhibits bring together curated selections of materials from the <a href="https://islam.zmo.de/s/westafrica/page/home" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em></a> around specific themes. Each exhibit features an interactive timeline built with <a href="https://timeline.knightlab.com/" target="_blank" rel="noopener noreferrer">TimelineJS</a>, contextual narratives to help interpret the primary sources, and a selective bibliography for further reading.</p><h3>Hajj in Burkina Faso</h3><p>This exhibit traces the history of the pilgrimage to Mecca (<em>hajj</em>) from Burkina Faso (formerly Upper Volta), drawing on newspaper articles from the Collection. The timeline covers the colonial period to the present, documenting topics such as early overland pilgrimages, colonial administration of the hajj, the evolution of state-organized pilgrimages after independence, and contemporary debates around hajj management.</p><h3>Student Activism in Burkina Faso</h3><p>This exhibit explores the emergence and development of Islamic student movements in Burkina Faso, with particular focus on the Association des Élèves et Étudiants Musulmans au Burkina (AEEMB). The timeline texts draw from my doctoral dissertation and trace the history of Muslim youth organizing from early groupings in Ouagadougou through the consolidation of francophone Muslim intellectual networks. The exhibit addresses themes including intergenerational dynamics within Islamic associations, the rise of reformist currents, and student engagement with broader questions of citizenship and religious authority.</p>',
	imageUrl: `/images/digital-humanities/burkina-faso-digital-exhibits.webp`,
	order: 10,
	skills: ['Timeline JS'],
	embeddableContent: [
		{
			type: 'iframe',
			id: 'hajj-burkina-faso-timeline',
			title: 'Hajj in Burkina Faso',
			src: 'https://cdn.knightlab.com/libs/timeline3/latest/embed/index.html?source=1StFgUqQxqOMlo6GqiKGQWP2GC92W1YG51vHvoNijDdQ&font=Default&lang=en&initial_zoom=2&height=650',
			height: '650px', // Timeline JS requires specific height matching URL parameter
			containerClass: 'iframe-container',
			allowfullscreen: true,
			showTitle: true
		},
		{
			type: 'iframe',
			id: 'student-activism-burkina-faso-timeline',
			title: 'Student activism in Burkina Faso',
			src: 'https://cdn.knightlab.com/libs/timeline3/latest/embed/index.html?source=1AmCWiL1QbMztXxJ48TXNUgaoodYc8aBFG-7dFsiz3jc&font=Default&lang=en&initial_zoom=2&height=650',
			height: '650px', // Timeline JS requires specific height matching URL parameter
			containerClass: 'iframe-container',
			allowfullscreen: true,
			showTitle: true
		}
	]
};
