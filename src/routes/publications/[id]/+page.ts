import { allPublications } from '$lib/data/publications/index';
import { buildPublicationJsonLd } from '$lib/utils/jsonLdSchemas';
import { loadEntityDetail } from '$lib/utils/entityPageLoader';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const { entity: publication, jsonLdString } = loadEntityDetail({
		id: params.id,
		find: (id) => allPublications.find((p) => p.id === id),
		buildJsonLd: buildPublicationJsonLd,
		notFound: 'Publication not found'
	});

	return { publication, jsonLdString };
};
