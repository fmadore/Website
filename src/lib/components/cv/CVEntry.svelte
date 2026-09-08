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
	/* A classification key ("Data analysis & visualisation") needs more column
	 * than a year does. The narrow-measure collapse still applies: below
	 * `--sm-down` the idiom stacks and the width is moot. */
	.cv-entry--wide {
		--ledger-key-w: 15rem;
	}

	/* Tabular figures keep year columns aligned down a 250-row sheet; the
	 * idiom's key does not assume numerals. */
	.cv-entry-year {
		font-variant-numeric: tabular-nums;
	}

	/* Current/ongoing record — accent, the site's scarce signal colour. Two
	 * keys on the whole page carry it: the standing appointment and the
	 * running affiliation. */
	.cv-entry-year--current {
		color: var(--color-accent);
		font-weight: var(--font-weight-semibold);
	}

	/* Content — DOCUMENT voice inherits the site's serif body. */
	.cv-entry-content {
		min-width: 0;
		line-height: var(--line-height-relaxed);
	}

	/* The reading measure goes on the prose, not on the column. CV entries carry
	 * the site's longest descriptions — over 140 characters a line uncapped —
	 * but the column also holds mono address rows, and narrowing those only
	 * makes them wrap, which stacks 15px link targets closer than the 24px WCAG
	 * 2.5.8 asks for. Cap what is read; leave what is scanned. */
	.cv-entry-content :global(.text-sm) {
		max-width: var(--measure-prose);
	}
</style>
