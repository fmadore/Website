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
	<section class="{sectionClass} glass-section-panel scroll-reveal">
		<h2 class={titleClass}>{titleText}</h2>
		<div class={contentClass}>
			{#each paragraphs as paragraph, index (index)}
				<p class="abstract-paragraph" class:mb-4={index < paragraphs.length - 1}>
					{paragraph}
				</p>
			{/each}
		</div>
	</section>
{/if}

<style>
	.abstract-section {
		margin-bottom: var(--space-xl);
		padding: var(--space-lg);
	}

	.abstract-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--space-lg);
		line-height: var(--line-height-tight);
		position: relative;
	}

	/* Elegant accent line under title */
	.abstract-title::after {
		content: '';
		position: absolute;
		bottom: calc(-1 * var(--space-sm));
		left: 0;
		width: var(--space-3xl);
		height: var(--border-width-medium);
		background: linear-gradient(
			90deg,
			var(--color-highlight) 0%,
			color-mix(in srgb, var(--color-highlight) 30%, transparent) 100%
		);
		border-radius: var(--border-radius-full);
		transition: width var(--duration-normal) var(--ease-out);
	}

	.abstract-section:hover .abstract-title::after {
		width: var(--space-5xl);
	}

	.abstract-content {
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
		text-align: justify;
		hyphens: auto;
	}

	.abstract-paragraph {
		margin-bottom: 0;
	}

	.abstract-paragraph.mb-4 {
		margin-bottom: var(--space-md);
	}

	/* Responsive adjustments */
	@media (--sm-down) {
		.abstract-section {
			padding: var(--space-md);
		}

		.abstract-title {
			font-size: var(--font-size-lg);
		}

		/* Keep abstract content at base font size for better mobile readability */
		.abstract-content {
			font-size: var(--font-size-base);
			text-align: left; /* Left-align on mobile for better readability */
			hyphens: none; /* Disable hyphenation on mobile */
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.abstract-title::after {
			transition: none;
		}
	}
</style>
