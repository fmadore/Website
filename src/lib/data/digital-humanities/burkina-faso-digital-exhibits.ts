import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const burkinaFasoDigitalExhibits: DigitalHumanitiesProject = {
	id: 'burkina-faso-digital-exhibits',
	title: 'Digital Exhibits on Islam in Burkina Faso',
	years: '2021',
	shortDescription:
		'These two digital exhibits on Islam in Burkina Faso, which bring together a selection of materials from the Islam West Africa Collection by theme, are entry points to the collection. In addition to providing contextual information for interpreting the material presented in an interactive timeline, a selective bibliography completes the exhibit.',
	description:
		"<p>These two digital exhibits on Islam in Burkina Faso bring together a selection of materials from the <a href='https://islam.zmo.de/s/westafrica/page/home' target='_blank' rel='noopener noreferrer'><em>Islam West Africa Collection</em></a> by theme, serving as entry points to the broader collection. In addition to providing contextual information for interpreting the material presented in an interactive timeline, a selective bibliography completes each exhibit.</p>",
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
