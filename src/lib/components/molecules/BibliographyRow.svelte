<script module lang="ts">
	/** One entry in the right-aligned mono action column (external links). */
	export interface BibliographyAction {
		href: string;
		label: string;
		/** Marks the pine "current thing" action (DOI / Open Access / Slides). */
		primary?: boolean;
		/**
		 * Registered Iconify name of the mark printed before the label — the
		 * scholarly-infrastructure glyph for the destination ('academicons:doi',
		 * 'academicons:open-access'). Omit for actions with no such mark.
		 */
		icon?: string;
	}

	/**
	 * A fact about the record printed in the kind eyebrow, after a "·" — the
	 * open-access lock, say. Facts belong here and destinations belong in the
	 * action column: "Open Access" as an action label could only be printed
	 * when the row had no DOI to name instead, which hid the fact on 21 of the
	 * 27 open-access records.
	 */
	export interface BibliographyNote {
		label: string;
		/** Registered Iconify name of the mark printed before the label. */
		icon?: string;
	}
</script>

<script lang="ts">
	// Bibliography-row idiom (Ink + Signal): the shared finding-aid ledger entry
	// used by the /publications, /conference-activity and /activities lists.
	// Grid: year | cover | body | actions. The year column is filled once per
	// year-group by the parent (the activities log fills it on every row — its
	// records are dated to the day and the year is carried by the group head);
	// the cover column is reserved on every row (a catalogue shelf) and holds a
	// plate whenever the entry has one. PublicationItem, CommunicationItem and
	// ActivityItem adapt their entities onto these props so the three record
	// lists stay in visual lock-step.
	import '$styles/components/bibliography.css';
	import Icon from '@iconify/svelte';
	import { base } from '$app/paths';
	import Button from '$lib/components/atoms/Button.svelte';
	import { copyText } from '$lib/utils/clipboard';
	import { buildSrcset, resolveImagePath } from '$lib/utils/imageVariants';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';

	// The plate column is 80px wide (56px under --sm-down), so even a 3× phone
	// needs no more than the 400w derivative — never the detail-page-sized
	// source. `sizes` states that width so the browser can pick it. A list that
	// widens the column (`--bib-cover-w`) must restate it through `plateSizes`,
	// or the browser picks a candidate for a narrower box than it renders.
	const DEFAULT_PLATE_SIZES = '(max-width: 640px) 56px, 80px';

	interface Props {
		/** Internal detail link — pre-resolved via resolve() by the parent. */
		href: string;
		/** Mono kind eyebrow ("JOURNAL ARTICLE", "WORKSHOP", …). */
		kindLabel: string;
		/** Language shown after the kind — only when it isn't plain English. */
		languageNote?: string | null;
		/** Further record facts printed after the language (e.g. Open Access). */
		kindNotes?: BibliographyNote[];
		title: string;
		/** BCP-47 lang for the title when it isn't English (screen-reader pronunciation). */
		titleLang?: string;
		/** Italic serif title — the convention for a standalone published work. */
		italicTitle?: boolean;
		/** Serif byline under the title (authors / venue line). */
		byline?: string;
		/** One-line serif standfirst — printed only on the featured lead. */
		standfirst?: string;
		/**
		 * A serif deck printed on *every* row, where `standfirst` prints only on
		 * the featured lead (and wins on a row that is both). The activities log
		 * is a dated record whose entries each carry a one-sentence description;
		 * withholding it from all but the lead would drop the only prose the row
		 * has, and a log entry's title alone rarely says what happened.
		 */
		summary?: string;
		/**
		 * The record's own keyword run, set as a mono `.apparatus-line` under the
		 * body — apparatus annotating the entry, not a control the reader operates
		 * (the facets are where a list is narrowed).
		 */
		apparatus?: string;
		/** Plate image; the column stays reserved (blank) when absent. */
		image?: string | null;
		imageAlt?: string;
		imageWidth?: number;
		imageHeight?: number;
		/** Override for the plate aspect ratio (e.g. '1 / 1' for event seals). */
		plateAspect?: string | null;
		/**
		 * `sizes` for the plate, stated in the same widths the list's
		 * `--bib-cover-w` renders. Only a list that widens that column needs to
		 * pass it; the default describes the shared 80px / 56px shelf.
		 */
		plateSizes?: string;
		loading?: 'eager' | 'lazy';
		/** External actions (DOI / Open Access / Slides / Materials). */
		actions?: BibliographyAction[];
		/**
		 * Builds the plain-text reference this row can copy. Supplied, the row
		 * prints a "Cite" control that puts the reference on the clipboard —
		 * the citation itself, not a link to the page that holds it. Built on
		 * demand: a list page renders a dozen of these and only one is ever used.
		 */
		reference?: () => string;
		/**
		 * Label of the trailing internal link ("Details"). Omit on a row whose
		 * title already links to the record and whose trailing action is the
		 * citation — a third link to the same page is only noise in the tab order.
		 */
		detailLabel?: string;
		/** Citation count — rendered as quiet mono marginalia when > 0. */
		citedCount?: number;
		/** Hanging year, printed once per year-group by the parent. */
		yearLabel?: string | number | null;
		/**
		 * Heading level of the row title. 2 by default, because on /publications
		 * and /conference-activity the rows sit directly under the page h1 with no
		 * intermediate head. /activities groups its log under a real `<h2>` per
		 * year, so there the entry is a level below.
		 */
		headingLevel?: 2 | 3;
		/** The current/featured lead — pine eyebrow, larger year, standfirst. */
		featured?: boolean;
	}

	let {
		href,
		kindLabel,
		languageNote = null,
		kindNotes = [],
		title,
		titleLang = undefined,
		italicTitle = false,
		byline = '',
		standfirst = '',
		summary = '',
		apparatus = '',
		image = null,
		imageAlt = '',
		imageWidth = 200,
		imageHeight = 280,
		plateAspect = null,
		plateSizes = DEFAULT_PLATE_SIZES,
		loading = 'lazy',
		actions = [],
		reference = undefined,
		detailLabel = '',
		citedCount = 0,
		yearLabel = null,
		headingLevel = 2,
		featured = false
	}: Props = $props();

	// Every string this row prints is prose from a data file, spelled however
	// its source spells it. The row owns the typographic register so both lists
	// that render through it — /publications and /conference-activity — stay in
	// one voice. All plain text (no markup ever reaches these props), so
	// `typesetQuotes` is the right entry point.
	const displayTitle = $derived(typesetQuotes(title));
	const displayKind = $derived(typesetQuotes(kindLabel));
	const displayLanguage = $derived(languageNote ? typesetQuotes(languageNote) : '');
	const displayByline = $derived(typesetQuotes(byline));
	const displayStandfirst = $derived(typesetQuotes(standfirst));
	const displaySummary = $derived(typesetQuotes(summary));
	const displayImageAlt = $derived(typesetQuotes(imageAlt));

	// Base-relative source (data files store `images/…`), plus the generated
	// downscaled candidates when the manifest has them.
	const plateSrc = $derived(resolveImagePath(image, base));
	const plateSrcset = $derived(buildSrcset(plateSrc));

	// ── The cite control ───────────────────────────────────────────────────────
	// The row's own citation, copied in place: on a finding aid the peer's next
	// move after recognising an entry is to cite it, and sending them to the
	// record page for a reference the row could hand over is a detour. The
	// control reports its own result rather than claiming a copy that a denied
	// permission never made — hence the third state.
	let copyState = $state<'idle' | 'copied' | 'failed'>('idle');
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	const CITE_LABELS = {
		idle: 'Cite',
		copied: 'Copied ✓',
		failed: 'Copy failed'
	} as const;

	async function copyReference() {
		if (!reference) return;
		copyState = (await copyText(reference())) ? 'copied' : 'failed';
		clearTimeout(resetTimer);
		resetTimer = setTimeout(() => (copyState = 'idle'), 2400);
	}

	// The timer outlives a row that paginates away mid-confirmation.
	$effect(() => () => clearTimeout(resetTimer));
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
					src={plateSrc}
					srcset={plateSrcset}
					sizes={plateSrcset ? plateSizes : undefined}
					alt={displayImageAlt}
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
			<span>{displayKind}</span>
			{#if displayLanguage}
				<span class="bib-kind-sep" aria-hidden="true">·</span>
				<span class="bib-kind-lang">{displayLanguage}</span>
			{/if}
			{#each kindNotes as note (note.label)}
				<span class="bib-kind-sep" aria-hidden="true">·</span>
				<!-- No whitespace between the mark and the word: a text node there
				     collapses to a mono space on top of the mark's own margin. -->
				<span class="bib-kind-note"
					>{#if note.icon}<Icon
							icon={note.icon}
							class="bib-kind-icon"
							aria-hidden="true"
						/>{/if}{note.label}</span
				>
			{/each}
		</p>

		<!-- h2 by default: on /publications and /conference-activity these rows sit
		     directly under the page h1 with no intermediate h2, so h3 would skip a
		     level. The activities log heads each year group with a real h2, so it
		     asks for h3 (see `headingLevel`). -->
		<svelte:element
			this={`h${headingLevel}`}
			class="bib-title"
			class:bib-title--italic={italicTitle}
			lang={titleLang}
		>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolve() -->
			<a {href} class="bib-title-link" data-sveltekit-preload-code="tap">
				{displayTitle}
			</a>
		</svelte:element>

		{#if displayByline}
			<p class="bib-byline">{displayByline}</p>
		{/if}

		<!-- At most one deck per row. The lead's trimmed abstract wins where both
		     are supplied, so a featured activity would still read as a lead
		     rather than printing two serif paragraphs under one title. -->
		{#if featured && displayStandfirst}
			<p class="bib-standfirst">{displayStandfirst}</p>
		{:else if displaySummary}
			<p class="bib-standfirst">{displaySummary}</p>
		{/if}

		{#if apparatus}
			<p class="apparatus-line bib-apparatus">{apparatus}</p>
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
				{#if action.icon}
					<Icon icon={action.icon} class="bib-action-icon" aria-hidden="true" />
				{/if}
				{action.label}
			</a>
		{/each}
		{#if reference}
			<Button
				bare
				class="bib-action bib-cite"
				additionalClasses={copyState === 'copied' ? 'bib-cite--confirmed' : ''}
				onclick={copyReference}
				aria-live="polite"
				label={CITE_LABELS[copyState]}
			/>
		{/if}
		{#if detailLabel}
			<a {href} class="bib-action" data-sveltekit-preload-code="tap">{detailLabel}</a>
		{/if}
		{#if citedCount > 0}
			<span class="bib-cited">Cited {citedCount}×</span>
		{/if}
	</div>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
</article>
