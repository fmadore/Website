import { allDhProjects } from '$lib/data/digital-humanities';
import { buildDhProjectJsonLd } from '$lib/utils/entityJsonLd';
import { loadEntityDetail } from '$lib/utils/entityPageLoader';
import type { PageLoad } from './$types';

/** Every project gets a page — see the note in publications/[id]/+page.ts. */
export const entries = () => allDhProjects.map(({ id }) => ({ id }));

export const load: PageLoad = ({ params }) => {
	const { entity: project, jsonLdString } = loadEntityDetail({
		id: params.id,
		find: (id) => allDhProjects.find((p) => p.id === id),
		buildJsonLd: buildDhProjectJsonLd,
		notFound: 'Project not found'
	});

	return { project, jsonLdString };
};
