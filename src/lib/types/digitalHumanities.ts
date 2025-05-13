export interface IframeEmbed {
    id: string; // Unique ID for the iframe embed, e.g., 'exhibit1-timeline'
    title?: string;
    src: string;
    description?: string; // HTML content allowed
    height?: string; // e.g., '650px', 'iframe-container-md' (maps to class)
    aspectRatio?: '16-9' | '4-3' | '1-1' | '21-9'; // Maps to aspect ratio classes
    containerClass?: string; // e.g., 'iframe-container-sm', 'iframe-container-no-margin'
    scrolling?: 'yes' | 'no' | 'auto';
    allowfullscreen?: boolean;
    showTitle?: boolean; // Whether to display the iframe title above the embed
}

export interface Review {
    text: string;
    url: string;
}

export interface ProjectPublication {
    text: string;
    url: string;
}

export interface DigitalHumanitiesProject {
    id: string; // kebab-case identifier, used for URL and internal linking
    title: string;
    years: string; // e.g., "2023-", "2021", "2018-2023"
    shortDescription: string; // For card view, plain text
    description: string; // Main description for detail page, HTML content allowed
    imageUrl: string; // Main image for card and fallback hero
    heroImageUrl?: string; // Optional dedicated hero image for detail page
    
    linkUrl?: string; // Optional: External link to the live project
    // linkTarget will be derived: '_blank' for external, '_self' for internal to /digital-humanities/[id]
    // actionText will be derived: 'Visit Site ->' or 'Explore project ->'

    award?: string;
    reviews?: Review[];
    publication?: ProjectPublication;
    skills?: string[];
    
    iframes?: IframeEmbed[]; // For embedding content like timelines, visualizations

    // SEO related, can be auto-generated or specified
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
} 