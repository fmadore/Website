import { allPublications } from '$lib/data/publications/index';
import { buildPublicationJsonLd } from '$lib/utils/entityJsonLd';
import { loadEntityDetail } from '$lib/utils/entityPageLoader';
import type { PageLoad } from './$types';

/**
 * Enumerate every publication for the prerenderer.
 *
 * Without this, SvelteKit only prerenders the ids it can reach by crawling
 * links, and the index page builds its list on the client — so an item linked
 * from nowhere else silently shipped no page while `sitemap.xml`, which is
 * generated from the dataset, still advertised its URL. `npm run check:prerender`
 * guards the invariant.
 */
export const entries = () => allPublications.map(({ id }) => ({ id }));

export const load: PageLoad = ({ params }) => {
	const { entity: publication, jsonLdString } = loadEntityDetail({
		id: params.id,
		find: (id) => allPublications.find((p) => p.id === id),
		buildJsonLd: buildPublicationJsonLd,
		notFound: 'Publication not found'
	});

	return { publication, jsonLdString };
};
