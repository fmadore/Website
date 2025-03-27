import type { Publication } from '$lib/types';

// Blog Post Template - Copy this file and fill in the details
export const blogpostTemplate: Publication = {
    id: "blogpost-template-id", // Replace with URL-friendly ID (use kebab-case)
    type: "blogpost",
    title: "Blog Post Title",
    authors: ["Author Name"], // Add all authors in the array
    date: "2025", // Publication year
    dateISO: "2025-01-01", // Use YYYY-MM-DD format when known
    year: 2025,
    publisher: "Blog Name", // The name of the blog
    language: "English",
    doi: "", // Add DOI when available (if applicable)
    abstract: "A brief description of the blog post's content and significance.",
    tags: ["tag1", "tag2", "tag3"], // Add relevant tags for categorization
    url: "https://example.com/blog-post", // URL to the blog post
    image: "", // Optional: path to image
    additionalUrls: [
        { label: "Blog Homepage", url: "https://example.com/blog" }
    ],
    country: ["Country Name"], // Countries covered in the publication
    project: "" // Options: "Mining the Islam West Africa Collection", "Religious Activism on Campuses in Togo and Benin", "Muslim Minorities in Southern Cities of Benin and Togo", "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso", "Other"
}; 