export type Activity = {
    id: string;           // URL-friendly ID for routing
    title: string;        // Activity title
    date: string;         // Display date
    url?: string;         // External URL if applicable
    year: number;         // Year for filtering
    description: string;  // Short description for list view
    content?: string;     // Full HTML content for detail page
    tags?: string[];      // Optional tags for categorization
    image?: string;       // Optional image path
}; 