<!--
RecordLayout — the shared shell for a bibliographic record page.

Extracted from /publications/[id], which is where this layout was designed, so
that /communications/[id] renders the same page rather than a second attempt at
it. The shell owns everything that is true of *any* record:

  - the editorial breadcrumb — a back-link ("← Publications") rather than the
    Home/Section/Title trail of the <Breadcrumb> molecule, so it reads as
    document chrome on a record. The BreadcrumbList structured data below still
    carries the full trail: that is the machine's path, and it ends at the page
    it describes;
  - the masthead: mono eyebrow tokens, Archivo h1, and either a serif-italic
    byline (a bibliographic record) or a `deck` snippet (a research project's
    standfirst) in the same slot;
  - the two-column grid — reading column plus a sticky 380px metadata rail —
    and the single-column choreography below --lg, where the rail dissolves
    (`display: contents`) and its two blocks order themselves around the body:
    identification and access at order 1, the document at 2, the indexing
    apparatus at 3, sibling work at 4;
  - the JSON-LD apparatus: breadcrumb structured data plus the entity's own.

Everything category-specific arrives through the four snippets. The rail is
split in two rather than passed whole precisely because that ordering is the
point: `railPrimary` is what identifies and opens the record and belongs beside
the title; `railSecondary` indexes it and belongs after the document it indexes.

Usage:

  <RecordLayout
    section={{ label: 'Publications', href: resolve('/publications') }}
    eyebrow={[{ label: typeLabel }, { label: date }]}
    title={displayTitle}
    byline={byline}
    {breadcrumbItems}
    jsonLdScriptId="publication-json-ld"
    {jsonLdString}
  >
    {#snippet main()}…{/snippet}
    {#snippet railPrimary()}…{/snippet}
    {#snippet railSecondary()}…{/snippet}
    {#snippet related()}…{/snippet}
  </RecordLayout>
-->
<script module lang="ts">
	/** One token of the masthead eyebrow, printed between "·" separators. */
	export type EyebrowToken = {
		/** The printed string — already typeset by the caller. */
		label: string;
		/** Optional registered Iconify mark set before the label (e.g. the open-access lock). */
		icon?: string;
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '@iconify/svelte';
	import JsonLd from '#lib/components/common/JsonLd.svelte';
	import {
		buildBreadcrumbJsonLd,
		BREADCRUMB_SCRIPT_ID,
		type BreadcrumbTrailItem
	} from '#lib/utils/breadcrumbJsonLd.ts';
	import { titleLength, titleSegments } from '#lib/utils/recordTitle.ts';
	import type { CitationDateline } from '#lib/utils/citationDateline.ts';

	interface Props {
		/** Section this record belongs to — the breadcrumb's back-link. */
		section: { label: string; href: string };
		/** Masthead eyebrow tokens, in print order. */
		eyebrow?: EyebrowToken[];
		/** Record title — already typeset. */
		title: string;
		/**
		 * BCP-47 language of the title when it is not the page's English
		 * (`titleLangAttr(record.language)`): screen readers switch voice
		 * (WCAG 3.1.2) and the title hyphenates by its own language's rules.
		 * Omit for English and for bilingual records, whose title language is
		 * not known.
		 */
		titleLang?: string;
		/**
		 * Citation dateline printed directly under the title — container,
		 * volume(issue), date, pages, DOI (`citationDateline`). Omit for a record
		 * that is not a citable work.
		 */
		dateline?: CitationDateline;
		/** Formatted byline ("A, B and C"); omit for an unattributed record. */
		byline?: string;
		/**
		 * Masthead deck, printed under the title where a bibliographic record
		 * prints its byline. A snippet rather than a string because the caller
		 * owns the idiom class it sets — a research project's `.standfirst`, say
		 * — and the shell has no styling of its own to lend it.
		 */
		deck?: Snippet;
		/** Trailing byline clause, printed after a full stop (e.g. "Preface by X"). */
		bylineSuffix?: string;
		/** Breadcrumb trail, as route paths, feeding the breadcrumb JSON-LD. */
		breadcrumbItems: BreadcrumbTrailItem[];
		/** Script id for the entity JSON-LD (e.g. 'communication-json-ld'). */
		jsonLdScriptId: string;
		/** Precomputed JSON-LD string from the route's load function. */
		jsonLdString?: string;
		/**
		 * The reading column. Optional: a record whose document is empty — a
		 * bibliographic stub with no abstract and no contents — prints the
		 * masthead and its rail rather than an empty column, so the page never
		 * opens a reading interval over nothing.
		 */
		main?: Snippet;
		/** Rail block one — identification and access; sits with the masthead. */
		railPrimary?: Snippet;
		/** Rail block two — indexing; falls past the document in one column. */
		railSecondary?: Snippet;
		/** Sibling work; closes the page. */
		related?: Snippet;
	}

	let {
		section,
		eyebrow = [],
		title,
		titleLang,
		dateline,
		byline,
		bylineSuffix,
		deck,
		breadcrumbItems,
		jsonLdScriptId,
		jsonLdString,
		main,
		railPrimary,
		railSecondary,
		related
	}: Props = $props();

	const breadcrumbJsonLd = $derived(buildBreadcrumbJsonLd(breadcrumbItems));
	const titleSize = $derived(titleLength(title));
	const titleRuns = $derived(titleSegments(title));
	const hasDateline = $derived(Boolean(dateline && (dateline.parts.length > 0 || dateline.doi)));
	const hasRail = $derived(Boolean(railPrimary || railSecondary));
	/** Blocks in the reading column — masthead, document, sibling work — one grid row each. */
	const columnRows = $derived(1 + (main ? 1 : 0) + (related ? 1 : 0));
</script>

<JsonLd id={BREADCRUMB_SCRIPT_ID} json={breadcrumbJsonLd} />
<JsonLd id={jsonLdScriptId} json={jsonLdString} />

<div class="container py-8">
	<div class="record-shell">
		<!-- Breadcrumb — mono, muted. Deliberate editorial variant of the shared
		     <Breadcrumb> molecule: a back-link ("← Publications") and nothing
		     else, so it reads as document chrome on the record. It used to carry
		     the type as a trailing segment, which the masthead eyebrow and the
		     rail's `Type` row both print already — and a type is not a place.
		     Breadcrumb JSON-LD still ships above, like every other detail page,
		     and still ends on the record's own title. -->
		<nav class="record-breadcrumb" aria-label="Breadcrumb">
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- base-prefixed path -->
			<a href={section.href} class="record-breadcrumb-link"
				><span aria-hidden="true">←&nbsp;</span>{section.label}</a
			>
		</nav>

		<!-- The whole record is one article: masthead, body column and metadata
		     rail. The masthead is a grid child of its own (rather than the first
		     block of the body column) so that below the two-column breakpoint the
		     rail's blocks can order themselves against it — plate and Record next
		     to the title, ahead of the document. -->
		<article class="record-grid record-grid--rows-{columnRows}">
			<!-- ═══ MASTHEAD ═══ -->
			<header class="record-header">
				{#if eyebrow.length > 0}
					<p class="eyebrow record-eyebrow">
						{#each eyebrow as token, index (token.label + index)}
							{#if index > 0}
								<span class="record-eyebrow-sep" aria-hidden="true">·</span>
							{/if}
							<!-- No whitespace between the mark and the word: a text node there
							     collapses to a mono space on top of the mark's own margin, which
							     doubled the gap. -->
							<span class="record-eyebrow-token"
								>{#if token.icon}<Icon
										icon={token.icon}
										class="record-eyebrow-icon"
										aria-hidden="true"
									/>{/if}{token.label}</span
							>
						{/each}
					</p>
				{/if}

				<!-- A year range is its own unbreakable run, so a balanced title never
				     sets "1970–" at a line end with "2023" under it. Text nodes only. -->
				<h1 class="record-title" lang={titleLang} data-length={titleSize}>
					{#each titleRuns as run, index (index)}{#if run.nowrap}<span class="record-title-nowrap"
								>{run.text}</span
							>{:else}{run.text}{/if}{/each}
				</h1>

				{#if dateline && hasDateline}
					<!-- The citable facts, in citation order, where the eye already is.
					     The DOI is the one link: the identifier a citation needs. -->
					<p class="dateline record-dateline">
						{#each dateline.parts as part, index (index)}{#if index > 0}<span
									class="record-dateline-sep"
									aria-hidden="true">&nbsp;·</span
								><wbr />
							{/if}<span class="record-dateline-part">{part}</span
							>{/each}{#if dateline.doi}{#if dateline.parts.length > 0}<span
									class="record-dateline-sep"
									aria-hidden="true">&nbsp;·</span
								><wbr />
							{/if}<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external DOI resolver --><a
								class="record-dateline-doi"
								href="https://doi.org/{dateline.doi}"
								target="_blank"
								rel="noopener noreferrer"
								>doi:{dateline.doi}<span class="sr-only"> (opens in new tab)</span></a
							>{/if}
					</p>
				{/if}

				{#if byline}
					<p class="record-byline">
						by {byline}{#if bylineSuffix}. {bylineSuffix}{/if}
					</p>
				{/if}

				{@render deck?.()}
			</header>

			<!-- ═══ MAIN COLUMN ═══ -->
			{#if main}
				<div class="record-main">
					{@render main()}
				</div>
			{/if}

			<!-- ═══ ASIDE — THE METADATA RAIL ═══ -->
			{#if hasRail}
				<aside class="record-rail">
					{#if railPrimary}
						<div class="record-rail-primary">{@render railPrimary()}</div>
					{/if}
					{#if railSecondary}
						<div class="record-rail-secondary">{@render railSecondary()}</div>
					{/if}
				</aside>
			{/if}

			<!-- ═══ SIBLING WORK ═══
			     A grid child of its own rather than the last block of the body, so
			     that in a single column it falls past the rail's indexing apparatus
			     (tags, key terms): the index stays with the record it indexes, and
			     the rail of sibling work closes the page. -->
			{#if related}
				<div class="record-related-block">{@render related()}</div>
			{/if}
		</article>
	</div>
</div>

<style>
	/* Shell caps the whole record at a comfortable reading width. */
	.record-shell {
		max-width: var(--container-lg);
		margin: 0 auto;
	}

	/* ── Breadcrumb ────────────────────────────────────────────────────────── */
	.record-breadcrumb {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-xl);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
	}

	.record-breadcrumb-link {
		color: var(--color-text-light);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.record-breadcrumb-link:hover {
		color: var(--color-accent);
	}

	/* The only navigation control on a record page, and at rest 16px of mono
	 * caps — a third the height of the buttons in the rail beneath it. A coarse
	 * pointer gets the same 44px the rest of the site's controls take; keyed to
	 * input method, not viewport width, like every other touch rule. */
	@media (--touch) {
		.record-breadcrumb {
			align-items: center;
		}

		.record-breadcrumb-link {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
		}
	}

	/* ── Two-column grid: masthead + main + 380px metadata rail ───────────── */
	.record-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-2xl);
	}

	/* Both column-one blocks opt out of the automatic min-content floor, so a
	   long title or a long metadata value can never widen the grid track. */
	.record-header,
	.record-main {
		min-width: 0;
	}

	/* The grid row gap sets the rhythm below the masthead, so the body's first
	   section must not stack its own top margin on top of it. */
	.record-main > :global(:first-child) {
		margin-top: 0;
	}

	/* Declared before the breakpoint blocks deliberately: `display: contents`
	   below --lg carries the same specificity, so it only wins by source order. */
	.record-rail,
	.record-rail-primary,
	.record-rail-secondary {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		min-width: 0;
	}

	/* Single column: the rail dissolves and its blocks place themselves around
	   the body — plate + Record + access at order 1, the document at order 2,
	   tags + key terms at order 3, and sibling work last. */
	@media (--lg-down) {
		.record-rail {
			display: contents;
		}

		.record-rail-primary {
			order: 1;
		}

		.record-main {
			order: 2;
		}

		.record-rail-secondary {
			order: 3;
		}

		.record-related-block {
			order: 4;
		}
	}

	@media (--lg) {
		.record-grid {
			grid-template-columns: minmax(0, 1fr) 380px;
			column-gap: var(--space-3xl);
			align-items: start;
		}

		/* Column one — masthead, document, sibling work — fills its own rows in
		   source order, one block to a row; a record with no document simply has
		   one row fewer, so sibling work follows the masthead. */
		.record-header,
		.record-main,
		.record-related-block {
			grid-column: 1;
		}

		/* The rail occupies column two across every row of column one, so it
		   starts level with the eyebrow and can follow the scroll to the end of
		   the reading column. */
		.record-rail {
			grid-column: 2;
			grid-row: 1 / -1;
			position: sticky;
			top: var(--space-xl);
		}

		/* The rows are declared, and only the last is flexible. With every row
		   intrinsic, a rail taller than the column beside it — a cover plate, a
		   long Record ledger, tags and key terms over a short abstract — had its
		   overflow shared equally among the rows it spans, which opened a hole of
		   several hundred pixels between the byline and the document. An item
		   spanning a flexible track is skipped when intrinsic tracks are sized,
		   so the masthead and the document keep their own heights and the last
		   row alone grows to meet the rail, below everything the column prints.
		   A masthead alone needs no template: its one row is the rail's too. */
		.record-grid--rows-2 {
			grid-template-rows: max-content 1fr;
		}

		.record-grid--rows-3 {
			grid-template-rows: max-content max-content 1fr;
		}
	}

	/* The related-items heading is a bare .section-title with no .section-head
	   wrapper to carry the rhythm, so it needs its own space above the cards. */
	.record-related-block :global(.section-title) {
		margin-bottom: var(--space-md);
	}

	/* ── Masthead ──────────────────────────────────────────────────────────── */
	.record-eyebrow {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-1) var(--space-2);
		margin-bottom: var(--space-sm);
	}

	.record-eyebrow-sep {
		color: var(--color-text-muted);
	}

	/* An eyebrow token — deliberately NOT a flex box: the eyebrow aligns its
	   tokens on the baseline, and an inline-flex box donates its first child's
	   baseline — a glyph's bottom edge — which drops any leading mark below the
	   mono caps. As inline text the span keeps its own baseline and the glyph is
	   seated against it by `vertical-align`. */
	.record-eyebrow-token {
		white-space: nowrap;
	}

	/* The Academicons marks are 1:2 glyphs (viewBox 256×512) whose ink fills the
	   middle 75% of the box, so `width: auto` keeps them from carrying half a box
	   of dead space beside the word. Centring the box on the cap band then falls
	   out of the geometry: the caps are 0.75em tall and sit on the baseline, so
	   their midpoint is 0.375em above it, and a 1.15em box hits that midpoint at
	   `vertical-align: 1.15em / 2 − 0.375em = −0.2em`. */
	.record-eyebrow-token :global(.record-eyebrow-icon) {
		width: auto;
		height: 1.15em;
		vertical-align: -0.2em;
		margin-right: 0.45em;
	}

	.record-title {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display);
		font-size: var(--font-size-4xl);
		font-weight: 820;
		letter-spacing: var(--tracking-display);
		line-height: 1.02;
		color: var(--color-text-emphasis);
		margin: 0;
		text-wrap: balance;
	}

	/* A title whose language is declared hyphenates by that language's
	 * dictionary: long French words ("institutionnalisation") then break at a
	 * syllable with a hyphen instead of mid-word with none. Scoped to `[lang]`
	 * because an English title carries no attribute, and English display type
	 * is better left unhyphenated. */
	.record-title[lang] {
		hyphens: auto;
	}

	/* A year range never breaks at its dash. */
	.record-title-nowrap {
		white-space: nowrap;
	}

	/* Length steps the title down the heading scale. At the display size the
	   median record title set six lines at 1440 and the longest thirteen — the
	   whole first screen, with the Cite block 1300px down. Over ~90 characters
	   the title takes the h2 step, over ~150 the h3 step (`titleLength`). It
	   stays Archivo at its masthead weight: what marks it as the masthead is the
	   face and the position, not the size. */
	.record-title[data-length='long'] {
		font-size: var(--font-size-heading-2);
		line-height: 1.05;
	}

	.record-title[data-length='xlong'] {
		font-size: var(--font-size-heading-3);
		line-height: 1.08;
	}

	/* --font-size-4xl barely scales down (clamp floor ~47px), which a long
	   bibliographic title turns into a screen and a half of headline before the
	   plate. One step down in the narrow column, and one more for a long title;
	   no further, since the section heads sit at --font-size-2xl and the
	   masthead must stay above them. Declared after the length steps: same
	   specificity for the bare title, so this wins by source order. */
	@media (--md-down) {
		.record-title {
			font-size: var(--font-size-heading-2);
		}

		.record-title[data-length='long'],
		.record-title[data-length='xlong'] {
			font-size: var(--font-size-heading-3);
		}
	}

	/* Citation dateline — the data voice, set as written rather than in caps: a
	   journal name and a DOI are strings a reader copies, and a DOI in capitals
	   is not the DOI they were given. One step up from the eyebrow, because
	   this line is read rather than glanced at. */
	.record-dateline {
		margin: var(--space-md) 0 0;
		font-size: var(--font-size-xs);
		letter-spacing: var(--tracking-figures);
		text-transform: none;
		line-height: var(--line-height-snug);
	}

	/* The space after the dot is a margin and the break a <wbr>: Svelte trims
	   the whitespace a block boundary leaves, which ran the parts together. */
	.record-dateline-sep {
		margin-inline-end: 0.6ch;
		color: var(--color-text-muted);
	}

	/* The prose-link idiom: ink at rest over a pine underline, pine under the
	   pointer. The eyebrow above already spends the accent; a second pine
	   string a line below it would not be scarce. */
	.record-dateline-doi {
		color: inherit;
		text-decoration: underline;
		text-decoration-color: var(--color-accent);
		text-decoration-thickness: var(--rule-hairline);
		text-underline-offset: 0.2em;
		overflow-wrap: anywhere;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.record-dateline-doi:hover {
		color: var(--color-accent);
	}

	.record-dateline-doi:focus-visible {
		outline: var(--focus-outline);
		outline-offset: var(--focus-outline-offset);
	}

	/* Byline — the document voice, serif italic. */
	.record-byline {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-xl);
		line-height: var(--line-height-normal);
		color: var(--color-text-soft);
		margin: var(--space-md) 0 0;
		max-width: var(--measure-standfirst);
	}

	/* ── Paper ──────────────────────────────────────────────────────────────
	   A printed record is a catalogue card followed by its document: title and
	   dateline, then the plate beside the Record ledger, then the abstract. The
	   page is narrower than --lg, so the screen's single-column choreography
	   applies, and on its own it set the title alone on page one (the cover,
	   full column width, could not fit under it) and broke the ledger across a
	   page. The back-link is a control and does not print (the Paper Rule). */
	@media print {
		.record-breadcrumb {
			display: none;
		}

		.record-grid {
			gap: var(--space-lg);
		}

		.record-header {
			break-after: avoid;
		}

		.record-title {
			break-after: avoid;
		}

		/* Plate in a narrow left column, the rest of the identification block —
		   Record ledger, citation — beside it. Only when there is a plate: a
		   record without one keeps the plain column. */
		.record-rail-primary:has(> :global(.rail-plate)) {
			display: grid;
			grid-template-columns: minmax(0, 30%) minmax(0, 1fr);
			align-items: start;
			gap: var(--space-md) var(--space-lg);
		}

		.record-rail-primary:has(> :global(.rail-plate)) > :global(*) {
			grid-column: 2;
		}

		.record-rail-primary:has(> :global(.rail-plate)) > :global(.rail-plate) {
			grid-column: 1;
			grid-row: 1 / span 4;
			break-inside: avoid;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.record-breadcrumb-link,
		.record-dateline-doi {
			transition: none;
		}
	}
</style>
