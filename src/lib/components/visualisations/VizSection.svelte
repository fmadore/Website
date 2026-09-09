<!--
VizSection — the ruled-section scaffold shared by the two visualisation
pages (publications, conference activity).

It is the house `.section` idiom from `ink-signal.css` and nothing else: a 3px
ink rule, the `§ n` marker in the data voice, an Archivo head, and — when the
section counts something — the machine's count appended in mono. Sections used
to carry their own `.section-heading` / `.section-description` styles and an
`mb-12` utility; both are gone, so a visualisation section is now typeset
exactly like a section anywhere else on the site and its interval comes from
`.section`'s own `margin-top`.

Both pages were repeating the same ten-line unit twenty-odd times:

    <VizSection no="§ 3" id="keywords" title=… count=…>
      <VizChartCard variant=… height=… hasData={xs.length > 0}>
        <SomeChart … />
        {#snippet placeholder()}
          <p class="text-light">No … data available for this visualisation.</p>
        {/snippet}
      </VizChartCard>
    </VizSection>

so the card and its placeholder live here. Passing `hasData` opts into the
card; the message is a plain `empty` string, with the `placeholder` snippet
kept as the escape hatch for the few that interpolate state.

Sections that need their own structure (the paginated cited-authors chart)
omit `hasData` and get their children rendered raw, exactly as before — they
can still compose `VizChartCard` themselves.

The `id` is the anchor `VizContents` links to, so every section on a page must
carry a unique one.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import VizChartCard from './VizChartCard.svelte';

	type Variant =
		'stacked' | 'network' | 'arc' | 'matrix' | 'bubble' | 'treemap' | 'gantt' | 'map' | 'bigrams';

	let {
		no,
		id,
		title,
		count = '',
		description = '',
		// Accepted so existing callers keep compiling; sections now space
		// themselves via `.section`, so nothing reads it.
		last: _last = false,
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
		/** Section marker in the data voice, e.g. "§ 3". */
		no: string;
		/** Anchor id, set on the <section> and linked from VizContents. */
		id: string;
		title: string;
		/** The machine's count for this section, e.g. "117 keywords". Hidden when empty. */
		count?: string;
		/** Serif note under the heading. Hidden when empty. */
		description?: string;
		/** No-op. Kept so existing callers compile; sections space themselves. */
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

<section class="section viz-section" {id}>
	<div class="section-head">
		<span class="section-no">{no}</span>
		<h2 class="section-title">
			{title}{#if count}<span class="section-count">{count}</span>{/if}
		</h2>
	</div>
	{#if description}
		<p class="section-note">{description}</p>
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
	 * The corpus count riding inside the display head. It is a machine count —
	 * "117 keywords" is a string a database could hold — so it takes the data
	 * voice rather than inheriting Archivo from the head it sits in (the Two
	 * Voices Rule). Quiet ink, so the section title still reads as the title.
	 */
	.section-count {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--color-text-light);
		margin-inline-start: var(--space-sm);
		vertical-align: middle;
	}

	/* A long count ("9 countries, 38 publications") set nowrap beside a display
	 * head pushed the whole title past a phone's viewport — the one horizontal
	 * overflow on the page. Below --sm the count drops under the title as a
	 * line of its own, in the ledger's key-then-content order. */
	@media (--sm-down) {
		.section-count {
			display: block;
			margin-inline-start: 0;
			margin-top: var(--space-1);
		}
	}
</style>
