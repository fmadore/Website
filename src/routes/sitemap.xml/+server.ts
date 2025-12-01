import { activitiesByDate } from '$lib/data/activities';
import { allPublications } from '$lib/data/publications/index';
import { allCommunications } from '$lib/data/communications/index';
import { allDhProjects } from '$lib/data/digital-humanities';
import type { RequestHandler } from '@sveltejs/kit';
import { base } from '$app/paths';

// Explicitly prerender this endpoint
export const prerender = true;

/**
 * SEO Priority Configuration
 * - 1.0: Homepage (most important)
 * - 0.9: Main section pages (Research, Publications, CV, etc.) - These should appear as sitelinks
 * - 0.8: Sub-pages within main sections (individual research projects, DH projects)
 * - 0.7: Individual content items (publications, communications, activities)
 * - 0.6: Archive/listing pages (year archives)
 */
interface SitemapEntry {
	path: string;
	priority: number;
	changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
	lastmod?: string;
}

export const GET: RequestHandler = async () => {
	const website = 'https://www.frederickmadore.com';
	const currentDate = new Date().toISOString();

	// Helper to format dates properly for sitemap
	const formatDate = (date?: Date | string): string => {
		if (!date) return currentDate;
		return new Date(date).toISOString();
	};

	// Static pages with specific priorities for sitelinks optimization
	const staticPages: SitemapEntry[] = [
		// Homepage - highest priority
		{ path: '', priority: 1.0, changefreq: 'weekly' },
		// Main navigation sections - these should become sitelinks
		{ path: '/research', priority: 0.9, changefreq: 'monthly' },
		{ path: '/publications', priority: 0.9, changefreq: 'weekly' },
		{ path: '/cv', priority: 0.9, changefreq: 'monthly' },
		{ path: '/activities', priority: 0.9, changefreq: 'weekly' },
		{ path: '/digital-humanities', priority: 0.9, changefreq: 'monthly' },
		{ path: '/teaching', priority: 0.9, changefreq: 'monthly' },
		// Secondary pages
		{ path: '/publications/visualisations', priority: 0.8, changefreq: 'monthly' },
		{ path: '/conference-activity', priority: 0.7, changefreq: 'monthly' },
		{ path: '/teaching/guest-lectures', priority: 0.8, changefreq: 'monthly' }
	];

	// Research project routes (sub-pages of Research)
	const researchProjectPages: SitemapEntry[] = [
		'/research/mining-the-islam-west-africa-collection',
		'/research/religious-activism-campuses-togo-benin',
		'/research/muslim-minorities-southern-cities-benin-togo',
		'/research/youth-womens-islamic-activism-cote-divoire-burkina-faso'
	].map((path) => ({
		path,
		priority: 0.8,
		changefreq: 'monthly' as const
	}));

	// Digital Humanities project routes
	const dhProjectPages: SitemapEntry[] = allDhProjects.map((project) => ({
		path: `${base}/digital-humanities/${project.id}`,
		priority: 0.8,
		changefreq: 'monthly' as const
	}));

	// Activity pages - individual activities
	const activityPages: SitemapEntry[] = activitiesByDate.map((activity) => ({
		path: `/activities/${activity.id}`,
		priority: 0.7,
		changefreq: 'yearly' as const,
		lastmod: activity.date ? formatDate(activity.date) : currentDate
	}));

	// Activity year archive pages
	const activityYears = [...new Set(activitiesByDate.map((activity) => activity.year))];
	const yearPages: SitemapEntry[] = activityYears.map((year) => ({
		path: `/activities/year/${year}`,
		priority: 0.6,
		changefreq: 'yearly' as const
	}));

	// Publication pages
	const publicationPages: SitemapEntry[] = allPublications.map((pub) => ({
		path: `/publications/${pub.id}`,
		priority: 0.7,
		changefreq: 'yearly' as const
	}));

	// Communication pages
	const communicationPages: SitemapEntry[] = allCommunications.map((comm) => ({
		path: `/communications/${comm.id}`,
		priority: 0.7,
		changefreq: 'yearly' as const
	}));

	// Combine all entries
	const allEntries: SitemapEntry[] = [
		...staticPages,
		...researchProjectPages,
		...dhProjectPages,
		...activityPages,
		...yearPages,
		...publicationPages,
		...communicationPages
	];

	// Build the sitemap XML with proper formatting
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
    xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xhtml="https://www.w3.org/1999/xhtml"
    xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
>
${allEntries
	.map(
		(entry) => `    <url>
        <loc>${website}${entry.path}</loc>
        <lastmod>${entry.lastmod || currentDate}</lastmod>
        <changefreq>${entry.changefreq}</changefreq>
        <priority>${entry.priority.toFixed(1)}</priority>
    </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(sitemap.trim(), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600' // Cache for 1 hour
		}
	});
};
