import { error } from '@sveltejs/kit';
import type { PageLoad, PageLoadEvent } from './$types';
import { allDhProjects } from '$lib/data/digital-humanities';
import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const load: PageLoad = (event: PageLoadEvent) => {
    const project: DigitalHumanitiesProject | undefined = allDhProjects.find(
        (p) => p.id === event.params.id
    );

    if (project) {
        return {
            project
        };
    }

    throw error(404, 'Project not found');
}; 