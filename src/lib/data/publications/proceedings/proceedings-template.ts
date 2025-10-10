import type { Publication } from '$lib/types';

// Conference Proceedings Template - Copy this file and fill in the details
export const proceedingsTemplate: Publication = {
	id: 'conference-proceedings-template-id', // Replace with URL-friendly ID (use kebab-case)
	type: 'conference-proceedings',
	title: 'Title of Your Presentation or Paper',
	authors: ['Author Name'], // Add all authors in the array
	date: '2025', // Publication year
	dateISO: '2025', // Same as date for conference proceedings
	year: 2025,
	proceedingsTitle: 'Title of the Conference Proceedings', // Full title of the published proceedings
	conferenceName: 'Name of the Conference', // e.g., "Tenth International Congress of Mandé Studies Association"
	conferenceLocation: 'City, Country', // Location where the conference was held
	placeOfPublication: 'City, Country', // Where the proceedings were published (if different)
	publisher: 'Publisher Name', // Publisher of the proceedings (if applicable)
	pages: '100-120', // Page range in the proceedings (if applicable)
	language: 'English',
	doi: '', // Add DOI if available
	abstract:
		"A comprehensive description of the paper's content, methodology, findings, and significance. This abstract will be used in list views and as a preview of the publication.",
	tags: ['tag1', 'tag2', 'tag3'], // Add relevant tags for categorization
	url: '', // URL to the publication if available
	additionalUrls: [
		// Optional: Additional links (e.g., presentation slides, video)
		{
			label: 'Proceedings PDF',
			url: ''
		}
	],
	image: '', // Optional: path to image (e.g., "images/publications/proceedings-image.jpg")
	heroImage: {
		// Optional: hero image configuration
		src: 'images/publications/proceedings-hero.jpg',
		alt: 'Descriptive alt text for the proceedings image',
		caption: 'Optional caption for the proceedings image'
	},
	// New fields
	country: ['Country Name'], // Countries covered in the publication
	project: '', // Options: "Mining the Islam West Africa Collection", "Religious Activism on Campuses in Togo and Benin", "Muslim Minorities in Southern Cities of Benin and Togo", "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso", "Other"
	citedBy: [] // Optional: List of works citing this publication
};
