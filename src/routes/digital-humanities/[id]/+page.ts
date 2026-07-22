import { allDhProjects } from '$lib/data/digital-humanities';
import { buildDhProjectJsonLd } from '$lib/utils/entityJsonLd';
import { loadEntityDetail } from '$lib/utils/entityPageLoader';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const { entity: project, jsonLdString } = loadEntityDetail({
		id: params.id,
		find: (id) => allDhProjects.find((p) => p.id === id),
		buildJsonLd: buildDhProjectJsonLd,
		notFound: 'Project not found'
	});

	return { project, jsonLdString };
};
