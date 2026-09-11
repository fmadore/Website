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
    section={{ label: 'Publications', href: `${base}/publications` }}
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
	import JsonLd from '$lib/components/common/JsonLd.svelte';
	import {
		buildBreadcrumbJsonLd,
		BREADCRUMB_SCRIPT_ID,
		type BreadcrumbNavItem
	} from '$lib/utils/breadcrumbJsonLd.svelte';

	interface Props {
		/** Section this record belongs to — the breadcrumb's back-link. */
		section: { label: string; href: string };
		/** Masthead eyebrow tokens, in print order. */
		eyebrow?: EyebrowToken[];
		/** Record title — already typeset. */
		title: string;
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
		/** Breadcrumb trail feeding the breadcrumb JSON-LD. */
		breadcrumbItems: BreadcrumbNavItem[];
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
	const hasRail = $derived(Boolean(railPrimary || railSecondary));
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
				><span aria-hidden="true">← </span>{section.label}</a
			>
		</nav>

		<!-- The whole record is one article: masthead, body column and metadata
		     rail. The masthead is a grid child of its own (rather than the first
		     block of the body column) so that below the two-column breakpoint the
		     rail's blocks can order themselves against it — plate and Record next
		     to the title, ahead of the document. -->
		<article class="record-grid" class:record-grid--no-main={!main}>
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

				<h1 class="record-title">{title}</h1>

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

		/* Masthead over the body in column one; the rail spans both rows so it
		   still starts level with the eyebrow. */
		.record-header {
			grid-column: 1;
			grid-row: 1;
		}

		.record-main {
			grid-column: 1;
			grid-row: 2;
		}

		/* Below the body, still in the reading column. */
		.record-related-block {
			grid-column: 1;
			grid-row: 3;
		}

		/* With no document, row 2 collapses to nothing but still charges its two
		   gaps, which would open a 96px hole under the masthead. Sibling work
		   takes row 2 instead; the rail still spans rows 1–2 in column two, so
		   the two never meet.

		   The two tracks are then declared explicitly, and the second one is
		   flexible on purpose: an item spanning a flexible track is skipped when
		   intrinsic tracks are sized, so a rail taller than the masthead — every
		   talk whose venue map is now a plate in it — cannot push row one open
		   and strand the sibling work a screen below the byline. */
		.record-grid--no-main {
			grid-template-rows: max-content 1fr;
		}

		.record-grid--no-main .record-related-block {
			grid-row: 2;
		}

		/* The rail occupies column two across both rows of the page grid
		   (masthead and body), so it starts level with the eyebrow and can
		   follow the scroll. */
		.record-rail {
			grid-column: 2;
			grid-row: 1 / span 2;
			position: sticky;
			top: var(--space-xl);
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

	/* --font-size-4xl barely scales down (clamp floor ~47px), which a long
	   bibliographic title turns into a screen and a half of headline before the
	   plate. One step down in the narrow column; no further, since the section
	   heads sit at --font-size-2xl and the masthead must stay above them. */
	@media (--md-down) {
		.record-title {
			font-size: var(--font-size-3xl);
		}
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

	@media (prefers-reduced-motion: reduce) {
		.record-breadcrumb-link {
			transition: none;
		}
	}
</style>
