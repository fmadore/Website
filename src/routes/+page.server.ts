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

interface DhCopy {
	blurb: string;
	stats?: [string, string][];
}

/**
 * What the home page says about each collection and app; the title, image and
 * platform line come from the record itself. The id lists below are typed
 * against these keys, so a card cannot exist without its copy, and `dhCards`
 * fails the build if a listed id names no record.
 */
const DH_COPY = {
	iwac: {
		blurb:
			'Newspapers, Islamic publications, documents and audiovisual records, processed with OCR, transcription and entity recognition.',
		stats: [
			['20,944', 'Items'],
			['6', 'Countries']
		]
	},
	amira: {
		blurb:
			'The collections of research centres in Burkina Faso, Kenya, Nigeria and South Africa, searchable in one place.',
		stats: [
			['3,800', 'Items'],
			['90+', 'Projects']
		]
	},
	kalamu: {
		blurb:
			'Read scans and handwriting, transcribe interviews and analyse texts with AI, then check every result against its source.'
	},
	'live-translation': {
		blurb: 'Live captions and translations over meetings, video calls and slides.'
	}
} satisfies Record<string, DhCopy>;

type DhCardId = keyof typeof DH_COPY;

/** The collections and the apps the home page shows, in the order it shows them. */
const COLLECTIONS: DhCardId[] = ['iwac', 'amira'];
const APPS: DhCardId[] = ['kalamu', 'live-translation'];

function dhCards(ids: DhCardId[]) {
	return ids.map((id) => {
		const project = allDhProjectSummaries.find((p) => p.id === id);
		if (!project) throw new Error(`Home page: no digital-humanities record "${id}"`);
		const install = project.links?.find((link) => link.type === 'install');
		const copy: DhCopy = DH_COPY[id];
		return {
			id,
			title: project.title,
			imageUrl: project.imageUrl,
			// What a reader needs before installing: the platform, and where to get it.
			platform: project.application?.operatingSystem,
			store: install ? { label: install.label, url: install.url } : undefined,
			blurb: copy.blurb,
			stats: copy.stats
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
