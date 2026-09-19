import { relatedItems } from '$lib/server/relatedItems';
import { researchProjectPath } from '$lib/data/research';
import { allCommunications } from '$lib/data/communications/index';
import { buildCommunicationJsonLd } from '$lib/utils/entityJsonLd';
import { loadEntityDetail } from '$lib/utils/entityPageLoader';
import type { PageServerLoad } from './$types';

/** Every communication gets a page — see the note in publications/[id]/+page.ts. */
export const entries = () => allCommunications.map(({ id }) => ({ id }));

export const load: PageServerLoad = ({ params }) => {
	const { entity: communication, jsonLdString } = loadEntityDetail({
		id: params.id,
		find: (id) => allCommunications.find((comm) => comm.id === id),
		buildJsonLd: buildCommunicationJsonLd,
		notFound: 'Communication not found'
	});

	return {
		communication,
		jsonLdString,
		relatedInProject: relatedItems(allCommunications, communication),
		projectPath: researchProjectPath(communication.project)
	};
};
