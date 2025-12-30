<script lang="ts">
	import { onMount } from 'svelte';
	import SEO from '$lib/SEO.svelte';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import PdfGenerator from '$lib/components/cv/PdfGenerator.svelte';
	import CVHeader from './components/CVHeader.svelte';
	import CVEducation from './components/CVEducation.svelte';
	import CVAppointments from './components/CVAppointments.svelte';
	import CVPublications from './components/CVPublications.svelte';

	// Breadcrumbs for this section
	const breadcrumbs = createSectionBreadcrumbs('CV', '/cv');

	// Lazy load components below the fold using $state
	let CVGrants = $state<any>();
	let CVAwards = $state<any>();
	let CVDigitalHumanities = $state<any>();
	let CVConferences = $state<any>();
	let CVEvents = $state<any>();
	let CVTeaching = $state<any>();
	let CVConsulting = $state<any>();
	let CVInvitedTalks = $state<any>();
	let CVMedia = $state<any>();
	let CVLanguages = $state<any>();
	let CVService = $state<any>();
	let CVAffiliations = $state<any>();
	let CVComputerSkills = $state<any>();
	let CVResearchExperience = $state<any>();

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
				import('./components/CVGrants.svelte').then((m) => (CVGrants = m.default)),
				import('./components/CVAwards.svelte').then((m) => (CVAwards = m.default)),
				import('./components/CVDigitalHumanities.svelte').then(
					(m) => (CVDigitalHumanities = m.default)
				)
			]);
		}, 100);

		// Batch 2: Conference and talks
		setTimeout(() => {
			Promise.all([
				import('./components/CVInvitedTalks.svelte').then((m) => (CVInvitedTalks = m.default)),
				import('./components/CVConferences.svelte').then((m) => (CVConferences = m.default)),
				import('./components/CVEvents.svelte').then((m) => (CVEvents = m.default))
			]);
		}, 200);

		// Batch 3: Experience sections
		setTimeout(() => {
			Promise.all([
				import('./components/CVTeaching.svelte').then((m) => (CVTeaching = m.default)),
				import('./components/CVResearchExperience.svelte').then(
					(m) => (CVResearchExperience = m.default)
				),
				import('./components/CVService.svelte').then((m) => (CVService = m.default))
			]);
		}, 300);

		// Batch 4: Final sections
		setTimeout(() => {
			Promise.all([
				import('./components/CVConsulting.svelte').then((m) => (CVConsulting = m.default)),
				import('./components/CVMedia.svelte').then((m) => (CVMedia = m.default)),
				import('./components/CVLanguages.svelte').then((m) => (CVLanguages = m.default)),
				import('./components/CVAffiliations.svelte').then((m) => (CVAffiliations = m.default)),
				import('./components/CVComputerSkills.svelte').then((m) => (CVComputerSkills = m.default))
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

<div id="cv-content" class="cv-container glass-card p-8 max-w-4xl mx-auto rounded-lg page-enter">
	<!-- PDF Generator Button - positioned in top right corner of CV -->
	<div class="cv-download-button">
		<PdfGenerator />
	</div>

	<CVHeader />
	<div class="cv-section-wrapper scroll-reveal">
		<CVEducation />
	</div>
	<div class="cv-section-wrapper scroll-reveal">
		<CVAppointments />
	</div>
	<div class="cv-section-wrapper scroll-reveal">
		<CVPublications />
	</div>

	<!-- Components load automatically after page mount in batches -->
	{#if CVGrants}
		<div class="cv-section-wrapper cv-lazy-section fade-in-up">
			<CVGrants />
		</div>
	{/if}
	{#if CVAwards}
		<div class="cv-section-wrapper cv-lazy-section fade-in-up stagger-1">
			<CVAwards />
		</div>
	{/if}
	{#if CVDigitalHumanities}
		<div class="cv-section-wrapper cv-lazy-section fade-in-up stagger-2">
			<CVDigitalHumanities />
		</div>
	{/if}
	{#if CVInvitedTalks}
		<div class="cv-section-wrapper cv-lazy-section fade-in-up">
			<CVInvitedTalks />
		</div>
	{/if}
	{#if CVConferences}
		<div class="cv-section-wrapper cv-lazy-section fade-in-up stagger-1">
			<CVConferences />
		</div>
	{/if}
	{#if CVEvents}
		<div class="cv-section-wrapper cv-lazy-section fade-in-up stagger-2">
			<CVEvents />
		</div>
	{/if}
	{#if CVTeaching}
		<div class="cv-section-wrapper cv-lazy-section fade-in-up">
			<CVTeaching />
		</div>
	{/if}
	{#if CVResearchExperience}
		<div class="cv-section-wrapper cv-lazy-section fade-in-up stagger-1">
			<CVResearchExperience />
		</div>
	{/if}
	{#if CVService}
		<div class="cv-section-wrapper cv-lazy-section fade-in-up stagger-2">
			<CVService />
		</div>
	{/if}
	{#if CVConsulting}
		<div class="cv-section-wrapper cv-lazy-section fade-in-up">
			<CVConsulting />
		</div>
	{/if}
	{#if CVMedia}
		<div class="cv-section-wrapper cv-lazy-section fade-in-up stagger-1">
			<CVMedia />
		</div>
	{/if}
	{#if CVLanguages}
		<div class="cv-section-wrapper cv-lazy-section fade-in-up stagger-2">
			<CVLanguages />
		</div>
	{/if}
	{#if CVAffiliations}
		<div class="cv-section-wrapper cv-lazy-section fade-in-up">
			<CVAffiliations />
		</div>
	{/if}
	{#if CVComputerSkills}
		<div class="cv-section-wrapper cv-lazy-section fade-in-up stagger-1">
			<CVComputerSkills />
		</div>
	{/if}
</div>

<style>
	/* Main CV container */
	.cv-container {
		box-shadow: var(--shadow-lg);
		transition: box-shadow var(--transition-duration-200) ease;
		position: relative;
		margin-top: var(--space-lg);
		margin-bottom: var(--space-lg);
	}

	/* PDF Download button positioning - inside the CV container top-right */
	.cv-download-button {
		position: absolute;
		top: var(--space-md);
		right: var(--space-md);
		z-index: 10;
	}

	/* On tablets, move button below title area */
	@media (max-width: 900px) {
		.cv-download-button {
			position: static;
			float: right;
			margin-bottom: var(--space-md);
			margin-left: var(--space-md);
		}
	}

	/* On mobile, full width button */
	@media (max-width: 639px) {
		.cv-download-button {
			float: none;
			margin-left: 0;
			margin-bottom: var(--space-lg);
			display: flex;
			justify-content: center;
		}
	}

	/* CV section wrappers with subtle glass effect */
	:global(.cv-section-wrapper) {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 2%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 1%, transparent) 100%
		);
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		border-radius: var(--border-radius-lg);
		padding: var(--space-4);
		margin-bottom: var(--space-4);
		border: var(--border-width-thin) solid color-mix(in srgb, var(--color-white) 10%, transparent);
		transition: all var(--transition-duration-200) ease;
	}

	/* Remove bottom margin from sections inside wrappers */
	:global(.cv-section-wrapper > section) {
		margin-bottom: 0;
	}

	:global(.cv-section-wrapper:hover) {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 4%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 2%, transparent) 100%
		);
		border-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
		box-shadow: var(--shadow-sm);
	}

	/* Enhanced section headings */
	:global(#cv-content h3) {
		color: var(--color-primary);
		border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
		padding-bottom: var(--space-2);
		margin-bottom: var(--space-3);
		position: relative;
	}

	:global(#cv-content h3::after) {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: var(--space-12);
		height: var(--border-width-medium);
		background: var(--color-accent);
		border-radius: var(--border-radius-full);
	}

	/* Subsection headings */
	:global(#cv-content h4) {
		color: var(--color-text-emphasis);
		margin-top: var(--space-4);
		margin-bottom: var(--space-2);
	}

	/* Entry items with base styling */
	:global(#cv-content .space-y-3 > div) {
		padding: var(--space-2);
		border-radius: var(--border-radius-md);
		transition: all var(--transition-duration-150) ease;
	}

	/* Hover effects only for devices with hover capability (not touch) */
	@media (--can-hover) {
		:global(#cv-content .space-y-3 > div:hover) {
			background: color-mix(in srgb, var(--color-primary) 3%, transparent);
			transform: translateX(var(--space-1));
		}
	}

	/* Year labels with accent styling */
	:global(#cv-content .font-semibold.text-nowrap) {
		color: var(--color-primary);
		font-weight: var(--font-weight-semibold);
	}

	/* Reduce spacing between items in lists - override space-y-3 utility */
	:global(.space-y-3 > * + *) {
		margin-top: var(--space-2) !important;
	}

	/* Links styling */
	:global(#cv-content a) {
		color: var(--color-primary);
		transition: all var(--transition-duration-150) ease;
	}

	:global(#cv-content a:hover) {
		color: var(--color-accent);
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

		/* Optimize for print */
		.cv-container {
			max-width: 100% !important;
			padding: var(--space-10) !important;
			margin: 0 !important;
			box-shadow: none !important;
			border-radius: 0 !important;
			background: var(--color-white) !important;
		}

		/* Remove glassmorphism effects */
		:global(.glass),
		:global(.glass-card),
		:global(.glass-panel),
		:global(.cv-section-wrapper) {
			background: var(--color-white) !important;
			backdrop-filter: none !important;
			border: none !important;
			box-shadow: none !important;
		}

		/* Remove hover effects and transitions */
		:global(#cv-content .space-y-3 > div:hover),
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

		/* Links */
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

		/* Hide download button in print */
		.cv-download-button {
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

		:global(#cv-content .space-y-3 > div:hover) {
			transform: none;
		}
	}
</style>
