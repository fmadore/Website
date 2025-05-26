import { error } from '@sveltejs/kit';
import { allCommunications } from '$lib/data/communications/index';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const communication = allCommunications.find((comm) => comm.id === params.id);

	if (!communication) {
		throw error(404, 'Communication not found');
	}

	return {
		communication
	};
};
