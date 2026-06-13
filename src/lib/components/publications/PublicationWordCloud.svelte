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
	const showWordCloud = $derived(
		hasAnalysis(publicationId) && (analysis?.frequencies?.length ?? 0) > 0
	);
</script>

{#if showWordCloud && analysis}
	<section class="wordcloud-section glass-section-panel scroll-reveal">
		<h2 class="editorial-section-title wordcloud-title">{title}</h2>
		<div class="wordcloud-wrapper">
			<EChartsWordCloud
				words={analysis.frequencies}
				{maxWords}
				shape="circle"
				minFontSize={14}
				maxFontSize={56}
				height={350}
			/>
		</div>
		<p class="wordcloud-caption">Displaying the most frequent terms from the full text</p>
	</section>
{/if}

<style>
	/* Content-on-paper section — the word-cloud figure is the surface. */
	.wordcloud-section {
		margin-top: var(--space-xl);
	}

	/* Base treatment comes from the shared .editorial-section-title utility
	 * (typography.css); the word-cloud figure title steps one size up. */
	.wordcloud-title {
		font-size: var(--font-size-xl);
		margin-bottom: var(--space-md);
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
		.wordcloud-title {
			font-size: var(--font-size-2xl);
		}
	}
</style>
