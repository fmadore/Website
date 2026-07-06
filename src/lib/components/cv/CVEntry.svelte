<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		year,
		yearWidth = 'auto',
		current = false,
		children
	}: {
		year: string | number;
		yearWidth?: 'auto' | 'fixed';
		/** Mark this row's year key as the current/ongoing record (accent). */
		current?: boolean;
		children: Snippet;
	} = $props();
</script>

<!--
	Ledger row — the universal CV record. A hanging mono year/date key sits in the
	left column, serif content in the right, with a hairline rule between rows.
	The .cv-entry / .cv-entry-year / .cv-entry-content class hooks are load-bearing:
	the PDF generator reads them to reconstruct each entry, so they are preserved.
-->
<div class="cv-entry" class:cv-entry--fixed={yearWidth === 'fixed'}>
	<div class="cv-entry-year" class:cv-entry-year--current={current}>
		{year}
	</div>
	<div class="cv-entry-content">
		{@render children()}
	</div>
</div>

<style>
	/* Ledger row: narrow mono key column, serif content column, hairline between. */
	.cv-entry {
		display: grid;
		grid-template-columns: var(--cv-key-w, 6rem) 1fr;
		gap: var(--space-2) var(--space-5);
		padding: var(--space-2-5) 0;
		border-top: var(--rule-hairline) solid var(--color-border-light);
		align-items: baseline;
	}

	/* Fixed-width variant leaves room for year ranges ("2019–2024", "Forthcoming"). */
	.cv-entry--fixed {
		--cv-key-w: 6.5rem;
	}

	/* Year/date key — DATA voice: mono, letterspaced, quiet ink, tabular figures.
	 * Long labels ("Forthcoming") wrap within the key column rather than overrun
	 * into the content column. */
	.cv-entry-year {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.04em;
		font-variant-numeric: tabular-nums;
		color: var(--color-text-light);
		line-height: var(--line-height-snug);
	}

	/* Current/ongoing record — accent, the site's scarce signal colour. */
	.cv-entry-year--current {
		color: var(--color-accent);
		font-weight: var(--font-weight-semibold);
	}

	/* Content — DOCUMENT voice inherits the site's serif body. */
	.cv-entry-content {
		min-width: 0;
		line-height: var(--line-height-relaxed);
	}

	/* On narrow viewports the two columns stack: key becomes an overline. */
	@media (--sm-down) {
		.cv-entry {
			grid-template-columns: 1fr;
			gap: var(--space-1);
		}
	}
</style>
