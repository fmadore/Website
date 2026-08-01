export interface IframeEmbed {
	type: 'iframe'; // Discriminating property
	id: string; // Unique ID for the iframe embed, e.g., 'exhibit1-timeline'
	title?: string;
	src: string;
	description?: string; // HTML content allowed
	height?: string;
	variant?: 'fixed' | 'responsive' | 'document';
	allowfullscreen?: boolean;
	/** External embeds are sandboxed by default; null explicitly opts out. */
	sandbox?: string | null;
	showTitle?: boolean; // Whether to display the iframe title above the embed
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

/**
 * What a project link points at. Drives the mono key printed before the
 * addresses on the CV ("Site", "Code", "Data"). Defaults to 'site'.
 */
export type ProjectLinkType = 'site' | 'code' | 'data';

/**
 * A public address for the project: its live site, a source repository, a
 * published dataset. Distinct from `linkUrl`, which redirects the project's
 * card away from its detail page — these are additive apparatus.
 */
export interface ProjectLink {
	url: string;
	/**
	 * Display text. Defaults to the URL minus scheme/www/trailing slash, which
	 * is what a CV should print. Set it where the bare URL reads badly (a repo
	 * listed among siblings, a long dataset path).
	 */
	label?: string;
	type?: ProjectLinkType;
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

	/**
	 * Public addresses for the project — live site, source repositories,
	 * datasets. Printed as apparatus under the CV entry; unlike `linkUrl` they
	 * never change where the project's card points.
	 */
	links?: ProjectLink[];

	award?: string;
	reviews?: Review[];
	publication?: ProjectPublication;
	skills?: string[];
	order?: number; // For sorting projects in a defined order
	featured?: boolean; // Flag to mark projects as featured/pinned

	embeddableContent?: EmbeddableContentItem[]; // Replaces iframes, for embedding content like timelines, visualizations, or images

	// SEO related, can be auto-generated or specified
	seoTitle?: string;
	seoDescription?: string;
	seoKeywords?: string[];
}
