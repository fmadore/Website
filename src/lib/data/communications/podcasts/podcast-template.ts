import type { Communication } from '$lib/types/communication';

// Podcast Template - Copy this file and fill in the details
export const podcastTemplate: Communication = {
	id: 'podcast-template-id', // Replace with URL-friendly ID (use kebab-case)
	title: 'Podcast Episode Title',
	authors: ['Host Name', 'Guest Name'], // Add all hosts and guests in the array
	date: '2025', // Year or specific date of the podcast episode
	dateISO: '2025-06-15', // Use YYYY-MM-DD format for sorting
	year: 2025,
	conference: 'Podcast Series Name', // Name of the podcast series
	episode: 1, // Optional: Episode number
	doi: '10.1234/example.doi', // Optional: DOI
	location: 'Platform/Studio', // Platform where published or recording location
	country: 'Country', // Country of production
	type: 'podcast', // Type: 'podcast'
	language: 'English', // Language of the podcast - can be a single string or array: ['English', 'French']
	abstract:
		'A comprehensive description of the podcast episode content, topics discussed, and key insights.',
	tags: ['tag1', 'tag2', 'tag3'], // Add relevant tags for categorization
	url: 'https://example.com/podcast-episode', // URL to podcast episode
	additionalUrls: [
		{ label: 'Spotify', url: 'https://spotify.com/episode' },
		{ label: 'Apple Podcasts', url: 'https://apple.com/podcast' },
		{ label: 'YouTube', url: 'https://youtube.com/watch' },
		{ label: 'Show Notes', url: 'https://example.com/show-notes' }
	],
	image: 'images/communications/podcast-cover.jpg', // Path to podcast cover image
	heroImage: {
		// Optional: hero image configuration
		src: 'images/communications/podcast-hero.jpg',
		alt: 'Descriptive alt text for the podcast image',
		caption: 'Optional caption for the podcast episode'
	},
	coordinates: {
		// Optional: coordinates if relevant to episode content
		latitude: 52.52, // Example coordinates
		longitude: 13.405
	},
	project: '' // Options: "Mining the Islam West Africa Collection", "Religious Activism on Campuses in Togo and Benin", "Muslim Minorities in Southern Cities of Benin and Togo", "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso", "Other"
};
