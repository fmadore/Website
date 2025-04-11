// src/lib/data/peer-reviews/index.ts
import type { PeerReview } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';

type ModuleType = Record<string, any>;

const templateIds: string[] = [
	// 'peer-review-template-id' 
];

const peerReviewModules = import.meta.glob<ModuleType>(
	['./*.ts'],
	{ eager: true }
);

const allPeerReviews: PeerReview[] = loadData<PeerReview>(
	peerReviewModules,
	templateIds,
	'peer-review'
);

// Sort by date (most recent first)
export const peerReviewsByDate = [...allPeerReviews].sort((a, b) => {
	return new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime();
});

// Group by year
export const peerReviewsByYear = allPeerReviews.reduce<Record<number, PeerReview[]>>((acc, review) => {
    if (!acc[review.year]) {
        acc[review.year] = [];
    }
    acc[review.year].push(review);
    return acc;
}, {});


export { allPeerReviews }; 