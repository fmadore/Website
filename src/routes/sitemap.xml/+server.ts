import { activitiesByDate } from '$lib/data/activities';
import { allPublications } from '$lib/data/publications/index';
import { allCommunications } from '$lib/data/communications/index';
import { allDhProjects } from '$lib/data/digital-humanities';
import type { RequestHandler } from '@sveltejs/kit';
import { base } from '$app/paths';

// Explicitly prerender this endpoint
export const prerender = true;

export const GET: RequestHandler = async () => {
    const website = "https://www.frederickmadore.com";
    
    // Static pages
    const pages = [
        "",
        "/research",
        "/publications",
        "/publications/visualisations",
        "/activities",
        "/digital-humanities",
        "/conference-activity",
        "/teaching",
        "/teaching/guest-lectures",
        "/contact",
        "/cv"
    ];
    
    // Research project routes
    const researchProjects = [
        "/research/mining-the-islam-west-africa-collection",
        "/research/religious-activism-campuses-togo-benin",
        "/research/muslim-minorities-southern-cities-benin-togo",
        "/research/youth-womens-islamic-activism-cote-divoire-burkina-faso"
    ];

    // Digital Humanities project routes - dynamically generated
    const digitalHumanitiesProjectPaths = allDhProjects.map(project => `${base}/digital-humanities/${project.id}`);

    // Dynamic activity paths
    const activityPaths = activitiesByDate.map(activity => `/activities/${activity.id}`);
    const activityYears = [...new Set(activitiesByDate.map(activity => activity.year))];
    const yearPaths = activityYears.map(year => `/activities/year/${year}`);
    
    // Dynamic publication paths
    const publicationPaths = allPublications.map(pub => `/publications/${pub.id}`);
    
    // Dynamic communication paths 
    // Note: Individual communications are now under /communications/[id]
    const communicationPaths = allCommunications.map(comm => `/communications/${comm.id}`);
    
    // Combine all paths
    const allPaths = [
        ...pages, 
        ...researchProjects, 
        ...digitalHumanitiesProjectPaths,
        ...activityPaths, 
        ...yearPaths,
        ...publicationPaths,
        ...communicationPaths
    ];
    
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