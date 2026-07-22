<script module lang="ts">
	/** One entry in the right-aligned mono action column (external links). */
	export interface BibliographyAction {
		href: string;
		label: string;
		/** Marks the pine "current thing" action (DOI / Open Access / Slides). */
		primary?: boolean;
	}
</script>

<script lang="ts">
	// Bibliography-row idiom (Ink + Signal): the shared finding-aid ledger entry
	// used by both the /publications and /conference-activity lists. Grid:
	// year | cover | body | actions. The year column is filled once per
	// year-group by the parent; the cover column is reserved on every row (a
	// catalogue shelf) and holds a plate whenever the entry has one.
	// PublicationItem and CommunicationItem adapt their entities onto these
	// props so both record lists stay in visual lock-step.
	import '$styles/components/bibliography.css';

	interface Props {
		/** Internal detail link — pre-resolved via resolve() by the parent. */
		href: string;
		/** Mono kind eyebrow ("JOURNAL ARTICLE", "WORKSHOP", …). */
		kindLabel: string;
		/** Language shown after the kind — only when it isn't plain English. */
		languageNote?: string | null;
		title: string;
		/** Italic serif title — the convention for a standalone published work. */
		italicTitle?: boolean;
		/** Serif byline under the title (authors / venue line). */
		byline?: string;
		/** One-line serif standfirst — printed only on the featured lead. */
		standfirst?: string;
		/** Plate image; the column stays reserved (blank) when absent. */
		image?: string | null;
		imageAlt?: string;
		imageWidth?: number;
		imageHeight?: number;
		/** Override for the plate aspect ratio (e.g. '1 / 1' for event seals). */
		plateAspect?: string | null;
		loading?: 'eager' | 'lazy';
		/** External actions (DOI / Open Access / Slides / Materials). */
		actions?: BibliographyAction[];
		/** Label of the trailing internal action ("Cite", "Details"). */
		detailLabel?: string;
		/** Citation count — rendered as quiet mono marginalia when > 0. */
		citedCount?: number;
		/** Hanging year, printed once per year-group by the parent. */
		yearLabel?: string | number | null;
		/** The current/featured lead — pine eyebrow, larger year, standfirst. */
		featured?: boolean;
	}

	let {
		href,
		kindLabel,
		languageNote = null,
		title,
		italicTitle = false,
		byline = '',
		standfirst = '',
		image = null,
		imageAlt = '',
		imageWidth = 200,
		imageHeight = 280,
		plateAspect = null,
		loading = 'lazy',
		actions = [],
		detailLabel = 'Details',
		citedCount = 0,
		yearLabel = null,
		featured = false
	}: Props = $props();
</script>

<article
	class="bib-row"
	class:bib-row--featured={featured}
	style={plateAspect ? `--bib-plate-aspect: ${plateAspect};` : undefined}
>
	<div class="bib-year" aria-hidden={yearLabel == null ? 'true' : undefined}>
		{#if yearLabel != null}{yearLabel}{/if}
	</div>

	<div class="bib-plate-col">
		{#if image}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolve() -->
			<a {href} data-sveltekit-preload-code="tap" class="bib-plate-link">
				<img
					class="plate bib-plate"
					src={image}
					alt={imageAlt}
					width={imageWidth}
					height={imageHeight}
					{loading}
					decoding="async"
				/>
			</a>
		{/if}
	</div>

	<div class="bib-body">
		<p class="bib-kind" class:bib-kind--current={featured}>
			<span>{kindLabel}</span>
			{#if languageNote}
				<span class="bib-kind-sep" aria-hidden="true">·</span>
				<span class="bib-kind-lang">{languageNote}</span>
			{/if}
		</p>

		<!-- h2, not h3: on the list pages these rows sit directly under the page
		     h1 with no intermediate h2, so h3 would skip a heading level. -->
		<h2 class="bib-title" class:bib-title--italic={italicTitle}>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolve() -->
			<a {href} class="bib-title-link" data-sveltekit-preload-code="tap">
				{title}
			</a>
		</h2>

		{#if byline}
			<p class="bib-byline">{byline}</p>
		{/if}

		{#if featured && standfirst}
			<p class="bib-standfirst">{standfirst}</p>
		{/if}
	</div>

	<!-- Action hrefs are external; the detail href is pre-resolved via resolve(). -->
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<div class="bib-actions">
		{#each actions as action (action.href)}
			<a
				href={action.href}
				target="_blank"
				rel="noopener noreferrer"
				class="bib-action"
				class:bib-action--primary={action.primary}
			>
				{action.label}
			</a>
		{/each}
		<a {href} class="bib-action" data-sveltekit-preload-code="tap">{detailLabel}</a>
		{#if citedCount > 0}
			<span class="bib-cited">Cited {citedCount}×</span>
		{/if}
	</div>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
</article>
