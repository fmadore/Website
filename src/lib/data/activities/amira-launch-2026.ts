import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const amiraLaunch2026: Activity = {
	id: 'amira-launch-2026',
	title: 'Launch of the Africa Multiple Interactive Research Atlas (AMIRA)',
	dateISO: '2026-06-11',
	date: formatDisplayDate('2026-06-11'),
	year: 2026,
	description:
		'The Africa Multiple Interactive Research Atlas (AMIRA) is now live. A major project I have worked on as Data Curator at the University of Bayreuth, it offers a central platform for exploring and visualising research data from the Cluster of Excellence Africa Multiple.',
	content: `
		<p>I'm really glad to share that the <a href="https://data.africamultiple.uni-bayreuth.de/" target="_blank" rel="noopener noreferrer">Africa Multiple Interactive Research Atlas (AMIRA)</a>, a major project on which I have been working since joining the <a href="https://www.uni-bayreuth.de/en" target="_blank" rel="noopener noreferrer">University of Bayreuth</a> as Data Curator, is now live. AMIRA is a central location for exploring and visualising the <a href="https://www.africamultiple.uni-bayreuth.de/en/index.html" target="_blank" rel="noopener noreferrer">Cluster of Excellence Africa Multiple</a>'s data: research item metadata, publications, podcasts and videos, and the people and organisations behind them.</p>

		<p>In total, there are almost 4,000 research items and more than 90 projects linked to 1,600 people and 600 organisations in 28 languages across 42 countries. All of these can be searched using autocomplete and filters.</p>

		<p>Various charts, maps and network graphs illustrate who is working with whom, where projects are located on the map and which themes are prevalent in the data. Every entity is cross-linked: click on a person, project, subject or place to go to its own page and see its connections.</p>

		<p>AMIRA is part of a wider shift in the work of our <a href="https://www.africamultiple.uni-bayreuth.de/en/1_5-Digital-Solutions1/index.html" target="_blank" rel="noopener noreferrer">Digital Research Environment</a> team. Alongside our core task of handling metadata, we are expanding into services that increase the visibility of research, such as visualisation, dashboards and dedicated websites for individual projects.</p>
	`,
	heroImage: {
		src: 'images/activities/amira-launch-2026-hero.webp',
		alt: 'Screenshot of the Africa Multiple Interactive Research Atlas (AMIRA) homepage'
	},
	image: 'images/activities/amira-launch-2026.webp',
	url: 'https://data.africamultiple.uni-bayreuth.de/',
	urlLabel: 'Explore AMIRA',
	tags: [
		'Digital Humanities',
		'African Studies',
		'Africa Multiple',
		'University of Bayreuth',
		'Data Curation',
		'Data Visualization',
		'Metadata'
	],
	type: 'news',
	panelType: 'news'
};
