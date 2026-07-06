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
	<section class="wordcloud-section section scroll-reveal">
		<div class="section-head">
			<span class="section-no">№</span>
			<h2 class="section-title">{title}</h2>
		</div>
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
		<p class="wordcloud-caption">Most frequent terms from the full text</p>
	</section>
{/if}

<style>
	/* №-numbered section (3px top rule) supplied by the .section idiom —
	 * the word-cloud figure is the surface. */
	.wordcloud-section {
		margin-top: var(--space-xl);
	}

	.wordcloud-wrapper {
		margin: var(--space-md) 0;
	}

	/* Caption — data voice: mono caps stamp beneath the figure. */
	.wordcloud-caption {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-light);
		text-align: center;
		margin-top: var(--space-sm);
	}
</style>
