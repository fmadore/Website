<!--
VizSection — the ruled-section scaffold shared by the two visualisation
pages (publications, conference activity). Renders the Archivo section
heading with an optional parenthetical count (the data voice's corpus
count), an optional serif description, then the chart.

Both pages were repeating the same ten-line unit twenty-odd times:

    <VizSection title=… count=…>
      <VizChartCard variant=… height=… hasData={xs.length > 0}>
        <SomeChart … />
        {#snippet placeholder()}
          <p class="text-light">No … data available for this visualisation.</p>
        {/snippet}
      </VizChartCard>
    </VizSection>

so the card and its placeholder now live here. Passing `hasData` opts into
the card; the message is a plain `empty` string, with the `placeholder`
snippet kept as the escape hatch for the few that interpolate state.

Sections that need their own structure (the paginated cited-authors chart)
omit `hasData` and get their children rendered raw, exactly as before — they
can still compose `VizChartCard` themselves.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import VizChartCard from './VizChartCard.svelte';

	type Variant =
		'stacked' | 'network' | 'arc' | 'matrix' | 'bubble' | 'treemap' | 'gantt' | 'map' | 'bigrams';

	let {
		title,
		count = '',
		description = '',
		last = false,
		variant,
		height,
		placeholderHeight,
		hasData = undefined,
		empty = '',
		controls,
		// Aliased: the local `{#snippet placeholder()}` below would shadow it.
		placeholder: placeholderSnippet,
		children
	}: {
		title: string;
		/** Parenthetical suffix after the title, e.g. "12 unique keywords". Hidden when empty. */
		count?: string;
		/** Serif standfirst under the heading. Hidden when empty. */
		description?: string;
		/** Set on the page's final section to drop the bottom margin. */
		last?: boolean;
		/** Card sizing preset. Ignored unless `hasData` is set. */
		variant?: Variant;
		/** CSS height applied when `hasData` is true (e.g. "450px"). */
		height?: string;
		/** CSS height applied when `hasData` is false. Defaults to `height`. */
		placeholderHeight?: string;
		/**
		 * Whether there is data to chart. Providing it wraps `children` in a
		 * VizChartCard; omitting it renders them raw for bespoke sections.
		 */
		hasData?: boolean;
		/** Empty-state message. Superseded by the `placeholder` snippet. */
		empty?: string;
		/** Rendered between the heading and the card (filters, toggles). */
		controls?: Snippet;
		/** Empty state for the few sections whose message interpolates state. */
		placeholder?: Snippet;
		children?: Snippet;
	} = $props();
</script>

<section class="visualization-section" class:mb-12={!last}>
	<h2 class="section-heading">
		{title}
		{#if count}({count}){/if}
	</h2>
	{#if description}
		<p class="section-description">{description}</p>
	{/if}
	{@render controls?.()}

	{#if hasData === undefined}
		{@render children?.()}
	{:else}
		<VizChartCard {variant} {height} {placeholderHeight} {hasData}>
			{@render children?.()}
			{#snippet placeholder()}
				{#if placeholderSnippet}
					{@render placeholderSnippet()}
				{:else}
					<p class="text-light">{empty}</p>
				{/if}
			{/snippet}
		</VizChartCard>
	{/if}
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
