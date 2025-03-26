import type { Publication } from '$lib/types';

// Book Publication Template - Copy this file and fill in the details
export const bookTemplate: Publication = {
    id: "book-template-id", // Replace with URL-friendly ID (use kebab-case)
    type: "book",
    title: "Book Title",
    authors: ["Author Name"], // Add all authors in the array
    prefacedBy: "", // Optional: author of the preface
    date: "2025", // Publication year
    dateISO: "2025", // Same as date for books
    year: 2025,
    placeOfPublication: "City, Country",
    publisher: "Publisher Name",
    pageCount: 300,
    language: "English",
    isbn: "978-0-000000-00-0",
    doi: "", // Add DOI if available
    abstract: "A comprehensive description of the book's content, main arguments, and significance. This abstract will be used in list views and as a preview of the publication.",
    tags: ["tag1", "tag2", "tag3"], // Add relevant tags for categorization
    url: "", // Optional: external URL if applicable
    image: "", // Optional: path to cover image (e.g., "images/publications/book-cover.jpg")
    heroImage: { // Optional: hero image configuration
        src: "images/publications/book-hero.jpg", 
        alt: "Descriptive alt text for the book cover", 
        caption: "Optional caption for the book cover" 
    },
    // For edited volumes only:
    // isEditedVolume: true, // Uncomment this line if this is an edited volume
    // editors: "Editor Name, Second Editor Name", // Format: "Editor 1, Editor 2"
    // series: "Series Name 00", // Optional: series name and number
};

// Edited Volume Template - Alternative configuration
export const editedVolumeTemplate: Publication = {
    id: "edited-volume-template-id", // Replace with URL-friendly ID (use kebab-case)
    type: "book",
    title: "Edited Volume Title",
    authors: ["Editor Name", "Second Editor Name"], // Add all editors in the array
    editors: "Editor Name, Second Editor Name", // Format: "Editor 1, Editor 2"
    prefacedBy: "", // Optional: author of the preface
    date: "2025", // Publication year
    dateISO: "2025", // Same as date for books
    year: 2025,
    placeOfPublication: "City, Country",
    publisher: "Publisher Name",
    language: "English",
    isbn: "978-0-000000-00-0",
    doi: "", // Add DOI if available
    series: "Series Name 00", // Optional: series name and number
    abstract: "A comprehensive description of the edited volume's content, themes, and significance. This abstract will be used in list views and as a preview of the publication.",
    tags: ["edited volume", "tag1", "tag2"], // Add relevant tags for categorization
    url: "", // Optional: external URL if applicable
    image: "", // Optional: path to cover image (e.g., "images/publications/book-cover.jpg")
    heroImage: { // Optional: hero image configuration
        src: "images/publications/edited-volume-hero.jpg", 
        alt: "Descriptive alt text for the edited volume cover", 
        caption: "Optional caption for the edited volume cover" 
    },
    isEditedVolume: true,
};