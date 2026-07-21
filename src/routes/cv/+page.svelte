<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import SEO from '$lib/SEO.svelte';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import PdfGenerator from '$lib/components/cv/PdfGenerator.svelte';
	import CVHeader from '$lib/components/cv/CVHeader.svelte';
	import CVEducation from '$lib/components/cv/CVEducation.svelte';
	import CVAppointments from '$lib/components/cv/CVAppointments.svelte';
	import CVPublications from '$lib/components/cv/CVPublications.svelte';
	import CVTableOfContents from '$lib/components/cv/CVTableOfContents.svelte';

	import { resolve } from '$app/paths';

	// Breadcrumbs for this section
	const breadcrumbs = createSectionBreadcrumbs('CV', '/cv');

	// Lazy load components below the fold using $state
	let CVGrants: Component | undefined = $state();
	let CVAwards: Component | undefined = $state();
	let CVDigitalHumanities: Component | undefined = $state();
	let CVConferences: Component | undefined = $state();
	let CVEvents: Component | undefined = $state();
	let CVTeaching: Component | undefined = $state();
	let CVConsulting: Component | undefined = $state();
	let CVInvitedTalks: Component | undefined = $state();
	let CVMedia: Component | undefined = $state();
	let CVLanguages: Component | undefined = $state();
	let CVService: Component | undefined = $state();
	let CVAffiliations: Component | undefined = $state();
	let CVComputerSkills: Component | undefined = $state();
	let CVResearchExperience: Component | undefined = $state();

	let componentsStartedLoading = $state(false);

	onMount(() => {
		// Start loading components immediately after mount
		// This still provides performance benefits by:
		// 1. Not blocking initial page render
		// 2. Loading in batches to avoid overwhelming the browser
		// 3. Keeping the initial bundle smaller
		if (!componentsStartedLoading) {
			componentsStartedLoading = true;
			loadComponents();
		}
	});

	function loadComponents() {
		// Load components in batches to avoid overwhelming the browser
		// Batch 1: Most important sections
		setTimeout(() => {
			Promise.all([
				import('$lib/components/cv/CVGrants.svelte').then((m) => (CVGrants = m.default)),
				import('$lib/components/cv/CVAwards.svelte').then((m) => (CVAwards = m.default)),
				import('$lib/components/cv/CVDigitalHumanities.svelte').then(
					(m) => (CVDigitalHumanities = m.default)
				)
			]);
		}, 100);

		// Batch 2: Conference and talks
		setTimeout(() => {
			Promise.all([
				import('$lib/components/cv/CVInvitedTalks.svelte').then(
					(m) => (CVInvitedTalks = m.default)
				),
				import('$lib/components/cv/CVConferences.svelte').then((m) => (CVConferences = m.default)),
				import('$lib/components/cv/CVEvents.svelte').then((m) => (CVEvents = m.default))
			]);
		}, 200);

		// Batch 3: Experience sections
		setTimeout(() => {
			Promise.all([
				import('$lib/components/cv/CVTeaching.svelte').then((m) => (CVTeaching = m.default)),
				import('$lib/components/cv/CVResearchExperience.svelte').then(
					(m) => (CVResearchExperience = m.default)
				),
				import('$lib/components/cv/CVService.svelte').then((m) => (CVService = m.default))
			]);
		}, 300);

		// Batch 4: Final sections
		setTimeout(() => {
			Promise.all([
				import('$lib/components/cv/CVConsulting.svelte').then((m) => (CVConsulting = m.default)),
				import('$lib/components/cv/CVMedia.svelte').then((m) => (CVMedia = m.default)),
				import('$lib/components/cv/CVLanguages.svelte').then((m) => (CVLanguages = m.default)),
				import('$lib/components/cv/CVAffiliations.svelte').then(
					(m) => (CVAffiliations = m.default)
				),
				import('$lib/components/cv/CVComputerSkills.svelte').then(
					(m) => (CVComputerSkills = m.default)
				)
			]);
		}, 400);
	}
</script>

<SEO
	title="Curriculum Vitae - Frédérick Madore"
	description="Curriculum Vitae of Frédérick Madore, Research Fellow at ZMO, detailing publications, communications, activities, and fieldwork in West Africa."
	keywords="CV, curriculum vitae, Frédérick Madore, research fellow, publications, academic career, Islam, West Africa"
	canonical="https://www.frederickmadore.com/cv"
	{breadcrumbs}
	pageType="ProfilePage"
/>

<div id="cv-content" class="cv-container p-8 max-w-6xl mx-auto page-enter">
	<!-- Action Buttons - positioned in top right corner of CV -->
	<div class="cv-actions">
		<a href={resolve('/cv/timeline')} class="btn btn-secondary" aria-label="View Career Timeline">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M3 3v18h18" />
				<path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
			</svg>
			<span>Timeline</span>
		</a>
		<PdfGenerator />
	</div>

	<CVHeader />
	<div id="cv-appointments" class="cv-section-wrapper">
		<CVAppointments />
	</div>
	<div id="cv-education" class="cv-section-wrapper">
		<CVEducation />
	</div>
	<div id="cv-publications" class="cv-section-wrapper">
		<CVPublications />
	</div>

	<!-- Components load automatically after page mount in batches -->
	{#if CVGrants}
		<div id="cv-grants" class="cv-section-wrapper cv-lazy-section">
			<CVGrants />
		</div>
	{/if}
	{#if CVAwards}
		<div id="cv-awards" class="cv-section-wrapper cv-lazy-section">
			<CVAwards />
		</div>
	{/if}
	{#if CVDigitalHumanities}
		<div id="cv-digital-humanities" class="cv-section-wrapper cv-lazy-section">
			<CVDigitalHumanities />
		</div>
	{/if}
	{#if CVInvitedTalks}
		<div id="cv-invited-talks" class="cv-section-wrapper cv-lazy-section">
			<CVInvitedTalks />
		</div>
	{/if}
	{#if CVConferences}
		<div id="cv-conferences" class="cv-section-wrapper cv-lazy-section">
			<CVConferences />
		</div>
	{/if}
	{#if CVEvents}
		<div id="cv-events" class="cv-section-wrapper cv-lazy-section">
			<CVEvents />
		</div>
	{/if}
	{#if CVTeaching}
		<div id="cv-teaching" class="cv-section-wrapper cv-lazy-section">
			<CVTeaching />
		</div>
	{/if}
	{#if CVResearchExperience}
		<div id="cv-research-experience" class="cv-section-wrapper cv-lazy-section">
			<CVResearchExperience />
		</div>
	{/if}
	{#if CVService}
		<div id="cv-service" class="cv-section-wrapper cv-lazy-section">
			<CVService />
		</div>
	{/if}
	{#if CVConsulting}
		<div id="cv-consulting" class="cv-section-wrapper cv-lazy-section">
			<CVConsulting />
		</div>
	{/if}
	{#if CVMedia}
		<div id="cv-media" class="cv-section-wrapper cv-lazy-section">
			<CVMedia />
		</div>
	{/if}
	{#if CVLanguages}
		<div id="cv-languages" class="cv-section-wrapper cv-lazy-section">
			<CVLanguages />
		</div>
	{/if}
	{#if CVAffiliations}
		<div id="cv-affiliations" class="cv-section-wrapper cv-lazy-section">
			<CVAffiliations />
		</div>
	{/if}
	{#if CVComputerSkills}
		<div id="cv-computer-skills" class="cv-section-wrapper cv-lazy-section">
			<CVComputerSkills />
		</div>
	{/if}
</div>

<CVTableOfContents />

<style>
	/*
	 * The CV is the purest ledger on the site: a single sheet of paper, no glass,
	 * no shadows, square corners. Every section is a ruled module; every
	 * entry is a ledger row (mono year key + serif content, hairline between).
	 */
	.cv-container {
		background: var(--color-background);
		border: var(--rule-hairline) solid var(--color-border);
		border-radius: 0;
		box-shadow: none;
		position: relative;
		margin-top: var(--space-lg);
		margin-bottom: var(--space-2xl);
	}

	/* Action buttons — document chrome, tucked to the top right of the sheet
	 * like a letterhead's utility row instead of a centered button bar. */
	.cv-actions {
		display: flex;
		gap: var(--space-md);
		align-items: center;
		justify-content: flex-start;
		margin-bottom: var(--space-md);
		position: relative;
		z-index: 10;
		flex-wrap: wrap;
		padding-bottom: var(--space-2);
	}

	@media (--md) {
		.cv-actions {
			justify-content: flex-end;
			margin-bottom: 0;
		}
	}

	/* Scroll offset for anchor navigation past sticky header */
	:global(.cv-section-wrapper[id]) {
		scroll-margin-top: calc(var(--space-16) + var(--space-4));
	}

	/* Each section module — a section-rule (3px ink) across the top,
	 * generous air above, like the .section idiom used site-wide. The <section>
	 * inside carries the rule so the header's contact <section> (which lives
	 * outside a .cv-section-wrapper) stays un-ruled. */
	:global(.cv-section-wrapper) {
		margin-bottom: 0;
	}

	:global(.cv-section-wrapper > section) {
		border-top: var(--rule-section) solid var(--color-primary);
		padding-top: var(--space-sm);
		margin-top: var(--space-2xl);
		margin-bottom: 0;
	}

	/*
	 * Section heading — DOCUMENT voice (Archivo display).
	 */
	:global(#cv-content h3) {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display-sm);
		font-size: var(--font-size-2xl);
		font-weight: 750;
		letter-spacing: -0.01em;
		line-height: 1.05;
		color: var(--color-text-emphasis);
		margin: 0 0 var(--space-md);
		padding-bottom: 0;
		border-bottom: none;
	}

	/* Subsection labels (BOOKS, ARTICLES, INSTRUCTOR…) — DATA voice: small mono
	 * uppercase, letterspaced, quiet ink, over a hairline. */
	:global(#cv-content h4) {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin: var(--space-lg) 0 var(--space-1);
		padding-bottom: var(--space-1-5);
		border-bottom: var(--rule-hairline) solid var(--color-border-light);
	}

	/* Empty-state note. */
	:global(#cv-content .cv-empty) {
		font-family: var(--font-family-serif);
		font-style: italic;
		color: var(--color-text-light);
	}

	/* Ledger rows are contiguous — the hairline is drawn by each row's border-top,
	 * so cancel the .space-y-3 inter-row margin that would otherwise gap them. */
	:global(#cv-content .ledger.space-y-3 > * + *) {
		margin-top: 0;
	}

	/* Non-ledger stacked content keeps a small rhythm. */
	:global(#cv-content .space-y-3:not(.ledger) > * + *) {
		margin-top: var(--space-2);
	}

	/* Close each ledger with a hairline under its final CVEntry row. */
	:global(#cv-content .ledger > :last-child .cv-entry) {
		border-bottom: var(--rule-hairline) solid var(--color-border-light);
	}

	/* Year keys inside the fixed-width bare rows (older markup path). */
	:global(#cv-content .font-semibold.text-nowrap) {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		letter-spacing: 0.04em;
		color: var(--color-text-light);
		font-weight: var(--font-weight-medium);
	}

	/* Links — accent, underline on hover only (the single hover this page needs). */
	:global(#cv-content a) {
		color: var(--color-accent);
		text-decoration: none;
		transition: color var(--duration-fast) ease;
	}

	:global(#cv-content a:hover) {
		color: var(--color-accent-dark);
		text-decoration: underline;
	}

	:global(#cv-content a:focus-visible) {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--border-width-thin);
	}

	:global(#cv-content a.review-link) {
		font-style: italic;
		text-decoration: none;
	}

	:global(#cv-content a.review-link:hover) {
		text-decoration: underline;
	}

	/* Print styles */
	@media print {
		/* Hide the PDF button when printing */
		:global(.pdf-generator-wrapper),
		:global(button[onclick*='print']) {
			display: none !important;
		}

		/* Disable animations for print */
		.cv-container,
		:global(.cv-section-wrapper),
		:global(.cv-lazy-section) {
			animation: none !important;
			opacity: 1 !important;
			transform: none !important;
		}

		/* Optimize for print — flat sheet, no border, ledger rules preserved. */
		.cv-container {
			max-width: 100% !important;
			padding: var(--space-10) !important;
			margin: 0 !important;
			box-shadow: none !important;
			border-radius: 0 !important;
			border: none !important;
			background: var(--color-white) !important;
		}

		/* Flatten surface tiles onto plain print paper */
		:global(.surface),
		:global(.surface-card),
		:global(.surface-panel),
		:global(.cv-section-wrapper) {
			background: var(--color-white) !important;
			backdrop-filter: none !important;
			box-shadow: none !important;
		}

		/* Keep the ledger's ink rules in print: section rule + row hairlines. */
		:global(.cv-section-wrapper > section) {
			border-top: var(--rule-section) solid var(--color-primary) !important;
		}

		:global(#cv-content .cv-entry) {
			border-top: var(--rule-hairline) solid var(--color-border) !important;
		}

		:global(#cv-content h4) {
			border-bottom: var(--rule-hairline) solid var(--color-border) !important;
		}

		/* Remove hover effects and transitions */
		:global(.cv-section-wrapper:hover) {
			background: var(--color-white) !important;
			transform: none !important;
			box-shadow: none !important;
		}

		/* Ensure good contrast */
		:global(body) {
			background: var(--color-white) !important;
			color: var(--color-black) !important;
		}

		/* Page breaks */
		:global(#cv-content section) {
			page-break-inside: avoid;
		}

		:global(#cv-content h3) {
			page-break-after: avoid;
		}

		/* Links — ink underline in print (accent reads muddy on paper). */
		:global(#cv-content a) {
			color: var(--color-primary) !important;
			text-decoration: underline !important;
		}

		/* Show URLs after external links for print (academic CV best practice) */
		:global(#cv-content a[href^='http']:not(.doi-link))::after {
			content: ' (' attr(href) ')';
			font-size: 0.75em;
			font-weight: normal;
			color: var(--color-text-light);
			word-break: break-all;
		}

		/* DOI links - show cleaner format */
		:global(#cv-content a.doi-link)::after {
			content: ' (https://doi.org/' attr(href) ')';
			font-size: 0.75em;
			font-weight: normal;
			color: var(--color-text-light);
		}

		/* Hide action buttons in print */
		.cv-actions {
			display: none !important;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.cv-container,
		:global(.cv-section-wrapper),
		:global(.cv-lazy-section) {
			animation: none !important;
			transition: none !important;
			opacity: 1 !important;
			transform: none !important;
		}
	}
</style>
