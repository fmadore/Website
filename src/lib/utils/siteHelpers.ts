/**
 * Helper functions for site configuration
 * Provides formatted output for various contexts (HTML, PDF, SEO, RSS)
 */

import { address, author, contact, website, socialLinks, type SocialLink } from '$lib/data/siteConfig';

/**
 * Get formatted multi-line address
 */
export function getFormattedAddress(options: { includeInstitution?: boolean } = {}): string {
    const { includeInstitution = true } = options;
    const lines: string[] = [];

    if (includeInstitution) {
        lines.push(address.institution);
    }
    lines.push(address.street);
    lines.push(`${address.postalCode} ${address.city}`);
    lines.push(address.country);

    return lines.join('\n');
}

/**
 * Get address as array of lines (for PDF generation)
 */
export function getAddressLines(options: { includeInstitution?: boolean } = {}): string[] {
    const { includeInstitution = true } = options;
    const lines: string[] = [];

    if (includeInstitution) {
        lines.push(address.institution);
    }
    lines.push(address.street);
    lines.push(`${address.postalCode} ${address.city}`);
    lines.push(address.country);

    return lines;
}

/**
 * Get mailto link for email
 */
export function getEmailLink(): string {
    return `mailto:${contact.email}`;
}

/**
 * Get default SEO description
 */
export function getDefaultDescription(): string {
    return `Personal website of ${author.name}, ${author.position}, specializing in Islam and digital humanities in West Africa.`;
}

/**
 * Get RSS channel description
 */
export function getRssDescription(): string {
    return `Recent activities, presentations, publications, and academic updates from ${author.name}, ${author.position}`;
}

/**
 * Get social links as array for iteration
 */
export function getSocialLinksArray(): SocialLink[] {
    return Object.values(socialLinks);
}

/**
 * Get formatted email with name for RSS/email headers
 */
export function getEmailWithName(): string {
    return `${contact.email} (${author.name})`;
}

/**
 * Get institution name with abbreviation
 */
export function getInstitutionWithAbbr(): string {
    return `${address.institution} (${address.institutionAbbreviation})`;
}

// Re-export commonly used values for convenience
export { address, author, contact, website, socialLinks };
