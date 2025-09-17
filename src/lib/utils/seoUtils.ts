import type { Communication } from '$lib/types/communication';
import type { Publication } from '$lib/types';

/**
 * Creates an optimized SEO description for communication pages
 * 
 * Best practices applied:
 * - 150-160 characters optimal length for Google SERPs
 * - Front-loads important keywords (type, topic, location)
 * - Uses smart truncation to avoid cutting mid-sentence
 * - Includes call-to-action when space allows
 * - Fallback logic for missing fields
 */
export function createCommunicationSEODescription(communication: Communication): string {
	const { type, title, conference, location, country, year, abstract, authors } = communication;
	
	// Helper to get readable type labels
	const getTypeLabel = (type: string): string => {
		const typeLabels: Record<string, string> = {
			conference: 'Conference paper',
			workshop: 'Workshop presentation',
			seminar: 'Seminar',
			lecture: 'Lecture',
			panel: 'Panel discussion',
			event: 'Academic presentation'
		};
		return typeLabels[type] || 'Academic presentation';
	};

	// Helper to truncate text while preserving sentence boundaries
	const smartTruncate = (text: string, maxLength: number): string => {
		if (text.length <= maxLength) return text;
		
		// Find the last complete sentence within the limit
		const truncated = text.substring(0, maxLength);
		const lastSentenceEnd = Math.max(
			truncated.lastIndexOf('. '),
			truncated.lastIndexOf('? '),
			truncated.lastIndexOf('! ')
		);
		
		if (lastSentenceEnd > maxLength * 0.6) {
			// If we have a good sentence break, use it
			return text.substring(0, lastSentenceEnd + 1).trim();
		}
		
		// Otherwise, truncate at word boundary and add ellipsis
		const lastSpace = truncated.lastIndexOf(' ');
		return lastSpace > maxLength * 0.6 
			? text.substring(0, lastSpace) + '...'
			: text.substring(0, maxLength - 3) + '...';
	};

	// Start building the description with the most important information first
	let description = '';
	
	// Begin with type and title (most important for academic content)
	if (type && title) {
		const typeLabel = getTypeLabel(type);
		description = `${typeLabel}: ${title}`;
	} else if (title) {
		description = title;
	}
	
	// Add location and year context (highly valuable for academic presentations)
	const locationInfo = [];
	if (conference) locationInfo.push(conference);
	if (location && location !== conference) locationInfo.push(location);
	if (country && !location?.includes(country)) locationInfo.push(country);
	if (year) locationInfo.push(year.toString());
	
	if (locationInfo.length > 0) {
		const locationText = ` Presented at ${locationInfo.join(', ')}.`;
		if ((description + locationText).length <= 160) {
			description += locationText;
		} else if (description.length < 100) {
			// For shorter descriptions, try a more compact format
			const shortLocationText = ` at ${conference || location || country || year}`;
			if ((description + shortLocationText).length <= 160) {
				description += shortLocationText;
			}
		}
	}
	
	// If we have space and an abstract, add a summary
	if (abstract && description.length < 120) {
		const remainingSpace = 160 - description.length - 1; // -1 for space
		const abstractPreview = smartTruncate(abstract, remainingSpace);
		if (abstractPreview.length > 20) { // Only add if meaningful content
			description += ` ${abstractPreview}`;
		}
	}
	
	// Ensure we don't exceed 160 characters
	if (description.length > 160) {
		description = smartTruncate(description, 160);
	}
	
	// Fallback if somehow we still don't have a good description
	if (!description.trim()) {
		const authorText = authors?.length ? ` by ${authors[0]}` : '';
		const eventText = conference ? ` at ${conference}` : '';
		const yearText = year ? ` (${year})` : '';
		description = `Academic presentation${eventText}${authorText}${yearText}`;
	}
	
	return description;
}

/**
 * Creates optimized keywords for communication pages
 * Combines communication-specific terms with general academic keywords
 */
export function createCommunicationSEOKeywords(communication: Communication): string {
	const keywords = new Set<string>();
	
	// Add communication-specific keywords
	if (communication.type) keywords.add(communication.type);
	if (communication.tags) communication.tags.forEach(tag => keywords.add(tag));
	if (communication.authors) communication.authors.forEach(author => keywords.add(author));
	if (communication.country) keywords.add(communication.country);
	if (communication.language) keywords.add(communication.language);
	
	// Add context-appropriate academic keywords
	keywords.add('academic presentation');
	if (communication.type === 'conference') keywords.add('conference paper');
	if (communication.type === 'workshop') keywords.add('workshop presentation');
	
	// Add subject-matter keywords based on typical content
	keywords.add('Islam');
	keywords.add('West Africa');
	keywords.add('digital humanities');
	keywords.add('Frédérick Madore');
	
	return Array.from(keywords).join(', ');
}

/**
 * Helper to truncate titles for breadcrumbs and titles
 * Used to prevent overly long titles in page headers
 */
export function truncateTitle(title: string, maxLength: number = 50): string {
	if (title.length <= maxLength) return title;
	
	// Check for natural break points like colons
	const colonIndex = title.indexOf(':');
	if (colonIndex > 0 && colonIndex < maxLength) {
		return title.substring(0, colonIndex) + '...';
	}
	
	// Otherwise truncate at word boundary
	const truncated = title.substring(0, maxLength);
	const lastSpace = truncated.lastIndexOf(' ');
	return lastSpace > maxLength * 0.6 
		? title.substring(0, lastSpace) + '...'
		: title.substring(0, maxLength - 3) + '...';
}

/**
 * Creates an optimized SEO description for publication pages
 * 
 * Best practices applied:
 * - 150-160 characters optimal length for Google SERPs
 * - Front-loads important keywords (type, journal/publisher, year)
 * - Uses smart truncation to avoid cutting mid-sentence
 * - Includes publication venue information
 * - Fallback logic for missing fields
 */
export function createPublicationSEODescription(publication: Publication): string {
	const { type, title, journal, publisher, book, year, abstract, authors, placeOfPublication } = publication;
	
	// Helper to get readable type labels
	const getTypeLabel = (type: string): string => {
		const typeLabels: Record<string, string> = {
			article: 'Journal article',
			book: 'Book',
			chapter: 'Book chapter',
			'special-issue': 'Special issue',
			report: 'Research report',
			encyclopedia: 'Encyclopedia entry',
			blogpost: 'Blog post',
			'masters-thesis': "Master's thesis",
			'phd-dissertation': 'PhD dissertation'
		};
		return typeLabels[type] || 'Academic publication';
	};

	// Helper to truncate text while preserving sentence boundaries (reuse existing function)
	const smartTruncate = (text: string, maxLength: number): string => {
		if (text.length <= maxLength) return text;
		
		// Find the last complete sentence within the limit
		const truncated = text.substring(0, maxLength);
		const lastSentenceEnd = Math.max(
			truncated.lastIndexOf('. '),
			truncated.lastIndexOf('? '),
			truncated.lastIndexOf('! ')
		);
		
		if (lastSentenceEnd > maxLength * 0.6) {
			// If we have a good sentence break, use it
			return text.substring(0, lastSentenceEnd + 1).trim();
		}
		
		// Otherwise, truncate at word boundary and add ellipsis
		const lastSpace = truncated.lastIndexOf(' ');
		return lastSpace > maxLength * 0.6 
			? text.substring(0, lastSpace) + '...'
			: text.substring(0, maxLength - 3) + '...';
	};

	// Start building the description with the most important information first
	let description = '';
	
	// Begin with type and title (most important for academic content)
	if (type && title) {
		const typeLabel = getTypeLabel(type);
		description = `${typeLabel}: ${title}`;
	} else if (title) {
		description = title;
	}
	
	// Add publication venue context (highly valuable for academic publications)
	const venueInfo = [];
	
	// Different venue information based on publication type
	if (type === 'article' || type === 'special-issue') {
		if (journal) venueInfo.push(journal);
	} else if (type === 'chapter') {
		if (book) venueInfo.push(`in ${book}`);
	} else if (type === 'book' || type === 'report') {
		if (publisher) venueInfo.push(publisher);
		if (placeOfPublication) venueInfo.push(placeOfPublication);
	} else if (type === 'encyclopedia') {
		if ((publication as any).encyclopediaTitle) venueInfo.push((publication as any).encyclopediaTitle);
	} else if (type === 'masters-thesis' || type === 'phd-dissertation') {
		if ((publication as any).university) venueInfo.push((publication as any).university);
	}
	
	if (year) venueInfo.push(year.toString());
	
	if (venueInfo.length > 0) {
		const venueText = ` Published in ${venueInfo.join(', ')}.`;
		if ((description + venueText).length <= 160) {
			description += venueText;
		} else if (description.length < 100) {
			// For shorter descriptions, try a more compact format
			const shortVenueText = ` (${venueInfo[0] || year})`;
			if ((description + shortVenueText).length <= 160) {
				description += shortVenueText;
			}
		}
	}
	
	// If we have space and an abstract, add a summary
	if (abstract && description.length < 120) {
		const remainingSpace = 160 - description.length - 1; // -1 for space
		const abstractPreview = smartTruncate(abstract, remainingSpace);
		if (abstractPreview.length > 20) { // Only add if meaningful content
			description += ` ${abstractPreview}`;
		}
	}
	
	// Ensure we don't exceed 160 characters
	if (description.length > 160) {
		description = smartTruncate(description, 160);
	}
	
	// Fallback if somehow we still don't have a good description
	if (!description.trim()) {
		const authorText = authors?.length ? ` by ${authors[0]}` : '';
		const yearText = year ? ` (${year})` : '';
		const typeLabel = getTypeLabel(type);
		description = `${typeLabel}${authorText}${yearText}`;
	}
	
	return description;
}

/**
 * Creates optimized keywords for publication pages
 * Combines publication-specific terms with general academic keywords
 */
export function createPublicationSEOKeywords(publication: Publication): string {
	const keywords = new Set<string>();
	
	// Add publication-specific keywords
	if (publication.type) keywords.add(publication.type);
	if (publication.tags) publication.tags.forEach(tag => keywords.add(tag));
	if (publication.authors) publication.authors.forEach(author => keywords.add(author));
	if (publication.language) keywords.add(publication.language);
	
	// Add venue-specific keywords
	if (publication.journal) keywords.add(publication.journal);
	if (publication.publisher) keywords.add(publication.publisher);
	if (publication.book) keywords.add(publication.book);
	
	// Add context-appropriate academic keywords
	keywords.add('academic publication');
	if (publication.type === 'article') keywords.add('journal article');
	if (publication.type === 'book') keywords.add('academic book');
	if (publication.type === 'chapter') keywords.add('book chapter');
	
	// Add subject-matter keywords based on typical content
	keywords.add('Islam');
	keywords.add('West Africa');
	keywords.add('digital humanities');
	keywords.add('Frédérick Madore');
	
	// Add research-specific terms
	if (publication.project) keywords.add(publication.project);
	
	return Array.from(keywords).join(', ');
}