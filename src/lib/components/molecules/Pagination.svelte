<script lang="ts">
	/**
	 * Reusable pagination — the data voice as a page ledger. Mono caps,
	 * square, hairline borders; current page a solid ink fill. Mirrors the
	 * "SHOWING m–n OF total · PREV 1 2 3 NEXT" idiom from the Ink + Signal
	 * mockups. Controlled component: the parent owns `page` and slices its
	 * own list; this only renders the control and emits `onchange`.
	 */
	let {
		page = 1,
		perPage = 10,
		total = 0,
		onchange,
		label = 'entries',
		scrollTargetId
	}: {
		page?: number;
		perPage?: number;
		total?: number;
		onchange: (page: number) => void;
		/** Plural noun for the count readout, e.g. "publications". */
		label?: string;
		/** Optional element id to scroll to the top of on page change. */
		scrollTargetId?: string;
	} = $props();

	const totalPages = $derived(Math.max(1, Math.ceil(total / perPage)));
	const from = $derived(total === 0 ? 0 : (page - 1) * perPage + 1);
	const to = $derived(Math.min(page * perPage, total));

	// Windowed page numbers: first, last, and a ±1 band around the current
	// page, with `null` marking an elision gap.
	const pages = $derived.by<(number | null)[]>(() => {
		const tp = totalPages;
		if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1);
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- local dedup set, not reactive state
		const set = new Set<number>([1, tp, page, page - 1, page + 1]);
		if (page <= 3) [2, 3, 4].forEach((n) => set.add(n));
		if (page >= tp - 2) [tp - 1, tp - 2, tp - 3].forEach((n) => set.add(n));
		const sorted = [...set].filter((n) => n >= 1 && n <= tp).sort((a, b) => a - b);
		const out: (number | null)[] = [];
		let prev = 0;
		for (const n of sorted) {
			if (prev && n - prev > 1) out.push(null);
			out.push(n);
			prev = n;
		}
		return out;
	});

	function go(next: number) {
		const clamped = Math.min(Math.max(1, next), totalPages);
		if (clamped === page) return;
		onchange(clamped);
		if (scrollTargetId && typeof document !== 'undefined') {
			document
				.getElementById(scrollTargetId)
				?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}
</script>

{#if totalPages > 1}
	<nav class="pagination" aria-label="Pagination">
		<p class="pagination-status">
			Showing {from}–{to} of {total}
			{label}
		</p>
		<div class="pagination-controls">
			<button
				type="button"
				class="page-btn page-btn--step"
				disabled={page <= 1}
				onclick={() => go(page - 1)}
				aria-label="Previous page"
			>
				← Prev
			</button>
			{#each pages as p, i (p === null ? `gap-${i}` : p)}
				{#if p === null}
					<span class="page-gap" aria-hidden="true">…</span>
				{:else}
					<button
						type="button"
						class="page-btn"
						class:page-btn--current={p === page}
						aria-current={p === page ? 'page' : undefined}
						aria-label="Page {p}"
						onclick={() => go(p)}
					>
						{p}
					</button>
				{/if}
			{/each}
			<button
				type="button"
				class="page-btn page-btn--step page-btn--next"
				disabled={page >= totalPages}
				onclick={() => go(page + 1)}
				aria-label="Next page"
			>
				Next →
			</button>
		</div>
	</nav>
{/if}

<style>
	.pagination {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);
		justify-content: space-between;
		align-items: center;
		margin-top: var(--space-xl);
		padding-top: var(--space-md);
		border-top: var(--rule-hairline) solid var(--color-border);
	}

	/* Count readout — the data voice. */
	.pagination-status {
		margin: 0;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	.pagination-controls {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.page-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2.25rem;
		padding: var(--space-2) var(--space-2-5);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-soft);
		background: transparent;
		border: var(--rule-hairline) solid var(--color-border-dark);
		border-radius: 0;
		cursor: pointer;
		transition:
			color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.page-btn:hover:not(:disabled) {
		color: var(--color-accent);
		border-color: var(--color-accent);
	}

	/* Current page — solid ink fill, the way a selected chip reads. */
	.page-btn--current {
		color: var(--color-background);
		background: var(--color-primary);
		border-color: var(--color-primary);
		cursor: default;
	}

	.page-btn--current:hover {
		color: var(--color-background);
		border-color: var(--color-primary);
	}

	/* Next carries a full ink border to read as the forward affordance. */
	.page-btn--next:not(:disabled) {
		color: var(--color-text-emphasis);
		border-color: var(--color-primary);
	}

	.page-btn:disabled {
		color: var(--color-text-faint);
		cursor: not-allowed;
		opacity: 0.6;
	}

	.page-gap {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		color: var(--color-text-faint);
		padding: 0 var(--space-1);
	}

	@media (--sm-down) {
		.pagination {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-sm);
		}

		.pagination-controls {
			flex-wrap: wrap;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.page-btn {
			transition: none;
		}
	}
</style>
