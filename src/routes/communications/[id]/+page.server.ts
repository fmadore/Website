import { relatedItems } from '#lib/server/relatedItems.ts';
import { researchProjectPath } from '#lib/data/research/index.ts';
import { allCommunications } from '#lib/data/communications/index.ts';
import { buildCommunicationJsonLd } from '#lib/utils/entityJsonLd.ts';
import { loadEntityDetail } from '#lib/utils/entityPageLoader.ts';
import type { PageServerLoad } from './$types';

/** Every communication gets a page — see the note in publications/[id]/+page.server.ts. */
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
