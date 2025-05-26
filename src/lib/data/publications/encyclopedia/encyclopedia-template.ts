import type { Publication } from '$lib/types';

// Encyclopedia Entry Template - Copy this file and fill in the details
export const encyclopediaTemplate: Publication = {
	id: 'encyclopedia-template-id', // Replace with URL-friendly ID (use kebab-case)
	type: 'encyclopedia',
	title: 'Encyclopedia Entry Title',
	authors: ['Author Name'], // Add all authors in the array
	date: '2025', // Publication year
	dateISO: '2025-01', // Use YYYY-MM format when known
	year: 2025,
	publisher: 'Encyclopedia Publisher', // e.g., "Brill", "Oxford University Press"
	encyclopediaTitle: 'Name of Encyclopedia', // e.g., "The Encyclopaedia of Islam, Three"
	editors: 'Editor Name, Second Editor', // Encyclopedia editors
	pages: '100-120', // Page range
	pageCount: 0, // Total number of pages
	language: 'English',
	doi: '10.0000/00000', // Add DOI when available
	abstract: "A comprehensive description of the encyclopedia entry's content and significance.",
	tags: ['tag1', 'tag2', 'tag3'], // Add relevant tags for categorization
	url: 'https://doi.org/10.0000/00000', // URL to the publication
	image: '', // Optional: path to image
	additionalUrls: [{ label: 'Publisher Site', url: 'https://example.com/publisher-site' }],
	country: ['Country Name'], // Countries covered in the publication
	project: '' // Options: "Mining the Islam West Africa Collection", "Religious Activism on Campuses in Togo and Benin", "Muslim Minorities in Southern Cities of Benin and Togo", "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso", "Other"
};
