import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const omekaSDocker: DigitalHumanitiesProject = {
	id: 'omeka-s-docker',
	title: 'Omeka S Docker Template',
	years: '2026',
	shortDescription:
		'A reusable Docker template for deploying production-ready Omeka S digital archive installations with automatic setup, module management, and SSL support.',
	description:
		'<p>Digital archives and collections play a crucial role in preserving and sharing cultural heritage, yet setting up the infrastructure to host them remains a significant barrier for many research teams. This template removes that barrier by providing a ready-to-use deployment solution for <a href="https://omeka.org/s/" target="_blank" rel="noopener noreferrer">Omeka S</a>, a widely adopted platform for building digital collections and exhibits.</p>' +
		'<p>Developed as part of my work with the <a href="https://www.africamultiple.uni-bayreuth.de/en/1_5-Digital-Solutions1/index.html" target="_blank" rel="noopener noreferrer">Digital Research Environment (DRE)</a> at the University of Bayreuth\'s <a href="https://www.africamultiple.uni-bayreuth.de/en/index.html" target="_blank" rel="noopener noreferrer">Africa Multiple Cluster of Excellence</a>, this template reflects a commitment to making research infrastructure more accessible. By lowering the technical threshold for deploying digital archives, this tool can help research teams focus on what matters most: curating and sharing their collections according to FAIR principles.</p>' +
		'<h3>What It Does</h3>' +
		'<p>The template handles the complete technical setup automatically: database configuration, web server optimization, and security hardening. Researchers can have a fully functional Omeka S instance running with a single command, complete with essential modules for data import, geospatial mapping, faceted search, and IIIF image viewing.</p>' +
		'<h3>Key Features</h3>' +
		'<ul>' +
		'<li><strong>One-command deployment</strong> with automatic installation and configuration</li>' +
		'<li><strong>Pre-installed modules</strong> for CSV import, mapping, advanced search, and IIIF viewers</li>' +
		'<li><strong>Production-ready security</strong> with SSL/TLS encryption and hardened settings</li>' +
		'<li><strong>Built for sustainability</strong> with standardized configurations that simplify long-term maintenance</li>' +
		'</ul>' +
		'<p>This template is designed for research teams, librarians, and digital humanists who want to build digital archives without needing deep systems administration expertise.</p>' +
		'<p><a href="https://github.com/AM-Digital-Research-Environment/omeka-s-docker" target="_blank" rel="noopener noreferrer" class="btn btn-primary">View on GitHub</a></p>',
	imageUrl: `/images/digital-humanities/omeka-s-docker.webp`,
	order: 1,
	skills: [
		'Docker',
		'Nginx',
		'PHP',
		'MySQL',
		'Linux',
		'Omeka S',
		'IIIF',
		'Bash'
	],
	seoKeywords: [
		'Omeka S',
		'Docker',
		'digital archives',
		'digital collections',
		'IIIF',
		'cultural heritage',
		'digital humanities',
		'containerization',
		'museum collections',
		'library technology'
	]
};
