import { allDhProjects } from '$lib/data/digital-humanities';
import { buildDhProjectJsonLd } from '$lib/utils/entityJsonLd';
import { loadEntityDetail } from '$lib/utils/entityPageLoader';
import type { PageServerLoad } from './$types';

/** Every project gets a page — see the note in publications/[id]/+page.server.ts. */
export const entries = () => allDhProjects.map(({ id }) => ({ id }));

/**
 * A server load, so the page receives the one project it prints rather than
 * importing the whole digital-humanities dataset into every project page.
 */
export const load: PageServerLoad = ({ params }) => {
	const { entity: project, jsonLdString } = loadEntityDetail({
		id: params.id,
		find: (id) => allDhProjects.find((p) => p.id === id),
		buildJsonLd: buildDhProjectJsonLd,
		notFound: 'Project not found'
	});

	return { project, jsonLdString };
};
