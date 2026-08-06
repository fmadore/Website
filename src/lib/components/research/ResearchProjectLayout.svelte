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
	import ResearchProjectAside from '$lib/components/research/ResearchProjectAside.svelte';
	import JsonLd from '$lib/components/common/JsonLd.svelte';
	import { buildBreadcrumbJsonLd, BREADCRUMB_SCRIPT_ID } from '$lib/utils/breadcrumbJsonLd.svelte';
	import { buildGrantsJsonLd, GRANTS_SCRIPT_ID } from '$lib/utils/grantsJsonLd.svelte';
	import { allGrants } from '$lib/data/grants/index';
	import { allPublications } from '$lib/data/publications/index';
	import { allCommunications } from '$lib/data/communications/index';
	import type { Grant, ResearchProject } from '$lib/types';
	import { website } from '$lib/utils/siteHelpers';
	import { base } from '$app/paths';

	/**
	 * Every project record in `$lib/data/research` is spread straight into this
	 * layout, so the props *are* the record — plus the narrative snippet, which
	 * stays in the route page because it embeds components.
	 */
	interface Props extends ResearchProject {
		/** Content snippet for the main body */
		children: Snippet;
	}

	let {
		title,
		shortTitle,
		id,
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
		{ label: shortTitle, href: `${base}/research/${id}` }
	]);

	// Structured data — rendered into <svelte:head> below so it prerenders.
	const breadcrumbJsonLd = $derived(buildBreadcrumbJsonLd(breadcrumbItems));
	const grantsJsonLd = $derived(buildGrantsJsonLd(projectName, `${website.url}/research/${id}`));

	/** Every grant attached to this project, most recently started first. */
	const projectGrants = $derived<Grant[]>(
		allGrants
			.filter((grant) => grant.project === projectName)
			.sort((a, b) => new Date(b.dateISOStart).getTime() - new Date(a.dateISOStart).getTime())
	);

	/**
	 * The project's headline grant record — the most recently started grant
	 * associated with this project. Supplies funder and co-applicants for the
	 * metadata ledger without duplicating data on the page.
	 */
	const primaryGrant = $derived<Grant | undefined>(projectGrants[0]);

	/**
	 * The figures the ledger reports: every awarded grant carrying an amount,
	 * oldest first, so a project carried by several awards states all of its
	 * support (€53,670 + €60,410) rather than only the newest line. Listing
	 * rather than summing keeps awards in different currencies honest and matches
	 * the itemised Funding panel. A project with no award yet falls back to its
	 * headline grant, so a submitted or turned-down record still reads with its
	 * own status.
	 */
	const ledgerGrants = $derived.by((): Grant[] => {
		const awarded = projectGrants.filter((grant) => grant.status === 'Awarded' && grant.amount);
		if (awarded.length > 0) return awarded.reverse();
		return primaryGrant?.amount ? [primaryGrant] : [];
	});

	// Funder: explicit prop wins, else the headline grant's funder.
	const funderLabel = $derived(funder ?? primaryGrant?.funder);

	// Co-directors: explicit prop wins, else the headline grant's co-applicants.
	const directors = $derived<string[]>(
		coDirectors && coDirectors.length > 0 ? coDirectors : (primaryGrant?.coApplicants ?? [])
	);

	function formatGrantAmount(grant: Grant): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: grant.currency || 'EUR',
			maximumFractionDigits: 0
		}).format(grant.amount ?? 0);
	}

	// Formatted grant figures (e.g., "€317,690", "€53,670 + €60,410") — omitted
	// when no grant on the project carries an amount.
	const grantAmount = $derived(
		ledgerGrants.length > 0 ? ledgerGrants.map(formatGrantAmount).join(' + ') : undefined
	);

	// Eyebrow tail: "· FUNDER" appended after the years when a funder is known
	// and the funding apparatus isn't being deferred to the Funding panel.
	const eyebrowFunder = $derived(showFunding && funderLabel ? funderLabel : undefined);

	// Caption under the aside plate.
	const plateCaption = $derived(figCaption ?? `Fig. 1 — ${imageAlt}`);

	/**
	 * Whether each related-items panel has anything to list. A project whose
	 * outputs are still in progress would otherwise print "No publications found
	 * for this project" under a section rule, which reads as a fault rather than
	 * as a project that hasn't published yet. Both datasets are already pulled in
	 * by the panels themselves, so testing them here costs no extra bundle.
	 */
	const hasPublications = $derived(
		allPublications.some((publication) => publication.project === projectName)
	);
	const hasCommunications = $derived(
		allCommunications.some((communication) => communication.project === projectName)
	);
</script>

<!-- Research pages were the one detail type shipping no `ogImage`, so a shared
     link fell back to the profile picture instead of the project plate; the
     absolute `canonical` also stops og:url/twitter:url reporting the site root. -->
<SEO
	title="{title} | Frédérick Madore"
	description={seoDescription}
	keywords={seoKeywords}
	canonical="{website.url}/research/{id}"
	ogImage="{website.url}/images/research/{imageSrc}"
	type="article"
/>

<JsonLd id={BREADCRUMB_SCRIPT_ID} json={breadcrumbJsonLd} />
<JsonLd id={GRANTS_SCRIPT_ID} json={grantsJsonLd} />

<div class="container py-8">
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
			<div class="project-prose">
				{@render children()}
			</div>

			{#if audioSrc}
				<section class="section podcast-section">
					<div class="section-head">
						<span class="section-no" aria-hidden="true">♪</span>
						<h2 class="section-title">Podcast discussion</h2>
					</div>
					<MediaPlayer
						src="{base}/{audioSrc}"
						type="audio"
						title="Google NotebookLM Podcast Discussion"
						surface=""
						showControls={true}
					/>
				</section>
			{/if}

			{#if hasPublications || hasCommunications}
				<div class="related-content">
					{#if hasPublications}
						<RelevantPublications {projectName} limit={6} />
					{/if}
					{#if hasCommunications}
						<div class="related-comms" class:related-comms--only={!hasPublications}>
							<RelevantCommunications {projectName} limit={6} />
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- ASIDE COLUMN ------------------------------------------------------ -->
		<aside class="project-aside" aria-label="Project details">
			<ResearchProjectAside
				plateSrc="{base}/images/research/{imageSrc}"
				plateAlt={imageAlt}
				{plateCaption}
				{years}
				{directors}
				{funderLabel}
				{programme}
				{grantAmount}
				grantStatus={ledgerGrants[0]?.status}
				grantCount={ledgerGrants.length}
				{regions}
				{sourceLanguages}
				{ctas}
				{showFunding}
			/>
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

	/* Sole panel in the block — the section rule above already supplies the gap. */
	.related-comms--only {
		margin-top: 0;
	}

	/* ==========================================================================
	 * ASIDE — the apparatus rail; contents live in ResearchProjectAside.svelte
	 * ======================================================================== */
	.project-aside {
		min-width: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.project-prose :global(a) {
			transition: none;
		}
	}
</style>
