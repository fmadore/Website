<script lang="ts">
	/**
	 * CV PDF download button. The actual DOM-reading + jsPDF typesetting lives
	 * in $lib/utils/pdfCvGenerator (Ink + Signal print design notes there);
	 * this component only lazy-loads jsPDF and tracks the busy state.
	 */
	import Icon from '@iconify/svelte';
	import { generateCvPdf } from '$lib/utils/pdfCvGenerator';

	let isGenerating = $state(false);

	async function generatePDF() {
		if (isGenerating) return;

		isGenerating = true;
		try {
			// jsPDF (~126KB chunk incl. fflate) is fetched on first click, not on
			// mount — eager-loading it cost every /cv visitor the download even
			// if they never export the PDF.
			const { default: jsPDF } = await import('jspdf');
			await generateCvPdf(jsPDF);
		} catch (err) {
			if (import.meta.env.DEV) console.error('PDF generation failed:', err);
		} finally {
			isGenerating = false;
		}
	}
</script>

<button class="btn btn-primary" onclick={generatePDF} disabled={isGenerating}>
	{#if isGenerating}
		<Icon icon="mdi:loading" class="animate-spin" width="20" height="20" />
		<span>Generating...</span>
	{:else}
		<Icon icon="mdi:file-pdf-box" width="20" height="20" />
		<span>Download PDF</span>
	{/if}
</button>

<style>
	/* Button styling is handled by the global .btn / .btn-primary classes. */
	:global(.animate-spin) {
		animation: spin var(--duration-moderate) linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
