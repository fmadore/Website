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
	<section class={sectionClass}>
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
		border-radius: var(--border-radius-xl);
		position: relative;

		/* Sophisticated glassmorphism effect matching design system */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		backdrop-filter: blur(var(--glass-blur-amount));
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-low));
		box-shadow: var(--shadow-md);
		transition:
			transform var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out),
			background var(--duration-normal) var(--ease-out);
	}

	.abstract-section:hover {
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-lg);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
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
			rgba(var(--color-highlight-rgb), 0.3) 100%
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

	/* Dark mode refinements */
	:global(html.dark) .abstract-section {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-highlight-rgb), 0.04) 50%,
			rgba(var(--color-accent-rgb), 0.06) 100%
		);
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium));
	}

	:global(html.dark) .abstract-section:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.12) 0%,
			rgba(var(--color-highlight-rgb), 0.06) 50%,
			rgba(var(--color-accent-rgb), 0.08) 100%
		);
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.abstract-section {
			padding: var(--space-md);
		}

		.abstract-title {
			font-size: var(--font-size-lg);
		}

		.abstract-content {
			font-size: var(--font-size-sm);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.abstract-section,
		.abstract-section:hover,
		.abstract-title::after {
			transition: none;
			transform: none;
		}
	}
</style>
