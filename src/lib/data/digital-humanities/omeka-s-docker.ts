import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const omekaSDocker: DigitalHumanitiesProject = {
	id: 'omeka-s-docker',
	title: 'Omeka S Docker Template',
	years: '2026',
	shortDescription:
		'A self-installing Docker template that lets research teams run their own Omeka S digital archive, secure, easy to update and backed up, without being system administrators.',
	description: `
		<p><a href="https://omeka.org/s/" target="_blank" rel="noopener noreferrer">Omeka S</a> is one of the most widely used platforms for digital collections and exhibits, but hosting it well remains a barrier for many research teams: servers to configure, security to get right, upgrades that can break a live site. This template takes most of that work away. It runs <a href="/digital-humanities/amira">AMIRA</a>, and I kept it general enough for anyone to host their own archive with it.</p>
		<p>I developed it with the <a href="https://www.africamultiple.uni-bayreuth.de/en/1_5-Digital-Solutions1/index.html" target="_blank" rel="noopener noreferrer">Digital Research Environment (DRE)</a> of the University of Bayreuth's <a href="https://www.africamultiple.uni-bayreuth.de/en/index.html" target="_blank" rel="noopener noreferrer">Africa Multiple Cluster of Excellence</a>. The aim is simple: let teams spend their time curating and sharing collections according to the FAIR principles, not maintaining servers.</p>

		<h2>What it does</h2>
		<ul>
			<li><strong>Installs itself</strong>: on a fresh Linux server, a <a href="https://github.com/AM-Digital-Research-Environment/am-omeka-s-docker-bootstrap" target="_blank" rel="noopener noreferrer">companion installer</a> sets everything up in one command, offers secure HTTPS, and prints the admin login at the end</li>
			<li><strong>Managed from the browser</strong>: add, update and remove modules and themes from Omeka's own admin panel, with no terminal needed</li>
			<li><strong>Safe upgrades</strong>: Omeka's code is fixed in the image, so nothing can change it while the site runs, an upgrade is a deliberate step, and going back is easy</li>
			<li><strong>Secure by default</strong>: nothing runs with administrator rights, the database is never exposed, and the web server, PHP and MySQL come tuned for Omeka</li>
			<li><strong>Backups in one command</strong>, including moving a site to a new server</li>
			<li><strong>Optional extras</strong>: IIIF image viewing and fast Typesense search</li>
			<li><strong>Extendable without forking</strong>: in-house modules and vocabularies sit in a separate layer on top</li>
		</ul>
		<p>It is designed for research teams, librarians and digital humanists who want to run a digital archive without deep systems-administration expertise.</p>
	`,
	imageUrl: `/images/digital-humanities/omeka-s-docker.webp`,
	order: 2,
	links: [
		{
			url: 'https://github.com/AM-Digital-Research-Environment/omeka-s-docker',
			label: 'omeka-s-docker',
			type: 'code'
		},
		{
			url: 'https://github.com/AM-Digital-Research-Environment/am-omeka-s-docker-bootstrap',
			label: 'am-omeka-s-docker-bootstrap',
			type: 'code'
		}
	],
	skills: [
		'Docker',
		'Nginx',
		'PHP',
		'MySQL',
		'Linux',
		'Bash',
		'Omeka S',
		'IIIF',
		'Typesense',
		'Caddy',
		'GitHub Actions'
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
		'library technology',
		'self-hosted',
		'research data management'
	]
};
