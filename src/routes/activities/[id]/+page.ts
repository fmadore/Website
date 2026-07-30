import { getActivities, getActivityById } from '$lib/stores/activities.svelte';
import { buildActivityJsonLd } from '$lib/utils/entityJsonLd';
import { loadEntityDetail } from '$lib/utils/entityPageLoader';
import type { PageLoad } from './$types';

/** Every activity gets a page — see the note in publications/[id]/+page.ts. */
export const entries = () => getActivities().map(({ id }) => ({ id }));

export const load: PageLoad = ({ params }) => {
	const { entity: activity, jsonLdString } = loadEntityDetail({
		id: params.id,
		find: getActivityById,
		buildJsonLd: buildActivityJsonLd,
		notFound: 'Activity not found'
	});

	return { activity, jsonLdString };
};
