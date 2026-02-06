import { error } from '@sveltejs/kit';
import { base } from '$app/paths';
import { getActivityById } from '$lib/stores/activities.svelte';
import type { PageLoad } from './$types';
import type { BlogPostingJsonLd, JsonLdPerson } from '$lib/types/jsonld';

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
	const defaultAuthor: JsonLdPerson = {
		'@type': 'Person',
		name: 'Frédérick Madore',
		url: 'https://www.frederickmadore.com',
		jobTitle: 'Research Fellow',
		affiliation: {
			'@type': 'Organization',
			name: 'Leibniz-Zentrum Moderner Orient (ZMO)'
		}
	};

	jsonLdObject.author = defaultAuthor;

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
