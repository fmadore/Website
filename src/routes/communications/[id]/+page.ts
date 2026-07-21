import { allCommunications } from '$lib/data/communications/index';
import { buildCommunicationJsonLd } from '$lib/utils/jsonLdSchemas';
import { loadEntityDetail } from '$lib/utils/entityPageLoader';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const { entity: communication, jsonLdString } = loadEntityDetail({
		id: params.id,
		find: (id) => allCommunications.find((comm) => comm.id === id),
		buildJsonLd: buildCommunicationJsonLd,
		notFound: 'Communication not found'
	});

	return { communication, jsonLdString };
};
