<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		year,
		wide = false,
		current = false,
		children
	}: {
		/** The hanging key: a year, a year range, a period, a classification. */
		year: string | number;
		/** Widen the key column for a classification key (e.g. a skills category). */
		wide?: boolean;
		/** Mark this row's key as the current/ongoing record (accent). */
		current?: boolean;
		children: Snippet;
	} = $props();
</script>

<!--
	Ledger row — the universal CV record, and the shared `.ledger-row` idiom
	rather than a local copy of it. The CV wraps its rows in
	`.ledger.ledger--tight.ledger--ruled` (see CVSection and the hand-rolled
	sections), so the grid, the hairline, the key voice and the narrow-measure
	collapse all come from ink-signal.css; only the accent key, the reading
	measure and the wide key column are local.

	The .cv-entry / .cv-entry-year / .cv-entry-content class hooks are
	load-bearing and ride alongside the idiom classes: the PDF generator reads
	them to reconstruct each entry, and the print stylesheet keys off them.
-->
<div class="ledger-row cv-entry" class:cv-entry--wide={wide}>
	<div class="ledger-key cv-entry-year" class:cv-entry-year--current={current}>
		{year}
	</div>
	<div class="cv-entry-content">
		{@render children()}
	</div>
</div>

<style>
	/* Every selector here is `:global`, keyed by the row's own `cv-entry*`
	 * hooks (which no other component uses) and doubled to the two-class weight
	 * a scoped selector carried. Scoped, Svelte stamped its hash class on all
	 * three elements of every row — ~700 attributes on /cv, a page that sits
	 * against its Lighthouse document budget — to guard names that were never
	 * at risk of collision. */

	/* A classification key ("Data analysis & visualisation") needs more column
	 * than a year does. The narrow-measure collapse still applies: below
	 * `--sm-down` the idiom stacks and the width is moot. */
	:global(.cv-entry.cv-entry--wide) {
		--ledger-key-w: 15rem;
	}

	/* Tabular figures keep year columns aligned down a 250-row sheet; the
	 * idiom's key does not assume numerals. */
	:global(.cv-entry > .cv-entry-year) {
		font-variant-numeric: tabular-nums;
	}

	/* Current/ongoing record — accent, the site's scarce signal colour. Two
	 * keys on the whole page carry it: the standing appointment and the
	 * running affiliation. */
	:global(.cv-entry-year.cv-entry-year--current) {
		color: var(--color-accent);
		font-weight: var(--font-weight-semibold);
	}

	/* Content — DOCUMENT voice inherits the site's serif body. */
	:global(.cv-entry > .cv-entry-content) {
		min-width: 0;
		line-height: var(--line-height-relaxed);
	}

	/* One measure per row: the detail and note lines run to the same right edge
	 * as the entry they qualify. They were capped at the prose measure while
	 * the lead line and the mono address rows ran the full column, so a row's
	 * second line stopped at half the width of its first and the sheet read as
	 * two ragged columns. A CV entry is scanned, not read; the column is the
	 * measure. */

	/* The row's own padding closes it. A trailing `<p class="cv-detail">` would
	 * otherwise add the paragraph margin on top, making rows that end in a
	 * detail line taller at the foot than rows that do not. */
	:global(.cv-entry > .cv-entry-content > :last-child) {
		margin-bottom: 0;
	}
</style>
