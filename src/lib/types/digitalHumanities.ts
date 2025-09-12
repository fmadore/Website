export interface IframeEmbed {
	type: 'iframe'; // Discriminating property
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
	glassEffect?: boolean; // Enable glassmorphism effects
	glassVariant?:
		| 'glass'
		| 'glass-light'
		| 'glass-medium'
		| 'glass-heavy'
		| 'glass-primary'
		| 'glass-accent'
		| 'glass-highlight'
		| 'glass-frosted'; // Glass effect variant
}

export interface ImageEmbed {
	type: 'image'; // Discriminating property
	id: string; // Unique ID for the image embed
	title?: string;
	src: string; // URL of the image
	alt: string; // Alt text for the image
	description?: string; // HTML content allowed, displayed below the image
	containerClass?: string; // For styling the container of the image + description
	showTitle?: boolean; // Whether to display the title above the image
	linkUrl?: string; // Optional URL to link the image to
}

export type EmbeddableContentItem = IframeEmbed | ImageEmbed;

export interface Review {
	text: string;
	url: string;
	quote?: string; // Optional field for an excerpt from the review
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
	order?: number; // For sorting projects in a defined order

	embeddableContent?: EmbeddableContentItem[]; // Replaces iframes, for embedding content like timelines, visualizations, or images

	// SEO related, can be auto-generated or specified
	seoTitle?: string;
	seoDescription?: string;
	seoKeywords?: string[];
}
