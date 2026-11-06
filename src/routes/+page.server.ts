import type { PageServerLoad } from './$types';
import { createFullPersonSchema } from '#lib/server/personSchema.ts';
import { activitiesByDate } from '#lib/data/activities/index.ts';
import { allPublicationSummaries } from '#lib/data/publications/summaries.ts';
import { allCommunicationSummaries } from '#lib/data/communications/summaries.ts';
import { allDhProjectSummaries } from '#lib/data/digital-humanities/summaries.ts';
import { summariseActivityLog } from '#lib/utils/activityLog.ts';
import {
	featuredWriting,
	homeBooks,
	latestWriting,
	outputRecord,
	upcomingTalks
} from '#lib/utils/homeDigest.ts';
import { featuredPublicationIds } from '#lib/data/homeFeatured.ts';

/** The collections and the apps the home page shows, in the order it shows them. */
const COLLECTIONS = ['iwac', 'amira'];
const APPS = ['kalamu', 'live-translation'];

function dhCards(ids: string[]) {
	return ids.map((id) => {
		const project = allDhProjectSummaries.find((p) => p.id === id);
		if (!project) throw new Error(`Home page: no digital-humanities record "${id}"`);
		const install = project.links?.find((link) => link.type === 'install');
		return {
			id,
			title: project.title,
			imageUrl: project.imageUrl,
			// What a reader needs before installing: the platform, and where to get it.
			platform: project.application?.operatingSystem,
			store: install ? { label: install.label, url: install.url } : undefined
		};
	});
}

/**
 * Home page load: the full Person schema for the ProfilePage structured data,
 * and the home page's digest of the datasets — a few rows each, never the
 * datasets themselves. "Upcoming" is fixed at build time; the page re-checks
 * the date in the browser so a talk that has passed since is not announced.
 */
export const load: PageServerLoad = () => {
	const today = new Date().toISOString().slice(0, 10);
	return {
		personSchema: createFullPersonSchema(),
		activityLog: summariseActivityLog(activitiesByDate, 4),
		books: homeBooks(allPublicationSummaries),
		writing:
			featuredPublicationIds.length > 0
				? featuredWriting(allPublicationSummaries, featuredPublicationIds)
				: latestWriting(allPublicationSummaries, 5),
		upcoming: upcomingTalks(allCommunicationSummaries, today, 3),
		record: outputRecord(allPublicationSummaries, allCommunicationSummaries),
		collections: dhCards(COLLECTIONS),
		apps: dhCards(APPS)
	};
};
