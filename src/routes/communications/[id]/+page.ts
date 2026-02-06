import { error } from '@sveltejs/kit';
import { base } from '$app/paths';
import { allCommunications } from '$lib/data/communications/index';
import type { PageLoad } from './$types';
import type { EventJsonLd } from '$lib/types/jsonld';
import { formatAuthors, formatJsonLdDate } from '$lib/types/jsonld';

export const load: PageLoad = ({ params }) => {
	const communication = allCommunications.find((comm) => comm.id === params.id);

	if (!communication) {
		throw error(404, 'Communication not found');
	}

	// Build JSON-LD structured data using Event schema
	// Academic presentations/talks are modeled as Events with performer
	const jsonLdObject: Partial<EventJsonLd> = {
		'@context': 'https://schema.org',
		'@type': 'Event',
		name: communication.title,
		description: communication.abstract,
		url: `${base}/communications/${communication.id}`
	};

	// Date
	if (communication.dateISO) {
		jsonLdObject.startDate = formatJsonLdDate(communication.dateISO);
	}

	// Location
	if (communication.location || communication.country) {
		const locationParts = [communication.location, communication.country]
			.filter(Boolean)
			.join(', ');
		jsonLdObject.location = {
			'@type': 'Place',
			name: locationParts
		};
	}

	// Organizer (conference name)
	if (communication.conference) {
		jsonLdObject.organizer = {
			'@type': 'Organization',
			name: communication.conference
		};
	}

	// Performers (authors/presenters)
	if (communication.authors && communication.authors.length > 0) {
		const authors = formatAuthors(communication.authors);
		// Add URL to the primary author
		jsonLdObject.performer = authors.map((a) =>
			a.name === 'Frédérick Madore'
				? { ...a, url: 'https://www.frederickmadore.com' }
				: a
		);
	}

	// Image
	if (communication.heroImage?.src) {
		jsonLdObject.image = `${base}/${communication.heroImage.src}`;
	} else if (communication.image) {
		jsonLdObject.image = `${base}/${communication.image}`;
	}

	// Keywords
	if (communication.tags) {
		jsonLdObject.keywords = communication.tags.join(', ');
	}

	// Language
	if (communication.language) {
		jsonLdObject.inLanguage = Array.isArray(communication.language)
			? communication.language[0]
			: communication.language;
	}

	const jsonLdString = JSON.stringify(jsonLdObject);

	return {
		communication,
		jsonLdString
	};
};
