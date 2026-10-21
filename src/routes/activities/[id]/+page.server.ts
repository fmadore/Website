import { activitiesByDate } from '#lib/data/activities/index.ts';
import { buildActivityJsonLd } from '#lib/utils/entityJsonLd.ts';
import { loadEntityDetail } from '#lib/utils/entityPageLoader.ts';
import { referencesIn } from '#lib/server/references.ts';
import type { PageServerLoad } from './$types';

/** Every activity gets a page — see the note in publications/[id]/+page.server.ts. */
export const entries = () => activitiesByDate.map(({ id }) => ({ id }));

/**
 * A server load, so the page receives the one record it prints. As a
 * universal load it imported the whole activities dataset — every entry's
 * HTML body — into the client bundle of each of the 36 record pages.
 */
export const load: PageServerLoad = ({ params }) => {
	const { entity: activity, jsonLdString } = loadEntityDetail({
		id: params.id,
		find: (id) => activitiesByDate.find((a) => a.id === id),
		buildJsonLd: buildActivityJsonLd,
		notFound: 'Activity not found'
	});

	// A body may cite publications and talks inline (ItemReference by id); send
	// just those entries, not the reference index.
	return { activity, jsonLdString, references: referencesIn(activity.content ?? '') };
};
