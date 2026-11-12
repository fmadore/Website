import { getAllTimelineItems } from '#lib/utils/timelineData.ts';
import type { PageServerLoad } from './$types';

/**
 * The timeline's items, built at prerender time. Built in the page, the route
 * shipped every dataset it draws from (the publications alone were the
 * heaviest chunk on the site) to compute a few hundred dated rows; the rows
 * are what the page needs, so the rows are what it receives.
 */
export const load: PageServerLoad = () => ({ items: getAllTimelineItems() });
