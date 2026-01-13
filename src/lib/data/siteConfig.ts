/**
 * Centralized site configuration
 * Single source of truth for contact info, social links, and author details
 */

// Types for social links
export interface SocialLink {
    name: string;
    url: string;
    icon: string;
    username?: string; // For display purposes (e.g., 'fmadore' for GitHub)
}

// Types for address
export interface Address {
    institution: string;
    institutionAbbreviation: string;
    institutionUrl: string;
    department?: string; // Optional department/research center line
    street: string;
    postalCode: string;
    city: string;
    country: string;
    mapsUrl: string;
}

// Types for author info
export interface AuthorInfo {
    name: string;
    fullName: string; // With title
    position: string;
    positionShort: string; // Without institution name
}

export const author: AuthorInfo = {
    name: 'Frédérick Madore',
    fullName: 'Frédérick Madore, PhD',
    position: 'Historian & Digital Humanist | Data Curator at the Cluster of Excellence "Africa Multiple", University of Bayreuth',
    positionShort: 'Historian & Data Curator'
};

export const address: Address = {
    institution: 'University of Bayreuth',
    institutionAbbreviation: 'UBT',
    institutionUrl: 'https://www.africamultiple.uni-bayreuth.de/en/index.html',
    department: 'Forschungszentrum für Afrikastudien',
    street: 'Gebäude GW1, Zi.: 0.07, Universitätsstr. 30',
    postalCode: '95447',
    city: 'Bayreuth',
    country: 'Germany',
    mapsUrl: 'https://maps.app.goo.gl/ZLoe7FJALUqaQ23m6'
};

export const contact = {
    email: 'Frederick.Madore@uni-bayreuth.de'
};

export const website = {
    url: 'https://www.frederickmadore.com',
    domain: 'www.frederickmadore.com',
    rssPath: '/rss.xml'
};

// Social links with icons for Iconify
export const socialLinks = {
    email: {
        name: 'Email',
        url: `mailto:${contact.email}`,
        icon: 'mdi:email',
        username: contact.email
    } as SocialLink,
    linkedIn: {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/in/frederickmadore/',
        icon: 'mdi:linkedin',
        username: 'frederickmadore'
    } as SocialLink,
    github: {
        name: 'GitHub',
        url: 'https://github.com/fmadore',
        icon: 'mdi:github',
        username: 'fmadore'
    } as SocialLink,
    orcid: {
        name: 'ORCID',
        url: 'https://orcid.org/0000-0003-0959-2092',
        icon: 'simple-icons:orcid',
        username: '0000-0003-0959-2092'
    } as SocialLink,
    googleScholar: {
        name: 'Google Scholar',
        url: 'https://scholar.google.com/citations?user=naUK0RQAAAAJ',
        icon: 'academicons:google-scholar'
    } as SocialLink,
    researchGate: {
        name: 'ResearchGate',
        url: 'https://www.researchgate.net/profile/Frederick-Madore',
        icon: 'simple-icons:researchgate'
    } as SocialLink,
    bluesky: {
        name: 'Bluesky',
        url: 'https://bsky.app/profile/fmadore.bsky.social',
        icon: 'simple-icons:bluesky',
        username: 'fmadore.bsky.social'
    } as SocialLink
};

// Pre-grouped social links for Footer component
export const socialGroups = [
    {
        title: 'Contact',
        links: [
            socialLinks.email,
            {
                name: `${address.institution}\n${address.street}\n${address.postalCode} ${address.city}\n${address.country}`,
                icon: 'mdi:map-marker',
                url: address.mapsUrl
            }
        ]
    },
    {
        title: 'Academic',
        links: [socialLinks.googleScholar, socialLinks.orcid, socialLinks.researchGate]
    },
    {
        title: 'Social',
        links: [
            socialLinks.linkedIn,
            socialLinks.github,
            socialLinks.bluesky,
            { name: 'RSS Feed', url: website.rssPath, icon: 'mdi:rss' }
        ]
    }
];
