import { error } from '@sveltejs/kit';
import { base } from '$app/paths';
import { getActivityById, type Activity } from '$lib/stores/activities';
import type { PageLoad } from './$types';

// Define the JSON-LD structure interface (can be moved to a shared types file later)
interface JsonLd {
    "@context": string;
    "@type": string;
    name: string;
    description: string;
    datePublished: string;
    author: {
        "@type": string;
        name: string;
        jobTitle: string;
        affiliation: {
            "@type": string;
            name: string;
        };
    };
    image?: string;
    keywords?: string;
}

export const load: PageLoad = ({ params }) => {
    const activityId = params.id;
    const activity = getActivityById(activityId);

    if (!activity) {
        throw error(404, 'Activity not found');
    }

    // Construct the JSON-LD object
    const jsonLdObject: JsonLd = {
        "@context": "https://schema.org",
        "@type": activity.tags?.includes('article') ? "ScholarlyArticle" : 
                  activity.tags?.includes('book') ? "Book" : 
                  (activity.tags?.includes('conference') || activity.tags?.includes('Workshop')) ? "Event" : 
                  "CreativeWork",
        "name": activity.title,
        "description": activity.description,
        "datePublished": activity.dateISO,
        "author": {
            "@type": "Person",
            "name": "Frédérick Madore",
            "jobTitle": "Research Fellow",
            "affiliation": {
                "@type": "Organization",
                "name": "Leibniz-Zentrum Moderner Orient (ZMO)"
            }
        }
    };

    if (activity.heroImage?.src) {
        // Use absolute URL
        jsonLdObject.image = `${base}/${activity.heroImage.src}`; 
    }

    if (activity.tags) {
        jsonLdObject.keywords = activity.tags.join(", ");
    }

    // Return both activity data and the JSON-LD object
    return {
        activity,
        jsonLdObject 
    };
}; 