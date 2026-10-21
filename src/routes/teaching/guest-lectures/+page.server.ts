import type { PageServerLoad } from './$types';
import { allLectures } from '#lib/server/teachingLectures.ts';

/** Every lecture on record, without the talks dataset some are drawn from. */
export const load: PageServerLoad = () => ({ lectures: allLectures });
