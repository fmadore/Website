import type { Publication } from '$lib/types';

// Book Chapter Template - Copy this file and fill in the details
export const chapterTemplate: Publication = {
    id: "chapter-template-id", // Replace with URL-friendly ID (use kebab-case)
    type: "chapter",
    title: "Chapter Title",
    authors: ["Author Name"], // Add all authors in the array
    date: "2025", // Publication year
    dateISO: "2025", // Same as date for book chapters
    year: 2025,
    book: "Title of the Book", // Title of the book containing the chapter
    editors: "Editor Name and Second Editor", // Editors of the book
    placeOfPublication: "City, Country",
    publisher: "Publisher Name",
    pages: "100-120", // Page range of the chapter
    pageCount: 0, // Total number of pages
    language: "English",
    doi: "", // Add DOI if available
    abstract: "A comprehensive description of the chapter's content, methodology, findings, and significance. This abstract will be used in list views and as a preview of the publication.",
    tags: ["tag1", "tag2", "tag3"], // Add relevant tags for categorization
    url: "", // URL to the publication if available
    image: "", // Optional: path to image (e.g., "images/publications/chapter-image.jpg")
    heroImage: { // Optional: hero image configuration
        src: "images/publications/chapter-hero.jpg", 
        alt: "Descriptive alt text for the chapter image", 
        caption: "Optional caption for the chapter image" 
    },
    // New fields
    country: ["Country Name"], // Countries covered in the publication
    project: "", // Options: "Mining the Islam West Africa Collection", "Religious Activism on Campuses in Togo and Benin", "Muslim Minorities in Southern Cities of Benin and Togo", "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso", "Other"
    citedBy: [] // Optional: List of works citing this publication
}; 