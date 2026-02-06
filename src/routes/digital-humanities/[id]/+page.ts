import { error } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad, PageLoadEvent } from './$types';
import { allDhProjects } from '$lib/data/digital-humanities';
import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';
import type { CreativeWorkJsonLd } from '$lib/types/jsonld';
import { formatAuthor } from '$lib/types/jsonld';

export const load: PageLoad = (event: PageLoadEvent) => {
	const project: DigitalHumanitiesProject | undefined = allDhProjects.find(
		(p) => p.id === event.params.id
	);

	if (!project) {
		throw error(404, 'Project not found');
	}

	// Build JSON-LD structured data using CreativeWork schema
	const jsonLdObject: Partial<CreativeWorkJsonLd> = {
		'@context': 'https://schema.org',
		'@type': project.linkUrl ? 'WebSite' : 'CreativeWork',
		name: project.title,
		description: project.seoDescription || project.shortDescription,
		url: project.linkUrl || `${base}/digital-humanities/${project.id}`
	};

	// Author
	const author = formatAuthor('Frédérick Madore');
	jsonLdObject.author = [{ ...author, url: 'https://www.frederickmadore.com' }];

	// Image
	if (project.heroImageUrl || project.imageUrl) {
		jsonLdObject.image = `${base}/${project.heroImageUrl || project.imageUrl}`;
	}

	// Keywords
	if (project.seoKeywords && project.seoKeywords.length > 0) {
		jsonLdObject.keywords = project.seoKeywords.join(', ');
	} else if (project.skills && project.skills.length > 0) {
		jsonLdObject.keywords = project.skills.join(', ');
	}

	const jsonLdString = JSON.stringify(jsonLdObject);

	return {
		project,
		jsonLdString
	};
};
