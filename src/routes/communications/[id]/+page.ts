import { error } from '@sveltejs/kit';
import { base } from '$app/paths';
import { allCommunications } from '$lib/data/communications/index';
import { buildCommunicationJsonLd } from '$lib/utils/jsonLdSchemas';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const communication = allCommunications.find((comm) => comm.id === params.id);

	if (!communication) {
		throw error(404, 'Communication not found');
	}

	const jsonLdString = JSON.stringify(buildCommunicationJsonLd(communication, base));

	return {
		communication,
		jsonLdString
	};
};
