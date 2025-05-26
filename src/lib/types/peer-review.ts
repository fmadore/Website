// src/lib/types/peer-review.ts
export interface PeerReview {
	id: string; // Unique identifier (e.g., 'politique-africaine-2022')
	journal?: string; // Journal name if applicable
	publisher?: string; // Publisher name if applicable (e.g., for book manuscripts)
	type: 'Journal Article' | 'Book Manuscript' | 'Grant Proposal' | string; // Type of reviewed item
	year: number;
	dateISO: string; // Full date for sorting, e.g., '2022-01-01'
	details?: string; // Optional extra details
	publons_record?: string; // Optional Publons record URL
}
