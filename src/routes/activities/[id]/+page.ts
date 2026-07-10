import { getActivityById } from '$lib/stores/activities.svelte';
import { buildActivityJsonLd } from '$lib/utils/jsonLdSchemas';
import { loadEntityDetail } from '$lib/utils/entityPageLoader';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const { entity: activity, jsonLdString } = loadEntityDetail({
		id: params.id,
		find: getActivityById,
		buildJsonLd: buildActivityJsonLd,
		notFound: 'Activity not found'
	});

	return { activity, jsonLdString };
};
