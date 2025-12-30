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
    position: 'Research Fellow at Leibniz-Zentrum Moderner Orient (ZMO)',
    positionShort: 'Research Fellow'
};

export const address: Address = {
    institution: 'Leibniz-Zentrum Moderner Orient',
    institutionAbbreviation: 'ZMO',
    street: 'Kirchweg 33',
    postalCode: '14129',
    city: 'Berlin',
    country: 'Germany',
    mapsUrl: 'https://maps.app.goo.gl/AV85XrMqokwShSLZ8'
};

export const contact = {
    email: 'frederick.madore@zmo.de'
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
                name: `${address.street}\n${address.postalCode} ${address.city}\n${address.country}`,
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
