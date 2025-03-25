import { activitiesByDate } from '$lib/data/activities';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
    const website = "https://frederickmadore.com"; // Replace with your actual domain
    
    // Static pages
    const pages = [
        "",
        "/research",
        "/publications",
        "/activities",
        "/digital-humanities",
        "/conference-activity",
        "/teaching",
        "/contact"
    ];
    
    // Research project routes
    const researchProjects = [
        "/research/mining-the-islam-west-africa-collection",
        "/research/religious-activism-campuses-togo-benin",
        "/research/muslim-minorities-southern-cities-benin-togo",
        "/research/youth-womens-islamic-activism-cote-divoire-burkina-faso"
    ];

    // Create path for each activity
    const activityPaths = activitiesByDate.map(activity => `/activities/${activity.id}`);
    
    // Create path for each year of activities
    const activityYears = [...new Set(activitiesByDate.map(activity => activity.year))];
    const yearPaths = activityYears.map(year => `/activities/year/${year}`);
    
    // Combine all paths
    const allPaths = [...pages, ...researchProjects, ...activityPaths, ...yearPaths];
    
    // Build the sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset
    xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xhtml="https://www.w3.org/1999/xhtml"
    xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
    xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
    xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
    xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
>
    ${allPaths.map(path => `
    <url>
        <loc>${website}${path}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>${path === "" ? "weekly" : "monthly"}</changefreq>
        <priority>${path === "" ? "1.0" : "0.8"}</priority>
    </url>
    `).join('')}
</urlset>`;

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml'
        }
    });
} 