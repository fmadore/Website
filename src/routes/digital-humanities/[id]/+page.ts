import { error } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad, PageLoadEvent } from './$types';
import { allDhProjects } from '$lib/data/digital-humanities';
import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';
import { buildDhProjectJsonLd } from '$lib/utils/jsonLdSchemas';

export const load: PageLoad = (event: PageLoadEvent) => {
	const project: DigitalHumanitiesProject | undefined = allDhProjects.find(
		(p) => p.id === event.params.id
	);

	if (!project) {
		throw error(404, 'Project not found');
	}

	const jsonLdString = JSON.stringify(buildDhProjectJsonLd(project, base));

	return {
		project,
		jsonLdString
	};
};
