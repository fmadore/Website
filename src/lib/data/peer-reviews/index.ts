// src/lib/data/peer-reviews/index.ts
import type { PeerReview } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';
import { sortByDate, groupByYear } from '$lib/utils/dataAggregation';

type ModuleType = Record<string, any>;

const templateIds: string[] = [
	// 'peer-review-template-id'
	'peer-review-template'
];

const peerReviewModules = import.meta.glob<ModuleType>(['./*.ts'], { eager: true });

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
