/**
 * Helper functions for site configuration
 * Provides formatted output for various contexts (HTML, PDF, SEO, RSS)
 */

import { address, author, contact, website, socialLinks } from '$lib/data/siteConfig';

/**
 * Get address as array of lines (for PDF generation)
 */
export function getAddressLines(options: { includeInstitution?: boolean } = {}): string[] {
	const { includeInstitution = true } = options;
	const lines: string[] = [];

	if (includeInstitution) {
		lines.push(address.institution);
	}
	if (address.department) {
		lines.push(address.department);
	}
	if (address.street) {
		lines.push(`${address.street}, ${address.postalCode} ${address.city}`);
	} else {
		lines.push(`${address.postalCode} ${address.city}`);
	}
	if (address.room) {
		lines.push(address.room);
	}

	return lines;
}

/**
 * A page's `<title>`: its own segments, most specific first, then the site
 * name — `pageTitle('Research')` → "Research | Frédérick Madore". The name
 * comes from siteConfig, like every other author string in SEO metadata.
 */
export function pageTitle(...segments: string[]): string {
	return [...segments, author.name].join(' | ');
}

/**
 * Get default SEO description
 */
export function getDefaultDescription(): string {
	return `Personal website of ${author.name}, ${author.position}, specialising in Islam and digital humanities in West Africa.`;
}

/**
 * SEO description of the CV page, composed from siteConfig so the current
 * post never has to be retyped here.
 */
export function getCvDescription(): string {
	return `Curriculum vitae of ${author.name}, ${author.position}: publications, talks, activities, teaching and fieldwork in West Africa.`;
}

/**
 * Get RSS channel description
 */
export function getRssDescription(): string {
	return `Recent activities, presentations, publications, and academic updates from ${author.name}, ${author.position}`;
}

/**
 * Get formatted email with name for RSS/email headers
 */
export function getEmailWithName(): string {
	return `${contact.email} (${author.name})`;
}

// Re-export commonly used values for convenience
export { address, author, contact, website, socialLinks };
