import { base } from '$app/paths';
import type { PageLoad } from './$types';

// --- JSON-LD Interfaces ---
interface Organization {
    "@type": "Organization";
    name: string;
    url?: string; // Added URL for organization
}

interface Occupation {
    "@type": "Occupation";
    name: string; // The occupation name (e.g., "Research Fellow")
    // additional properties like occupationalCategory could be added if known
}

interface Person {
    "@context": "https://schema.org";
    "@type": "Person";
    name: string;
    honorificPrefix?: string; // Added Honorific Prefix (e.g., Dr.)
    url?: string; 
    image?: string;
    email?: string; // Added email
    jobTitle?: string;
    hasOccupation?: Occupation; // Added hasOccupation
    affiliation?: Organization; // Interface already updated to include url
    sameAs?: string[]; 
    knowsAbout?: string[]; // Added knowsAbout
}

// --- Load Function ---
export const load: PageLoad = () => {

    const personJsonLd: Person = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Frédérick Madore",
        "honorificPrefix": "Dr.", // Added prefix
        "url": "https://www.frederickmadore.com", 
        "image": `${base}/images/Profile-picture.jpg`, 
        "email": "frederick.madore@zmo.de", // Added email
        "jobTitle": "Research Fellow", // Keep jobTitle for compatibility
        "hasOccupation": { // Added structured occupation
            "@type": "Occupation",
            "name": "Research Fellow"
        },
        "affiliation": {
            "@type": "Organization",
            "name": "Leibniz-Zentrum Moderner Orient (ZMO)",
            "url": "https://www.zmo.de/en" // Added affiliation URL
        },
        "sameAs": [
            "https://www.linkedin.com/in/frederickmadore/",
            "https://github.com/fmadore",
            "https://orcid.org/0000-0003-0959-2092",
            "https://bsky.app/profile/fmadore.bsky.social",
            "https://hcommons.social/@fmadore", // Mastodon
            "https://scholar.google.com/citations?user=naUK0RQAAAAJ&",
            "https://www.researchgate.net/profile/Frederick-Madore",
            "https://hcommons.org/members/fmadore/", // Knowledge Commons
            "https://zmo.academia.edu/FrederickMadore",
            "https://www.wikidata.org/wiki/Q55725595"
        ],
        "knowsAbout": [ // Added topics
            "Islam",
            "West Africa",
            "Muslim Societies",
            "History",
            "Religious Activism",
            "Secularism",
            "Muslim Politics",
            "Digital Humanities",
            "Benin",
            "Togo",
            "Côte d'Ivoire",
            "Burkina Faso"
        ]
    };

    const jsonLdString = JSON.stringify(personJsonLd);

    // Return only the JSON-LD string, as the page doesn't need other specific load data
    return {
        jsonLdString
    };
}; 