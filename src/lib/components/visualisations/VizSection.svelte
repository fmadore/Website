<!--
VizSection — the ruled-section scaffold shared by the two visualisation
pages (publications, conference activity). Renders the Archivo section
heading with an optional parenthetical count (the data voice's corpus
count), an optional serif description, then whatever the page puts inside
(NetworkControls, LanguageToggle, VizChartCard, …).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		count = '',
		description = '',
		last = false,
		children
	}: {
		title: string;
		/** Parenthetical suffix after the title, e.g. "12 unique keywords". Hidden when empty. */
		count?: string;
		/** Serif standfirst under the heading. Hidden when empty. */
		description?: string;
		/** Set on the page's final section to drop the bottom margin. */
		last?: boolean;
		children?: Snippet;
	} = $props();
</script>

<section class="visualization-section scroll-reveal" class:mb-12={!last}>
	<h2 class="section-heading">
		{title}
		{#if count}({count}){/if}
	</h2>
	{#if description}
		<p class="section-description">{description}</p>
	{/if}
	{@render children?.()}
</section>

<style>
	/*
	 * Section heading — sans by default (serif discipline applied globally).
	 * The display-tier h2 still feels editorial because of the major-third
	 * type scale; removing the serif also aligns it with the rest of the
	 * site's section chrome.
	 */
	.section-heading {
		font-size: var(--font-size-heading-3);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--space-lg);
		line-height: var(--line-height-heading);
	}

	/* Section description text — editorial serif (Newsreader). */
	.section-description {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		color: var(--color-text-soft);
		margin-top: calc(-1 * var(--space-sm));
		margin-bottom: var(--space-md);
		line-height: var(--line-height-relaxed);
	}

	@media (--md-down) {
		.section-heading {
			font-size: var(--font-size-heading-4);
			margin-bottom: var(--space-md);
		}
	}

	@media (--sm-down) {
		.section-heading {
			font-size: var(--font-size-heading-5);
		}
	}
</style>
