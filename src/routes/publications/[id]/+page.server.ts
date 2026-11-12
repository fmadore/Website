import { relatedItems } from '#lib/server/relatedItems.ts';
import { researchProjectPath } from '#lib/data/research/index.ts';
import { allPublications } from '#lib/data/publications/index.ts';
import { buildPublicationJsonLd, resolvePublicationJsonLdType } from '#lib/utils/entityJsonLd.ts';
import { loadEntityDetail } from '#lib/utils/entityPageLoader.ts';
import { titleLangAttr } from '#lib/utils/languageUtils.ts';
import type { PageServerLoad } from './$types';

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

export const load: PageServerLoad = ({ params }) => {
	const { entity: publication, jsonLdString } = loadEntityDetail({
		id: params.id,
		find: (id) => allPublications.find((p) => p.id === id),
		buildJsonLd: buildPublicationJsonLd,
		notFound: 'Publication not found'
	});

	return {
		publication,
		jsonLdString,
		// The JSON-LD @type, which the FAIR Signposting `type` link repeats.
		schemaType: resolvePublicationJsonLdType(publication),
		// Each card sets `lang` on a non-English title (WCAG 3.1.2).
		relatedInProject: relatedItems(allPublications, publication).map((item) => ({
			...item,
			titleLang: titleLangAttr(allPublications.find((p) => p.id === item.id)?.language)
		})),
		projectPath: researchProjectPath(publication.project)
	};
};
