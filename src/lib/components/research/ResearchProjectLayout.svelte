<!--
ResearchProjectLayout - Shared layout for research project pages

Ink + Signal dossier layout (mockup 2b). A two-column record:

  MAIN (1fr)                              ASIDE (380px)
  ┌───────────────────────────────┐      ┌─────────────────────┐
  │ eyebrow · years · funder      │      │ Fig. 1 — plate      │
  │ H1 (Archivo)                  │      │ metadata ledger     │
  │ serif-italic subtitle         │      │ source languages    │
  │ prose (drop-cap first ¶,      │      │ CTA buttons         │
  │   <h2> → ruled sections)      │      └─────────────────────┘
  │ relevant publications / comms │
  └───────────────────────────────┘

The metadata ledger (PERIOD / CO-DIRECTOR / FUNDER / PROGRAMME / GRANT /
REGIONS) is assembled from the project's real grant record (allGrants, filtered
by projectName) plus a handful of optional props. Every row renders only when
its value exists — projects with no co-director, programme or grant simply drop
those rows. The prose still arrives through the `children` snippet, so each
project page keeps its own narrative; the layout only supplies the frame, the
apparatus, and the ruled-section styling.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import SEO from '$lib/SEO.svelte';
	import RelevantPublications from '$lib/components/panels/RelevantPublications.svelte';
	import RelevantCommunications from '$lib/components/panels/RelevantCommunications.svelte';
	import MediaPlayer from '$lib/components/media/MediaPlayer.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	import { useBreadcrumbJsonLd } from '$lib/utils/breadcrumbJsonLd.svelte';
	import { useGrantsJsonLd } from '$lib/utils/grantsJsonLd.svelte';
	import { allGrants } from '$lib/data/grants/index';
	import type { Grant } from '$lib/types';
	import { base } from '$app/paths';

	/** A call-to-action button in the aside. */
	interface ProjectCta {
		/** Button label (rendered in mono caps). */
		label: string;
		/** Destination URL. */
		href: string;
		/** External link — opens in a new tab and appends a ↗ glyph. */
		external?: boolean;
		/** Primary CTA — solid pine fill (at most one per project). */
		primary?: boolean;
	}

	interface Props {
		/** Full title displayed in the page header */
		title: string;
		/** Short title for breadcrumb navigation */
		shortTitle: string;
		/** URL slug (e.g., 'dh-ai-african-studies') */
		slug: string;
		/** Project years (e.g., '2025-' or '2021-2024') */
		years: string;
		/** Image path relative to /images/research/ */
		imageSrc: string;
		/** Alt text for the image */
		imageAlt: string;
		/** SEO description (optional, defaults to title-based) */
		seoDescription?: string;
		/** SEO keywords (optional) */
		seoKeywords?: string;
		/** Audio source path for podcast (optional) */
		audioSrc?: string;
		/** Project name for filtering related content */
		projectName: string;
		/** Serif-italic deck under the title (optional). */
		subtitle?: string;
		/** Serif-italic caption under the aside plate (defaults to "Fig. 1 — {imageAlt}"). */
		figCaption?: string;
		/**
		 * Co-directors / co-investigators. When omitted, the layout falls back to
		 * the grant record's `coApplicants`.
		 */
		coDirectors?: string[];
		/** Funder label for the eyebrow + ledger (defaults to the grant's funder). */
		funder?: string;
		/** Programme label for the ledger (e.g., 'Open Up · 2026–28'). */
		programme?: string;
		/** Regions / countries for the ledger (e.g., ['West Africa', 'Central Asia']). */
		regions?: string[];
		/** Source-language chips (e.g., ['Russian', 'Arabic', 'Hausa']). */
		sourceLanguages?: string[];
		/** Aside call-to-action buttons. */
		ctas?: ProjectCta[];
		/**
		 * When false, the funder / co-director / grant apparatus is omitted from the
		 * header eyebrow and aside ledger — used when the page already lists them in
		 * its Funding panel and shouldn't repeat them in the rail.
		 */
		showFunding?: boolean;
		/** Content snippet for the main body */
		children: Snippet;
	}

	let {
		title,
		shortTitle,
		slug,
		years,
		imageSrc,
		imageAlt,
		seoDescription,
		seoKeywords,
		audioSrc,
		projectName,
		subtitle,
		figCaption,
		coDirectors,
		funder,
		programme,
		regions,
		sourceLanguages,
		ctas,
		showFunding = true,
		children
	}: Props = $props();

	// Build breadcrumb items
	const breadcrumbItems = $derived([
		{ label: 'Research', href: `${base}/research` },
		{ label: shortTitle, href: `${base}/research/${slug}` }
	]);

	// Inject breadcrumb JSON-LD structured data
	useBreadcrumbJsonLd(() => breadcrumbItems);

	// Inject MonetaryGrant JSON-LD for associated grants
	useGrantsJsonLd(() => projectName);

	/**
	 * The project's headline grant record — the most recently started grant
	 * associated with this project. Supplies funder, amount, status and
	 * co-applicants for the metadata ledger without duplicating data on the page.
	 */
	const primaryGrant = $derived<Grant | undefined>(
		allGrants
			.filter((grant) => grant.project === projectName)
			.sort((a, b) => new Date(b.dateISOStart).getTime() - new Date(a.dateISOStart).getTime())[0]
	);

	// Funder: explicit prop wins, else the headline grant's funder.
	const funderLabel = $derived(funder ?? primaryGrant?.funder);

	// Co-directors: explicit prop wins, else the headline grant's co-applicants.
	const directors = $derived<string[]>(
		coDirectors && coDirectors.length > 0 ? coDirectors : (primaryGrant?.coApplicants ?? [])
	);

	// Formatted grant figure (e.g., "€317,690") — omitted when the grant has no amount.
	const grantAmount = $derived(
		primaryGrant?.amount
			? new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: primaryGrant.currency || 'EUR',
					maximumFractionDigits: 0
				}).format(primaryGrant.amount)
			: undefined
	);

	// Eyebrow tail: "· FUNDER" appended after the years when a funder is known
	// and the funding apparatus isn't being deferred to the Funding panel.
	const eyebrowFunder = $derived(showFunding && funderLabel ? funderLabel : undefined);

	// Caption under the aside plate.
	const plateCaption = $derived(figCaption ?? `Fig. 1 — ${imageAlt}`);

	// Whether the aside has a metadata ledger worth rendering. Funding-derived
	// rows only count when they're not being deferred to the Funding panel.
	const hasLedger = $derived(
		Boolean(
			years || programme || (showFunding && (directors.length > 0 || funderLabel || grantAmount))
		) || (regions?.length ?? 0) > 0
	);
</script>

<SEO title="{title} | Frédérick Madore" description={seoDescription} keywords={seoKeywords} />

<div class="container py-8 page-enter">
	<Breadcrumb items={breadcrumbItems} />

	<div class="project-grid">
		<!-- HEADER — a direct grid child so the title leads on mobile and sits
		     top-left on desktop, with the apparatus rail spanning alongside it. -->
		<header class="project-header">
			<p class="eyebrow project-eyebrow">
				<span>Research Project</span>
				{#if years}<span class="eyebrow-sep" aria-hidden="true">·</span><span>{years}</span>{/if}
				{#if eyebrowFunder}<span class="eyebrow-sep" aria-hidden="true">·</span><span
						>{eyebrowFunder}</span
					>{/if}
			</p>
			<h1 class="project-title">{title}</h1>
			{#if subtitle}
				<p class="standfirst project-subtitle">{subtitle}</p>
			{/if}
		</header>

		<!-- MAIN COLUMN ------------------------------------------------------- -->
		<div class="project-main">
			<!-- Project narrative. Prose arrives through the slot; scoped styles
			     below turn its <h2> headings into ruled section heads and
			     drop-cap the opening paragraph. -->
			<div class="project-prose scroll-reveal">
				{@render children()}
			</div>

			{#if audioSrc}
				<section class="section podcast-section scroll-reveal">
					<div class="section-head">
						<span class="section-no" aria-hidden="true">♪</span>
						<h2 class="section-title">Podcast discussion</h2>
					</div>
					<MediaPlayer
						src="{base}/{audioSrc}"
						type="audio"
						title="Google NotebookLM Podcast Discussion"
						glassEffect=""
						showControls={true}
					/>
				</section>
			{/if}

			<div class="related-content scroll-reveal">
				<RelevantPublications {projectName} limit={6} />
				<div class="related-comms">
					<RelevantCommunications {projectName} limit={6} />
				</div>
			</div>
		</div>

		<!-- ASIDE COLUMN ------------------------------------------------------ -->
		<aside class="project-aside" aria-label="Project details">
			<div class="aside-inner">
				<figure class="aside-figure">
					<img
						class="plate aside-plate"
						src="{base}/images/research/{imageSrc}"
						alt={imageAlt}
						width="380"
						height="285"
						loading="lazy"
						decoding="async"
					/>
					<figcaption class="plate-caption">{plateCaption}</figcaption>
				</figure>

				{#if hasLedger}
					<dl class="stat-ledger aside-ledger">
						{#if years}
							<div class="stat-row">
								<dt>Period</dt>
								<dd class="stat-value">{years}</dd>
							</div>
						{/if}
						{#if showFunding && directors.length > 0}
							<div class="stat-row">
								<dt>{directors.length > 1 ? 'Co-directors' : 'Co-director'}</dt>
								<dd class="stat-value">{directors.join(' · ')}</dd>
							</div>
						{/if}
						{#if showFunding && funderLabel}
							<div class="stat-row">
								<dt>Funder</dt>
								<dd class="stat-value">{funderLabel}</dd>
							</div>
						{/if}
						{#if programme}
							<div class="stat-row">
								<dt>Programme</dt>
								<dd class="stat-value">{programme}</dd>
							</div>
						{/if}
						{#if showFunding && grantAmount}
							<div class="stat-row">
								<dt>Grant</dt>
								<dd class="stat-value stat-value--accent">
									{grantAmount}{#if primaryGrant?.status}
										<span class="grant-status"> · {primaryGrant.status}</span>{/if}
								</dd>
							</div>
						{/if}
						{#if regions && regions.length > 0}
							<div class="stat-row">
								<dt>Regions</dt>
								<dd class="stat-value">{regions.join(' · ')}</dd>
							</div>
						{/if}
					</dl>
				{/if}

				{#if sourceLanguages && sourceLanguages.length > 0}
					<div class="aside-block">
						<p class="aside-block-label">Source languages</p>
						<div class="chip-row">
							{#each sourceLanguages as lang (lang)}
								<span class="chip">{lang}</span>
							{/each}
						</div>
					</div>
				{/if}

				{#if ctas && ctas.length > 0}
					<div class="aside-ctas">
						<!-- eslint-disable svelte/no-navigation-without-resolve -- CTA hrefs are external / pre-built absolute project URLs -->
						{#each ctas as cta (cta.href)}
							<a
								class="cta"
								class:cta--primary={cta.primary}
								href={cta.href}
								target={cta.external ? '_blank' : undefined}
								rel={cta.external ? 'noopener noreferrer' : undefined}
							>
								<span>{cta.label}</span>
								{#if cta.external}<span class="cta-glyph" aria-hidden="true">↗</span>{/if}
							</a>
						{/each}
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					</div>
				{/if}
			</div>
		</aside>
	</div>
</div>

<style>
	/* ==========================================================================
	 * GRID — main record + 380px apparatus rail, stacking on mobile
	 * ======================================================================== */
	.project-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-xl);
	}

	/* On a single column (mobile/tablet) the title leads, the apparatus rail
	 * follows so the plate and key facts sit near the top, and the dossier prose
	 * comes last. */
	@media (--lg-down) {
		.project-header {
			order: 0;
		}
		.project-aside {
			order: 1;
		}
		.project-main {
			order: 2;
		}
	}

	/* On desktop the header sits top-left, the prose fills the row below it, and
	 * the apparatus rail spans both rows down the right. */
	@media (--lg) {
		.project-grid {
			grid-template-columns: minmax(0, 1fr) 380px;
			grid-template-rows: auto 1fr;
			column-gap: var(--space-16);
			row-gap: var(--space-lg);
			align-items: start;
		}
		.project-header {
			grid-column: 1;
			grid-row: 1;
		}
		.project-main {
			grid-column: 1;
			grid-row: 2;
		}
		.project-aside {
			grid-column: 2;
			grid-row: 1 / span 2;
		}
	}

	.project-main {
		min-width: 0;
	}

	/* ==========================================================================
	 * HEADER — eyebrow · title · standfirst
	 * ======================================================================== */
	/* Spacing between header, prose and rail is handled by the grid gaps. */
	.project-header {
		margin-bottom: 0;
	}

	.project-eyebrow {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-2);
		margin-bottom: var(--space-sm);
		text-transform: uppercase;
	}

	.eyebrow-sep {
		color: var(--color-text-muted);
	}

	.project-title {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display);
		color: var(--color-text-emphasis);
		font-weight: 800;
		font-size: var(--font-size-3xl);
		line-height: 1;
		letter-spacing: -0.015em;
		margin: 0;
		max-width: 20ch;
		text-wrap: balance;
	}

	.project-subtitle {
		margin-top: var(--space-md);
		font-size: var(--font-size-xl);
	}

	@media (--md) {
		.project-title {
			font-size: var(--font-size-4xl);
		}
	}

	/* ==========================================================================
	 * PROSE — the narrative slot, cast in ruled sections
	 *
	 * Each project page authors its body as paragraphs, lists and <h2> heads.
	 * Here the first paragraph gets a drop cap, and every <h2> is drawn as a
	 * ruled section head: a 3px rule and an Archivo title.
	 * ======================================================================== */
	.project-prose {
		color: var(--color-text);
		font-family: var(--font-family-serif);
	}

	.project-prose :global(p),
	.project-prose :global(li) {
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
	}

	.project-prose :global(p) {
		margin: 0 0 var(--space-md);
	}

	/* Opening paragraph — larger ink and a pine Archivo drop cap. */
	.project-prose :global(> p:first-child) {
		font-size: var(--font-size-lg);
		color: var(--color-text-emphasis);
	}

	.project-prose :global(> p:first-child::first-letter) {
		float: left;
		font-family: var(--font-family-display);
		font-variation-settings: 'wdth' 118;
		font-weight: 850;
		font-size: 4.4em;
		line-height: 0.72;
		padding: 0.06em 0.1em 0 0;
		color: var(--color-accent);
	}

	/* Prose links — pine with a hairline underline (inline-citation idiom). */
	.project-prose :global(a) {
		color: var(--color-accent);
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, var(--color-accent) 45%, transparent);
		text-decoration-thickness: var(--border-width-thin);
		text-underline-offset: 0.16em;
		transition:
			color var(--duration-fast) var(--ease-out),
			text-decoration-color var(--duration-fast) var(--ease-out);
	}

	.project-prose :global(a:hover) {
		color: var(--color-accent-dark);
		text-decoration-color: var(--color-accent);
	}

	.project-prose :global(a:focus-visible) {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-2xs);
	}

	.project-prose :global(strong) {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
	}

	.project-prose :global(em) {
		font-style: italic;
	}

	/* <h2> → section head opened by a 3px section rule. */
	.project-prose :global(h2) {
		border-top: var(--rule-section) solid var(--color-primary);
		padding-top: var(--space-sm);
		margin: var(--space-2xl) 0 var(--space-md);
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display-sm);
		font-size: var(--font-size-2xl);
		font-weight: 750;
		letter-spacing: -0.01em;
		line-height: 1.05;
		color: var(--color-text-emphasis);
	}

	/* <h3> — quiet serif subhead inside a section. */
	.project-prose :global(h3) {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin: var(--space-lg) 0 var(--space-sm);
	}

	/* Ordered lists — the "innovations" enumeration reads as a ledger of
	   numbered items; keep the markers but give them room. */
	.project-prose :global(ul),
	.project-prose :global(ol) {
		margin: 0 0 var(--space-lg);
		padding-left: var(--space-lg);
	}

	.project-prose :global(li) {
		margin-bottom: var(--space-sm);
	}

	.project-prose :global(li::marker) {
		color: var(--color-text-light);
		font-family: var(--font-family-mono);
	}

	/* ==========================================================================
	 * PODCAST + RELATED — closing sections on the main column
	 * ======================================================================== */
	.podcast-section {
		margin-top: var(--space-2xl);
	}

	.related-content {
		margin-top: var(--space-2xl);
		border-top: var(--rule-section) solid var(--color-primary);
		padding-top: var(--space-sm);
	}

	.related-comms {
		margin-top: var(--space-xl);
	}

	/* ==========================================================================
	 * ASIDE — the apparatus rail: plate, ledger, chips, CTAs
	 * ======================================================================== */
	.project-aside {
		min-width: 0;
	}

	@media (--lg) {
		.aside-inner {
			position: sticky;
			top: var(--space-xl);
		}
	}

	.aside-figure {
		margin: 0 0 var(--space-lg);
	}

	.aside-plate {
		aspect-ratio: 4 / 3;
	}

	.aside-ledger {
		padding-top: var(--space-md);
		border-top: var(--rule-hairline) solid var(--color-border);
		margin: 0 0 var(--space-lg);
	}

	.aside-ledger .stat-row {
		gap: var(--space-md);
		padding: var(--space-2) 0;
		border-bottom: var(--rule-hairline) solid var(--color-border);
		align-items: baseline;
	}

	.aside-ledger dt {
		flex-shrink: 0;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-light);
		font-weight: var(--font-weight-medium);
	}

	.aside-ledger dd {
		margin: 0;
		text-align: right;
	}

	.grant-status {
		font-weight: var(--font-weight-semibold);
	}

	/* Source-languages block. */
	.aside-block {
		margin: 0 0 var(--space-lg);
	}

	.aside-block-label {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--color-text-light);
		margin: 0 0 var(--space-sm);
	}

	/* ==========================================================================
	 * CTA BUTTONS — mono caps, square. Primary = solid pine fill.
	 * ======================================================================== */
	.aside-ctas {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.cta {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		border: var(--border-width-thin) solid var(--color-border-dark);
		background: transparent;
		color: var(--color-text-emphasis);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		text-decoration: none;
		transition:
			border-color var(--duration-fast) var(--ease-out),
			background var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.cta:hover {
		border-color: var(--color-primary);
		background: color-mix(in srgb, var(--color-primary) 6%, transparent);
	}

	.cta:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-2xs);
	}

	.cta--primary {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: var(--color-text-inverted);
	}

	.cta--primary:hover {
		background: var(--color-accent-dark);
		border-color: var(--color-accent-dark);
		color: var(--color-text-inverted);
	}

	.cta-glyph {
		flex-shrink: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.project-prose :global(a),
		.cta {
			transition: none;
		}
	}
</style>
