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
	<section class="wordcloud-section glass-section-panel scroll-reveal">
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
		--_gsp-c1: var(--color-accent);
		--_gsp-c2: var(--color-primary);
		--_gsp-c3: var(--color-highlight);
		padding: var(--space-lg);
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
		.section-title::after {
			transition: none;
		}
	}
</style>
