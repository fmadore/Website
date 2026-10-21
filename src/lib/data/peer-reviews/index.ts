// src/lib/data/peer-reviews/index.ts
import type { PeerReview } from '#lib/types/index.ts';
import { loadData } from '#lib/utils/dataLoader.ts';
import { sortByDate, groupByYear } from '#lib/utils/dataAggregation.ts';

type ModuleType = Record<string, unknown>;

const templateIds: string[] = ['peer-review-template-id'];

const peerReviewModules = import.meta.glob<ModuleType>(
	['./*.ts', '!./index.ts', '!./peer-review-template.ts'],
	{ eager: true }
);

const allPeerReviews: PeerReview[] = loadData<PeerReview>(
	peerReviewModules,
	templateIds,
	'peer-review'
);

// Sort by date (most recent first)
export const peerReviewsByDate = sortByDate(allPeerReviews);

// Group by year
export const peerReviewsByYear = groupByYear(allPeerReviews);

export { allPeerReviews };
