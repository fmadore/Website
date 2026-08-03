/**
 * A research project — the top-level unit of the research programme, distinct
 * from the digital-humanities projects (which are tools and archives).
 *
 * The record carries the project's *metadata* only. Each project's narrative
 * stays in `src/routes/research/<id>/+page.svelte`, because the prose embeds
 * components (`<ItemReference>`, `<RelevantGrants>`) that cannot survive a
 * round-trip through a data file. The route page spreads this record into
 * `ResearchProjectLayout` and supplies the body as its children snippet.
 */

/** A call-to-action button in the project aside. */
export interface ProjectCtaLink {
	/** Button label (rendered in mono caps). */
	label: string;
	/** Destination URL. */
	href: string;
	/** External link — opens in a new tab and appends a ↗ glyph. */
	external?: boolean;
	/** Primary CTA — solid pine fill (at most one per project). */
	primary?: boolean;
}

/**
 * A project's narrative, lifted out of its route page at build time by
 * `scripts/generate-research-prose.mjs`. Authored as markup in
 * `src/routes/research/<id>/+page.svelte`; this is the plain-text projection,
 * so `/api/research.json` can carry the full text.
 */
export interface ResearchProse {
	/** Plain text, paragraphs separated by a blank line. */
	body: string;
	/** Publication and communication ids cited inline in the prose. */
	references: string[];
}

export interface ResearchProject {
	/** URL-friendly ID; also the route slug under /research/. */
	id: string;
	/** Full title displayed in the page header. */
	title: string;
	/** Short title for breadcrumbs. */
	shortTitle: string;
	/**
	 * Title for the landing-page card, where the full `title` runs too long but
	 * `shortTitle` drops the context a reader scanning the list needs. Defaults
	 * to `title`.
	 */
	cardTitle?: string;
	/**
	 * Project span, e.g. '2021-2024' or '2025-' for open-ended work. Printed
	 * verbatim in the detail-page eyebrow, and parsed for the landing timeline.
	 */
	years: string;
	/** Ongoing work. Drives the landing page's current/earlier split. */
	current?: boolean;
	/** One-sentence summary for the landing page card and the JSON API. */
	shortDescription: string;
	/** Image filename, relative to /images/research/. */
	imageSrc: string;
	/** Alt text for the image. */
	imageAlt: string;
	/** Serif-italic deck under the title. */
	subtitle?: string;
	/** Serif-italic caption under the aside plate (defaults to "Fig. 1 — {imageAlt}"). */
	figCaption?: string;
	/**
	 * Name used to gather related publications, communications and grants. Matches
	 * the `project` field on those records, so it must stay byte-identical to them.
	 */
	projectName: string;
	/** Co-directors. When omitted, the layout falls back to the grant's `coApplicants`. */
	coDirectors?: string[];
	/** Funder label. Defaults to the grant record's funder. */
	funder?: string;
	/** Programme label for the ledger (e.g. 'Open Up · 2026–28'). */
	programme?: string;
	/** Regions covered (e.g. ['West Africa', 'Central Asia']). */
	regions?: string[];
	/** Source languages of the project's corpus. */
	sourceLanguages?: string[];
	/** Aside call-to-action buttons. */
	ctas?: ProjectCtaLink[];
	/** Audio companion (NotebookLM overview), relative to /static/. */
	audioSrc?: string;
	/**
	 * When false, the funder / co-director / grant apparatus is omitted from the
	 * eyebrow and aside ledger — used when the page lists them in its own panel.
	 */
	showFunding?: boolean;
	/** SEO description. Defaults to a title-based one. */
	seoDescription?: string;
	/** SEO keywords, comma-separated. */
	seoKeywords?: string;
	/** Display order; lower first. Ties break on reverse chronology. */
	order?: number;
}
