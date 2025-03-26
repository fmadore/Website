export type Communication = {
    id: string;             // URL-friendly ID for routing
    title: string;          // Communication title
    authors: string[];      // Array of authors
    date: string;           // Display date (e.g., "2023")
    dateISO: string;        // ISO date format (YYYY-MM-DD) for sorting
    year: number;           // Year for filtering
    conference: string;     // Name of the conference
    location: string;       // City/venue
    country: string;        // Country where the conference took place
    abstract?: string;      // Abstract or description (optional)
    url?: string;           // Optional: URL to presentation slides, video, etc.
    additionalUrls?: Array<{label: string, url: string}>; // Additional URLs with labels
    tags?: string[];        // Optional tags for categorization
    image?: string;         // Optional image path (e.g. presentation slide)
    heroImage?: {           // Optional hero image configuration
        src: string;        // Path to the image
        alt: string;        // Alt text for accessibility
        caption?: string;   // Optional caption for the image
    };
    coordinates?: {         // GPS coordinates for visualizations
        latitude: number;   // Latitude
        longitude: number;  // Longitude
    };
    type?: 'conference' | 'workshop' | 'seminar' | 'lecture' | 'panel'; // Type of communication
    language?: string;      // Language of the communication
    coAuthors?: string[];   // Additional co-authors
}; 