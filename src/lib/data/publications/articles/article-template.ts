import type { Publication } from '$lib/types';

// Journal Article Template - Copy this file and fill in the details
export const articleTemplate: Publication = {
	id: 'article-template-id', // Replace with URL-friendly ID (use kebab-case)
	type: 'article',
	title: 'Article Title',
	authors: ['Author Name'], // Add all authors in the array
	date: '2025', // Publication year
	dateISO: '2025-01', // Use YYYY-MM format when known
	year: 2025,
	journal: 'Journal Name',
	volume: '1',
	issue: '2',
	pages: '100-120',
	pageCount: 0, // Total number of pages
	language: 'English',
	doi: '10.0000/00000', // Add DOI when available
	abstract:
		"A comprehensive description of the article's content, methodology, findings, and significance. This abstract will be used in list views and as a preview of the publication.",
	tags: ['tag1', 'tag2', 'tag3'], // Add relevant tags for categorization
	url: 'https://doi.org/10.0000/00000', // URL to the publication
	image: '', // Optional: path to image (e.g., "images/publications/article-image.jpg")
	heroImage: {
		// Optional: hero image configuration
		src: 'images/publications/article-hero.jpg',
		alt: 'Descriptive alt text for the article image',
		caption: 'Optional caption for the article image'
	},
	// New fields
	country: ['Country Name'], // Countries covered in the publication
	project: '', // Options: "Digital Humanities and AI in African Studies", "Religious Activism on Campuses in Togo and Benin", "Muslim Minorities in Southern Cities of Benin and Togo", "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso", "Other"
	citedBy: [] // Optional: List of works citing this publication
};
