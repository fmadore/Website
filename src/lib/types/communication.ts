export type Communication = {
	id: string; // URL-friendly ID for routing
	title: string; // Communication title
	authors: string[]; // Array of authors
	date: string; // Display date (e.g., "2023")
	dateISO: string; // ISO date format (YYYY-MM-DD) for sorting
	year: number; // Year for filtering
	conference: string; // Name of the conference
	panelTitle?: string; // Optional: Title of the panel the paper was presented in
	location: string; // City/venue
	country: string; // Country where the conference took place
	abstract?: string; // Abstract or description (optional)
	url?: string; // Optional: URL to presentation slides, video, etc.
	additionalUrls?: Array<{ label: string; url: string }>; // Additional URLs with labels
	tags?: string[]; // Optional tags for categorization
	image?: string; // Optional image path (e.g. presentation slide)
	heroImage?: {
		// Optional hero image configuration
		src: string; // Path to the image
		alt: string; // Alt text for accessibility
		caption?: string; // Optional caption for the image
	};
	coordinates?: {
		// GPS coordinates for visualizations
		latitude: number; // Latitude
		longitude: number; // Longitude
	};
	type?: 'conference' | 'workshop' | 'seminar' | 'lecture' | 'panel' | 'event' | 'podcast'; // Type of communication
	language?: string | string[]; // Language(s) of the communication - can be a single language or multiple languages
	coAuthors?: string[]; // Additional co-authors
	papers?: Array<{
		// Papers presented at the panel
		title: string; // Paper title
		authors: Array<{ name: string; affiliation?: string }>; // Paper authors with optional affiliation
		abstract?: string; // Optional paper abstract
	}>;
	participants?: Array<{
		// Additional participants
		name: string; // Participant name
		role?: string; // Optional role (chair, discussant, etc.)
		affiliation?: string; // Optional institutional affiliation
	}>;
	episode?: string | number; // Optional: Episode number for podcasts
	doi?: string; // Optional: DOI for the communication
	project?: string; // Project association: "Mining the Islam West Africa Collection", "Religious Activism on Campuses in Togo and Benin", etc.
};
