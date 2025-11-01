<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import PdfGenerator from '$lib/components/cv/PdfGenerator.svelte';
	import CVHeader from './components/CVHeader.svelte';
	import CVEducation from './components/CVEducation.svelte';
	import CVAppointments from './components/CVAppointments.svelte';
	import CVPublications from './components/CVPublications.svelte';
	import CVGrants from './components/CVGrants.svelte';
	import CVAwards from './components/CVAwards.svelte';
	import CVDigitalHumanities from './components/CVDigitalHumanities.svelte';
	import CVConferences from './components/CVConferences.svelte';
	import CVEvents from './components/CVEvents.svelte';
	import CVTeaching from './components/CVTeaching.svelte';
	import CVConsulting from './components/CVConsulting.svelte';
	import CVInvitedTalks from './components/CVInvitedTalks.svelte';
	import CVMedia from './components/CVMedia.svelte';
	import CVLanguages from './components/CVLanguages.svelte';
	import CVService from './components/CVService.svelte';
	import CVAffiliations from './components/CVAffiliations.svelte';
	import CVComputerSkills from './components/CVComputerSkills.svelte';
	import CVResearchExperience from './components/CVResearchExperience.svelte';
</script>

<SEO
	title="Curriculum Vitae - Frédérick Madore"
	description="Curriculum Vitae of Frédérick Madore, detailing publications, communications, activities, and fieldwork."
/>

<!-- PDF Generator Button -->
<div class="flex justify-end mb-4 max-w-4xl mx-auto">
	<PdfGenerator />
</div>

<div id="cv-content" class="cv-container glass-card p-8 max-w-4xl mx-auto rounded-lg">
	<CVHeader />
	<div class="cv-section-wrapper">
		<CVEducation />
	</div>
	<div class="cv-section-wrapper">
		<CVAppointments />
	</div>
	<div class="cv-section-wrapper">
		<CVPublications />
	</div>
	<div class="cv-section-wrapper">
		<CVGrants />
	</div>
	<div class="cv-section-wrapper">
		<CVAwards />
	</div>
	<div class="cv-section-wrapper">
		<CVDigitalHumanities />
	</div>
	<div class="cv-section-wrapper">
		<CVInvitedTalks />
	</div>
	<div class="cv-section-wrapper">
		<CVConferences />
	</div>
	<div class="cv-section-wrapper">
		<CVEvents />
	</div>
	<div class="cv-section-wrapper">
		<CVTeaching />
	</div>
	<div class="cv-section-wrapper">
		<CVResearchExperience />
	</div>
	<div class="cv-section-wrapper">
		<CVService />
	</div>
	<div class="cv-section-wrapper">
		<CVConsulting />
	</div>
	<div class="cv-section-wrapper">
		<CVMedia />
	</div>
	<div class="cv-section-wrapper">
		<CVLanguages />
	</div>
	<div class="cv-section-wrapper">
		<CVAffiliations />
	</div>
	<div class="cv-section-wrapper">
		<CVComputerSkills />
	</div>
</div>

<style>
	/* Main CV container */
	.cv-container {
		box-shadow: var(--shadow-lg);
		transition: box-shadow var(--transition-duration-200) ease;
	}

	/* CV section wrappers with subtle glass effect */
	:global(.cv-section-wrapper) {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.02) 0%,
			rgba(var(--color-highlight-rgb), 0.01) 100%
		);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-4);
		margin-bottom: var(--spacing-4);
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: all var(--transition-duration-200) ease;
	}

	/* Remove bottom margin from sections inside wrappers */
	:global(.cv-section-wrapper > section) {
		margin-bottom: 0;
	}

	:global(.cv-section-wrapper:hover) {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.04) 0%,
			rgba(var(--color-highlight-rgb), 0.02) 100%
		);
		border-color: rgba(var(--color-primary-rgb), 0.2);
		box-shadow: var(--shadow-sm);
	}

	/* Enhanced section headings */
	:global(#cv-content h3) {
		color: var(--color-primary);
		border-color: rgba(var(--color-primary-rgb), 0.3);
		padding-bottom: var(--spacing-2);
		margin-bottom: var(--spacing-3);
		position: relative;
	}

	:global(#cv-content h3::after) {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 3rem;
		height: 2px;
		background: var(--color-accent);
		border-radius: var(--border-radius-full);
	}

	/* Subsection headings */
	:global(#cv-content h4) {
		color: var(--color-text-emphasis);
		margin-top: var(--spacing-4);
		margin-bottom: var(--spacing-2);
	}

	/* Entry items with hover effect */
	:global(#cv-content .space-y-3 > div) {
		padding: var(--spacing-2);
		border-radius: var(--border-radius-md);
		transition: all var(--transition-duration-150) ease;
	}

	:global(#cv-content .space-y-3 > div:hover) {
		background: rgba(var(--color-primary-rgb), 0.03);
		transform: translateX(4px);
	}

	/* Year labels with accent styling */
	:global(#cv-content .font-semibold.text-nowrap) {
		color: var(--color-primary);
		font-weight: var(--font-weight-semibold);
	}

	/* Reduce spacing between items in lists - override space-y-3 utility */
	:global(.space-y-3 > * + *) {
		margin-top: var(--spacing-2) !important;
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
		:global(button[onclick*="print"]) {
			display: none !important;
		}

		/* Optimize for print */
		.cv-container {
			max-width: 100% !important;
			padding: 0.5in !important;
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

		/* Remove unnecessary spacing */
		.mb-4 {
			margin-bottom: var(--spacing-2) !important;
		}
	}
</style>
