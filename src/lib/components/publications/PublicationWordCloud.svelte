<!--
Word Cloud section for publication detail pages.
Only renders if text analysis data is available for this publication.
-->
<script lang="ts">
	import { getAnalysis, hasAnalysis } from '$lib/data/analysis';
	import EChartsWordCloud from '$lib/components/visualisations/EChartsWordCloud.svelte';

	interface Props {
		publicationId: string;
		title?: string;
		maxWords?: number;
	}

	let { publicationId, title = 'Key Terms', maxWords = 80 }: Props = $props();

	const analysis = $derived(getAnalysis(publicationId));
	const showWordCloud = $derived(hasAnalysis(publicationId) && (analysis?.frequencies?.length ?? 0) > 0);
</script>

{#if showWordCloud && analysis}
	<section class="wordcloud-section scroll-reveal">
		<h2 class="section-title">{title}</h2>
		<div class="wordcloud-wrapper">
			<EChartsWordCloud
				words={analysis.frequencies}
				{maxWords}
				shape="circle"
				minFontSize={14}
				maxFontSize={56}
			/>
		</div>
		<p class="wordcloud-caption">
			Displaying the most frequent terms from the full text
		</p>
	</section>
{/if}

<style>
	.wordcloud-section {
		padding: var(--space-lg);
		border-radius: var(--border-radius-xl);
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-very-low) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-very-low) * 100%), transparent)
				50%,
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-very-low) * 100%), transparent)
				100%
		);
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-low) * 100%), transparent);
		box-shadow: var(--shadow-md);
		transition:
			transform var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out),
			background var(--duration-normal) var(--ease-out);
	}

	.wordcloud-section:hover {
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-lg);
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-low) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-very-low) * 100%), transparent)
				50%,
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-very-low) * 100%), transparent)
				100%
		);
	}

	.section-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--space-md);
		line-height: var(--line-height-tight);
		position: relative;
	}

	.section-title::after {
		content: '';
		position: absolute;
		bottom: calc(-1 * var(--space-xs));
		left: 0;
		width: var(--space-3xl);
		height: var(--border-width-medium);
		background: linear-gradient(
			90deg,
			var(--color-accent) 0%,
			color-mix(in srgb, var(--color-accent) 30%, transparent) 100%
		);
		border-radius: var(--border-radius-full);
		transition: width var(--duration-normal) var(--ease-out);
	}

	.wordcloud-section:hover .section-title::after {
		width: var(--space-5xl);
	}

	.wordcloud-wrapper {
		margin: var(--space-md) 0;
	}

	.wordcloud-caption {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		text-align: center;
		font-style: italic;
		margin-top: var(--space-sm);
	}

	/* Dark mode */
	:global(html.dark) .wordcloud-section {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-accent) 8%, transparent) 0%,
			color-mix(in srgb, var(--color-primary) 4%, transparent) 50%,
			color-mix(in srgb, var(--color-highlight) 6%, transparent) 100%
		);
		border-color: color-mix(
			in srgb,
			var(--color-accent) calc(var(--opacity-medium) * 100%),
			transparent
		);
	}

	:global(html.dark) .wordcloud-section:hover {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-accent) 12%, transparent) 0%,
			color-mix(in srgb, var(--color-primary) 6%, transparent) 50%,
			color-mix(in srgb, var(--color-highlight) 8%, transparent) 100%
		);
	}

	/* Responsive */
	@media (--sm) {
		.wordcloud-section {
			padding: var(--space-xl);
		}

		.section-title {
			font-size: var(--font-size-2xl);
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.wordcloud-section,
		.wordcloud-section:hover,
		.section-title::after {
			transition: none;
			transform: none;
		}
	}
</style>
