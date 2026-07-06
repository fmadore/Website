<script lang="ts">
	let {
		abstract = undefined,
		sectionClass = 'abstract-section',
		titleClass = 'abstract-title',
		titleText = 'Abstract',
		contentClass = 'abstract-content'
	}: {
		abstract?: string | undefined | null;
		sectionClass?: string;
		titleClass?: string;
		titleText?: string;
		contentClass?: string;
	} = $props();

	// Function to split abstract into paragraphs
	function formatAbstractParagraphs(text: string): string[] {
		if (!text) return [];

		// Split by double line breaks or single line breaks, then filter out empty strings
		return text
			.split(/\n\s*\n|\n/)
			.map((p) => p.trim())
			.filter((p) => p.length > 0);
	}

	// Get formatted paragraphs
	const paragraphs = $derived(abstract ? formatAbstractParagraphs(abstract) : []);
</script>

{#if abstract && paragraphs.length > 0}
	<section class="{sectionClass} scroll-reveal">
		<div class="abstract-head">
			<span class="section-no" aria-hidden="true">§</span>
			<h2 class={titleClass}>{titleText}</h2>
		</div>
		<div class={contentClass}>
			{#each paragraphs as paragraph, index (index)}
				<p
					class="abstract-paragraph"
					class:drop-cap={index === 0}
					class:mb-4={index < paragraphs.length - 1}
				>
					{paragraph}
				</p>
			{/each}
		</div>
	</section>
{/if}

<style>
	/* Content-on-paper: the section shell carries no tile padding; the section
	 * rule and the page's spacing do the separating. */
	.abstract-section {
		margin-bottom: var(--space-xl);
	}

	/* Section head — the DATA-voice § marker sitting inline before a DOCUMENT-
	 * voice display title, over a 3px section rule (no box, no hairline tile). */
	.abstract-head {
		display: flex;
		align-items: baseline;
		gap: var(--space-sm);
		border-top: var(--rule-section) solid var(--color-primary);
		padding-top: var(--space-sm);
		margin-bottom: var(--space-lg);
	}

	.abstract-head .section-no {
		font-size: var(--font-size-base);
	}

	/* Abstract title — Archivo display, the scholar's heading voice. */
	.abstract-title {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display-sm);
		font-size: var(--font-size-2xl);
		font-weight: 750;
		letter-spacing: -0.01em;
		color: var(--color-text-emphasis);
		margin: 0;
		line-height: 1.05;
	}

	/* A book-setting measure: cap the column near 66ch and let it rag right.
	 * Justified + hyphenated full-width lines run past 100 characters and open
	 * rivers; an even left-aligned colour at a controlled measure reads better. */
	.abstract-content {
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
		max-width: 66ch;
		text-align: left;
		hyphens: none;
	}

	.abstract-paragraph {
		margin-bottom: 0;
	}

	.abstract-paragraph.mb-4 {
		margin-bottom: var(--space-md);
	}

	/* Responsive adjustments */
	@media (--sm-down) {
		.abstract-title {
			font-size: var(--font-size-xl);
		}

		/* Keep abstract content at base font size for better mobile readability */
		.abstract-content {
			font-size: var(--font-size-base);
			text-align: left; /* Left-align on mobile for better readability */
			hyphens: none; /* Disable hyphenation on mobile */
		}
	}
</style>
