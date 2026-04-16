export type Activity = {
	id: string; // URL-friendly ID for routing
	title: string; // Activity title
	date: string; // Display date (e.g., "21 March 2025")
	dateISO: string; // ISO date format (YYYY-MM-DD) for sorting and internal use
	url?: string; // External URL if applicable
	additionalUrls?: Array<{ label: string; url: string }>; // Additional URLs with labels
	year: number; // Year for filtering
	description: string; // Short description for list view
	content?: string; // Full HTML content for detail page
	tags?: string[]; // Optional tags for categorization
	type?: string; // Activity type (conference, workshop, seminar, etc.)
	image?: string; // Optional image path
	heroImage?: {
		// Optional hero image configuration
		src: string; // Path to the image
		alt: string; // Alt text for accessibility
		caption?: string; // Optional caption for the image
	};
	pdfPath?: string; // Optional path to an associated PDF file
	pdfTitle?: string; // Optional title for the PDF section
	panelType?: string; // Optional: type for display in panels (e.g., 'conference', 'workshop', etc.)
	location?: {
		// Optional geographic location for the activity, used by the map visualisation
		country: string; // Country name — must match a key in src/lib/data/geo.ts COUNTRY_COORDINATES
		city?: string; // Optional city (shown in popup subtitle)
		venue?: string; // Optional venue (shown in popup subtitle if city is missing)
	};
	series?: string; // Optional grouping key for related activities (lecture series, grant programme, etc.)
};
