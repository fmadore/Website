import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const omekaSDocker: DigitalHumanitiesProject = {
	id: 'omeka-s-docker',
	title: 'Omeka S Docker Template',
	years: '2026',
	shortDescription:
		'A reusable Docker template for deploying production-ready Omeka S digital archive installations with automatic setup, module management, and SSL support.',
	description:
		'<p>This Docker template provides a production-ready setup for deploying <a href="https://omeka.org/s/" target="_blank" rel="noopener noreferrer">Omeka S</a> digital archive installations. It simplifies the often complex process of installing and maintaining Omeka S by containerizing all services with optimized configurations.</p>' +
		'<h3>Key Features</h3>' +
		'<ul>' +
		'<li><strong>Automatic Installation:</strong> Omeka S is automatically installed on first run with pre-installed common modules (CSVImport, FileSideload, Mapping, FacetedBrowse, etc.).</li>' +
		'<li><strong>Optimized Stack:</strong> PHP 8.4 with OPcache and JIT enabled, MySQL 9.4 with tuned InnoDB settings, and Nginx with gzip compression and security headers.</li>' +
		'<li><strong>Module Management:</strong> Scripts for installing, updating, and managing modules including support for Daniel-KM modules (AdvancedSearch, IiifServer, UniversalViewer, etc.).</li>' +
		'<li><strong>IIIF Support:</strong> Full CORS configuration for IIIF endpoints, enabling integration with external viewers like Mirador and Universal Viewer.</li>' +
		'<li><strong>Production SSL:</strong> Ready-to-use SSL configuration with TLS 1.2/1.3, HSTS, and Mozilla Modern cipher suite.</li>' +
		'<li><strong>Security Hardening:</strong> Resource limits, dropped capabilities, read-only filesystems, and no-new-privileges flags.</li>' +
		'</ul>' +
		'<h3>Services</h3>' +
		'<p>The template orchestrates three Docker services: Nginx (reverse proxy and static files), PHP-FPM (Omeka S application), and MySQL (database). All services include health checks and are configured for easy backup and maintenance.</p>' +
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
