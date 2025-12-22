import type { Publication } from '$lib/types';

// Bulletin Article Template - Copy this file and fill in the details for articles published in bulletins
// Examples: Event reports, workshop summaries published in institutional bulletins
export const bulletinArticleTemplate: Publication = {
	id: 'bulletin-article-template-id', // Replace with URL-friendly ID (use kebab-case)
	type: 'bulletin-article',
	title: 'Bulletin Article Title',
	authors: ['Author Name'], // Add all authors in the array
	date: 'April 2025', // Display format (e.g., "April 2025")
	dateISO: '2025-04', // ISO format (YYYY-MM or YYYY)
	year: 2025,
	journal: 'Bulletin Name', // Name of the bulletin/newsletter
	issue: '1', // Issue number
	pages: '1-5', // Page range
	pageCount: 5, // Number of pages
	language: 'English',
	doi: '', // Add DOI if available
	abstract:
		"A brief description of the bulletin article's content. This could be an event report, workshop summary, or other article published in an institutional bulletin.",
	tags: ['Event report', 'tag1', 'tag2'], // Add relevant tags for categorization
	url: '', // URL to the bulletin article (can be DOI URL)
	image: '', // Optional: path to cover image (e.g., "images/publications/bulletin-cover.webp")
	heroImage: {
		// Optional: hero image configuration
		src: 'images/publications/bulletin-hero.webp',
		alt: 'Descriptive alt text for the bulletin cover',
		caption: 'Optional caption for the bulletin cover'
	},
	// New fields
	country: ['Country Name'], // Countries covered in the publication
	project: '' // Options: "Digital Humanities and AI in African Studies", "Religious Activism on Campuses in Togo and Benin", etc., or leave empty
};
