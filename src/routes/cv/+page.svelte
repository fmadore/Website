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
	import CVInvitedTalks from './components/CVInvitedTalks.svelte';
	import CVMedia from './components/CVMedia.svelte';
	import CVLanguages from './components/CVLanguages.svelte';
	import CVService from './components/CVService.svelte';
	import CVAffiliations from './components/CVAffiliations.svelte';
	import CVFieldwork from './components/CVFieldwork.svelte';
</script>

<SEO
	title="Curriculum Vitae - Frédérick Madore"
	description="Curriculum Vitae of Frédérick Madore, detailing publications, communications, activities, and fieldwork."
/>

<!-- PDF Generator Button -->
<div class="flex justify-end mb-4 max-w-4xl mx-auto">
	<PdfGenerator />
</div>

<div id="cv-content" class="cv-container p-8 max-w-4xl mx-auto bg-default shadow-md rounded-lg">
	<CVHeader />
	<CVEducation />
	<CVAppointments />
	<CVPublications />
	<CVGrants />
	<CVAwards />
	<CVDigitalHumanities />
	<CVInvitedTalks />
	<CVConferences />
	<CVEvents />
	<CVMedia />
	<CVLanguages />
	<CVService />
	<CVAffiliations />
	<CVFieldwork />
</div>

<style>
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
		:global(.glass-panel) {
			background: var(--color-white) !important;
			backdrop-filter: none !important;
			border: none !important;
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
