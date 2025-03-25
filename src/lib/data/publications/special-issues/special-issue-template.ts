import type { Publication } from '$lib/types';

// Special Issue Template - Copy this file and fill in the details
export const specialIssueTemplate: Publication = {
    id: "special-issue-template-id", // Replace with URL-friendly ID (use kebab-case)
    type: "special-issue",
    title: "Special Issue Title",
    authors: ["Editor Name", "Second Editor"], // Add all editors in the array
    editors: "Editor Name and Second Editor", // Format: "Editor 1 and Editor 2"
    date: "2025", // Publication year
    dateISO: "2025", // Same as date for special issues
    year: 2025,
    journal: "Journal Name",
    volume: "1",
    issue: "2",
    language: "English",
    doi: "", // Add DOI if available
    abstract: "A comprehensive description of the special issue's focus, themes, and significance. This abstract will be used in list views and as a preview of the publication.",
    tags: ["special issue", "tag1", "tag2"], // Add relevant tags for categorization
    url: "", // URL to the special issue
    image: "", // Optional: path to cover image (e.g., "images/publications/special-issue-cover.jpg")
    heroImage: { // Optional: hero image configuration
        src: "images/publications/special-issue-hero.jpg", 
        alt: "Descriptive alt text for the special issue cover", 
        caption: "Optional caption for the special issue cover" 
    },
    isEditedWork: true
}; 