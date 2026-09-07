// Define the structure for a work that cites this publication
export type CitingWork = {
	authors: string[]; // Array of authors of the citing work
	year: number; // Year of publication of the citing work
	title: string; // Title of the citing work
	source?: string; // Optional: Journal, book title, etc.
	url?: string; // Optional: URL or DOI to the citing work
};

// Define the structure for a review of this publication
export type ReviewWork = {
	author: string; // Author of the review
	year: number; // Year of publication of the review
	title: string; // Title of the review
	journal: string; // Journal where the review was published
	volume?: string; // Volume number
	issue?: string; // Issue number
	pages?: string; // Page range
	doi?: string; // DOI of the review
	url?: string; // URL to the review
	excerpt?: string; // Optional excerpt from the review
};

// Define the structure for a table of contents entry (for edited volumes and special issues)
export type TableOfContentsEntry = {
	title: string; // Chapter or article title
	authors?: string[]; // Optional: Authors of the chapter/article (not needed for front/back matter)
};

export type Publication = {
	id: string; // URL-friendly ID for routing
	type:
		| 'book'
		| 'article'
		| 'chapter'
		| 'special-issue'
		| 'report'
		| 'encyclopedia'
		| 'blogpost'
		| 'phd-dissertation'
		| 'masters-thesis'
		| 'conference-proceedings'
		| 'bulletin-article'
		| 'working-paper'; // Publication type for faceting
	title: string; // Publication title
	authors: string[]; // Array of authors
	date: string; // Display date (e.g., "2025")
	dateISO: string; // ISO date (YYYY, YYYY-MM, or YYYY-MM-DD) for sorting
	year: number; // Year for filtering
	placeOfPublication?: string; // Place of publication (for books)
	publisher?: string; // Publisher name (books, journals, etc.)
	publisherLocation?: string; // Country/city where publisher is based (e.g., "Netherlands", "Berlin, Germany")
	pageCount?: number; // Number of pages
	language: string; // Publication language
	isbn?: string; // ISBN for books
	doi?: string; // DOI for articles
	abstract?: string; // Abstract or description (optional)
	url?: string; // Optional: external URL if applicable
	/**
	 * True only when the full text is freely readable — a repository copy, a
	 * gold/diamond OA journal, an OA book. NOT implied by having a `doi` or a
	 * `url`: most `url`s point at a publisher's catalogue page, which is a
	 * paywall, not open access. Authored per record; never derived.
	 */
	openAccess?: boolean;
	additionalUrls?: Array<{ label: string; url: string }>; // Additional URLs with labels
	tags?: string[]; // Optional tags for categorization
	image?: string; // Optional cover image path
	heroImage?: {
		// Optional hero image configuration
		src: string; // Path to the image
		alt: string; // Alt text for accessibility
		caption?: string; // Optional caption for the image
	};
	// Additional fields for articles
	journal?: string; // Journal name for articles
	volume?: string; // Volume number for articles
	issue?: string; // Issue number for articles
	pages?: string; // Page range for articles and chapters
	// Additional fields for conference proceedings
	proceedingsTitle?: string; // Title of the conference proceedings
	conferenceName?: string; // Name of the conference
	conferenceLocation?: string; // Location of the conference
	// Additional fields for book chapters
	book?: string; // Book title for chapters
	editors?: string; // Book editors for chapters
	// Additional fields for edited volumes
	isEditedVolume?: boolean; // Flag for edited volumes
	isEditedWork?: boolean; // Flag for any edited work (volumes or special issues)
	series?: string; // Series name and number
	prefacedBy?: string; // Author of the preface
	// Additional fields for encyclopedia entries
	encyclopediaTitle?: string; // Encyclopedia title
	// Additional fields for dissertations
	department?: string; // Academic department
	university?: string; // University where the dissertation was defended
	advisors?: string[]; // Dissertation advisors/supervisors
	// New fields
	country?: string[]; // Countries covered in the publication
	project?: string; // Project name the publication relates to
	citedBy?: CitingWork[]; // Optional: Array of works citing this publication
	reviewedBy?: ReviewWork[]; // Optional: Array of reviews of this publication
	// Table of Contents for books and special issues
	tableOfContents?: (string | TableOfContentsEntry)[]; // Supports both legacy string[] and structured entries

	// Fields for Highwire Press meta tags
	pdfUrl?: string; // Optional: URL to the PDF version
	issn?: string; // Optional: ISSN for journals
	institution?: string; // Optional: Institution for reports or dissertations (university is already there for dissertations)
	reportNumber?: string; // Optional: Report number for reports

	// Featured flag
	featured?: boolean; // Optional: Flag to mark publications as featured
};

/**
 * The fields the list pages never render and the summary projection drops:
 * the two heaviest by far (`citedBy`, `abstract`) and the two only the
 * publication page reads. A union so `data/publications/summaryConfig.ts` can
 * list the same names for the generator with TypeScript holding the two in
 * step.
 */
export type HeavyPublicationField = 'abstract' | 'citedBy' | 'tableOfContents' | 'heroImage';

/**
 * A publication as the list pages, the CV and the research pages see it:
 * every `Publication` field except the heavy four, plus what those pages
 * derive from them. Generated by scripts/generate-publication-summaries.mjs
 * into `data/publications/summaries.generated.ts`; the publication page keeps
 * importing the full record.
 *
 * Structurally assignable to `Publication` (the dropped fields are optional
 * there), so the citation formatter and the sort helpers take a summary
 * unchanged. Read `citedByCount` and `abstractExcerpt`, never the fields they
 * stand in for — a summary does not carry them.
 */
export type PublicationSummary = Omit<Publication, HeavyPublicationField> & {
	/** Directory-derived type, as the full index adds it (`books`, `articles`, …). */
	sourceDirType: string;
	/**
	 * The abstract's opening, one character longer than ABSTRACT_EXCERPT_LENGTH
	 * (see summaryConfig.ts), so any truncation up to that length behaves
	 * exactly as on the full abstract. Rows truncate this, never the abstract.
	 */
	abstractExcerpt?: string;
	/** `citedBy.length` of the full record. */
	citedByCount: number;
	/** Contributor names from the table of contents, for the authors facet. */
	tocAuthors: string[];
};
