import type { Publication } from '$lib/types';

// Report Publication Template - Copy this file and fill in the details
export const reportTemplate: Publication = {
	id: 'report-template-id', // Replace with URL-friendly ID (use kebab-case)
	type: 'report',
	title: 'Report Title',
	authors: ['Author Name'], // Add all authors in the array
	date: '2025', // Publication year
	dateISO: '2025-01', // Use YYYY-MM format when known
	year: 2025,
	publisher: 'Publishing Organization',
	pages: '100-120', // Page range or total
	pageCount: 0, // Total number of pages
	language: 'English',
	doi: '10.0000/00000', // Add DOI when available
	abstract:
		"A comprehensive description of the report's content, methodology, findings, and significance. This abstract will be used in list views and as a preview of the publication.",
	tags: ['tag1', 'tag2', 'tag3'], // Add relevant tags for categorization
	url: 'https://example.org/report', // URL to the publication
	image: '', // Optional: path to image (e.g., "images/publications/report-image.jpg")
	heroImage: {
		// Optional: hero image configuration
		src: 'images/publications/report-hero.jpg',
		alt: 'Descriptive alt text for the report image',
		caption: 'Optional caption for the report image'
	},
	// Fields often used for reports
	volume: '', // Volume number if applicable
	issue: '', // Issue number if applicable
	placeOfPublication: '', // Place of publication if applicable
	// New fields
	country: ['Country Name'], // Countries covered in the publication
	project: '', // Options: "Mining the Islam West Africa Collection", "Religious Activism on Campuses in Togo and Benin", "Muslim Minorities in Southern Cities of Benin and Togo", "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso", "Other"
	citedBy: [] // Optional: List of works citing this publication
};
