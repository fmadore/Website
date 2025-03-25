export type Publication = {
    id: string;           // URL-friendly ID for routing
    type: 'book' | 'article' | 'chapter'; // Publication type for faceting
    title: string;        // Publication title
    authors: string[];    // Array of authors
    date: string;         // Display date (e.g., "2025")
    dateISO: string;      // ISO date format (YYYY) for sorting
    year: number;         // Year for filtering
    placeOfPublication?: string; // Place of publication
    publisher?: string;   // Publisher/Editor
    pageCount?: number;   // Number of pages
    language: string;     // Publication language
    isbn?: string;        // ISBN for books
    doi?: string;         // DOI for articles
    abstract: string;     // Abstract or description
    url?: string;         // Optional: external URL if applicable
    tags?: string[];      // Optional tags for categorization
    image?: string;       // Optional cover image path
    heroImage?: {         // Optional hero image configuration
        src: string;      // Path to the image
        alt: string;      // Alt text for accessibility
        caption?: string; // Optional caption for the image
    };
}; 