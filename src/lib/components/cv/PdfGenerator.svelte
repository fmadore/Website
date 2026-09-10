<script lang="ts">
	/**
	 * CV PDF download button. The actual DOM-reading + jsPDF typesetting lives
	 * in $lib/utils/pdfCvGenerator (Ink + Signal print design notes there);
	 * this component only lazy-loads jsPDF and tracks the busy state.
	 */
	import Icon from '@iconify/svelte';
	import { generateCvPdf } from '$lib/utils/pdfCvGenerator';

	let isGenerating = $state(false);
	/** A failed export must say so. Previously the only report was a DEV-only
	 * console line: the button returned to rest and no file appeared, which
	 * reads exactly like a browser that blocked the download. */
	let failed = $state(false);

	async function generatePDF() {
		if (isGenerating) return;

		isGenerating = true;
		failed = false;
		try {
			// jsPDF (~126KB chunk incl. fflate) is fetched on first click, not on
			// mount — eager-loading it cost every /cv visitor the download even
			// if they never export the PDF.
			const { default: jsPDF } = await import('jspdf');
			await generateCvPdf(jsPDF);
		} catch (err) {
			failed = true;
			if (import.meta.env.DEV) console.error('PDF generation failed:', err);
		} finally {
			isGenerating = false;
		}
	}
</script>

<button
	class="btn btn-primary"
	onclick={generatePDF}
	disabled={isGenerating}
	aria-live="polite"
	aria-busy={isGenerating}
>
	{#if isGenerating}
		<Icon icon="mdi:loading" class="animate-spin" width="20" height="20" aria-hidden="true" />
		<span>Generating…</span>
	{:else if failed}
		<Icon icon="mdi:file-pdf-box" width="20" height="20" aria-hidden="true" />
		<!-- Carried by words, not by colour: DESIGN restricts --color-danger to
		     form validation, and the recovery is simply to try again. -->
		<span>Download failed. Try again.</span>
	{:else}
		<Icon icon="mdi:file-pdf-box" width="20" height="20" aria-hidden="true" />
		<span>Download PDF</span>
	{/if}
</button>

<style>
	/* Button styling is handled by the global .btn / .btn-primary classes. */
	:global(.animate-spin) {
		animation: spin var(--duration-moderate) linear infinite;
	}

	/* The register is print: the only motion on this page is the spinner that
	 * says an export is running, and it stops for a reader who asked for less. */
	@media (prefers-reduced-motion: reduce) {
		:global(.animate-spin) {
			animation: none;
		}
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
