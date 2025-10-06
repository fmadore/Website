import { error } from '@sveltejs/kit';
import { base } from '$app/paths';
import { getActivityById } from '$lib/stores/activities.svelte';
import type { PageLoad } from './$types';

// --- JSON-LD Interfaces ---
interface BaseJsonLd {
	'@context': 'https://schema.org';
	'@type': string;
	name: string;
	description?: string;
	image?: string;
	keywords?: string;
}

interface Person {
	'@type': 'Person';
	name: string;
	url?: string;
	jobTitle?: string;
	affiliation?: {
		'@type': 'Organization';
		name: string;
	};
}

interface BlogPostingJsonLd extends BaseJsonLd {
	'@type': 'BlogPosting';
	headline?: string;
	datePublished: string;
	author?: Person | Person[];
}

// Simplified Union type - Although we only generate BlogPosting here now
type JsonLd = BlogPostingJsonLd;

// --- Load Function ---
export const load: PageLoad = ({ params }) => {
	const activityId = params.id;
	const activity = getActivityById(activityId);

	if (!activity) {
		throw error(404, 'Activity not found');
	}

	// Determine type - Removed tag checking, always BlogPosting for this route
	const resolvedType = 'BlogPosting';

	// Format date with time and timezone (Berlin CET = UTC+1)
	// Note: This assumes CET. If activity dates span DST changes, logic might need adjustment.
	const formattedDatePublished = `${activity.dateISO}T00:00:00+01:00`;

	// Use BlogPostingJsonLd directly, but keep Partial for optional fields
	const jsonLdObject: Partial<BlogPostingJsonLd> = {
		'@context': 'https://schema.org',
		'@type': resolvedType, // Always "BlogPosting"
		name: activity.title,
		headline: activity.title,
		description: activity.description,
		datePublished: formattedDatePublished
	};

	// Default author
	const defaultAuthor: Person = {
		'@type': 'Person',
		name: 'Frédérick Madore',
		url: 'https://www.frederickmadore.com',
		jobTitle: 'Research Fellow',
		affiliation: {
			'@type': 'Organization',
			name: 'Leibniz-Zentrum Moderner Orient (ZMO)'
		}
	};

	// Assign fields for BlogPosting
	jsonLdObject.author = defaultAuthor;

	// Remove the switch statement
	/* 
    switch (resolvedType) {
        case "Event":
            // ... event logic removed ...
            break;
        case "ScholarlyArticle":
            // ... article logic removed ...
            break;
        case "Book":
            // ... book logic removed ...
            break;
        case "BlogPosting": 
            // ... blog logic moved out ...
            break;
    }
    */

	// Common optional fields
	if (activity.heroImage?.src) {
		jsonLdObject.image = `${base}/${activity.heroImage.src}`;
	}
	if (activity.tags) {
		jsonLdObject.keywords = activity.tags.join(', ');
	}

	const jsonLdString = JSON.stringify(jsonLdObject);

	return {
		activity,
		jsonLdString
	};
};
