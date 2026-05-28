import { error } from '@sveltejs/kit';
import { base } from '$app/paths';
import { allPublications } from '$lib/data/publications/index';
import { buildPublicationJsonLd } from '$lib/utils/jsonLdSchemas';
import type { PageLoad } from './$types';

// --- Load Function ---
export const load: PageLoad = ({ params }) => {
	const publication = allPublications.find((p) => p.id === params.id);

	if (!publication) {
		throw error(404, 'Publication not found');
	}

	const jsonLdString = JSON.stringify(buildPublicationJsonLd(publication, base));

	return {
		publication,
		jsonLdString
	};
};
