// src/lib/data/peer-reviews/peer-review-template.ts
import type { PeerReview } from '$lib/types';

export const peerReviewTemplate: PeerReview = {
	id: 'unique-peer-review-id', // Replace with a unique ID (e.g., journal-name-year-number)
	journal: 'Journal Name', // Replace with journal name, or remove if not applicable
	publisher: 'Publisher Name', // Replace with publisher name, or remove if not applicable
	type: 'Journal Article', // 'Journal Article', 'Book Manuscript', 'Grant Proposal', etc.
	year: new Date().getFullYear(), // Year of the review
	dateISO: 'YYYY-MM-DD', // Full date of the review decision/submission, e.g., '2023-10-27'
	details: 'Optional details about the review.', // Optional: any specific details
	publons_record: 'https://publons.com/review/xxxxxxx/' // Optional: URL to the Publons record, remove if not applicable
};

export default peerReviewTemplate;
