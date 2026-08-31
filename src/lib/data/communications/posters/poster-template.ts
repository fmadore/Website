import type { Communication } from '$lib/types/communication';

// Poster Template - Copy this file and fill in the details
export const posterTemplate: Communication = {
	id: 'poster-template-id', // Replace with URL-friendly ID (use kebab-case)
	title: 'Poster Title',
	authors: ['Author Name'], // Add all authors in the array
	date: '25 September 2026', // Day the poster was presented
	dateISO: '2026-09-25', // Use YYYY-MM-DD format for sorting
	year: 2026,
	conference: 'Conference or Event Name', // Event at which the poster was exhibited
	location: 'City, Venue', // City and venue where the poster was presented
	country: 'Country', // Country where the event was held
	type: 'poster', // Keep as 'poster' for this folder
	language: 'English', // Language of the poster - can be a single string or array: ['English', 'French']
	abstract: 'The accepted abstract for the poster.',
	tags: ['tag1', 'tag2', 'tag3'], // Add relevant tags for categorization
	url: 'https://example.com/event', // URL to the event page, poster PDF, or related resources
	urlLabel: 'Event Website', // Optional: custom label for the primary URL button
	image: 'images/communications/poster-image.webp', // Path to poster image
	heroImage: {
		// Optional: hero image configuration
		src: 'images/communications/poster-hero.webp',
		alt: 'Descriptive alt text for the poster image',
		caption: 'Optional caption for the poster image'
	},
	coordinates: {
		latitude: 49.9427, // Example coordinates (University of Bayreuth)
		longitude: 11.5674
	},
	project: '' // Options: "Digital Humanities and AI in African Studies", "Religious Activism on Campuses in Togo and Benin", "Muslim Minorities in Southern Cities of Benin and Togo", "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso", "Digital Research Environment (University of Bayreuth)", "Other"
};
