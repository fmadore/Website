import type { PageServerLoad } from './$types';
import { allLectures } from '$lib/server/teachingLectures';

/** The lectures the host index counts, without the talks dataset some are drawn from. */
export const load: PageServerLoad = () => ({ lectures: allLectures });
