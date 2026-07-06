<script lang="ts">
	/**
	 * Three-way All / English / French toggle used by the corpus word-cloud
	 * and bigrams sections of the publications visualisations page.
	 *
	 * Two-way bind via $bindable: `<LanguageToggle bind:current={...} ... />`.
	 */
	type Lang = 'all' | 'en' | 'fr';

	let {
		current = $bindable<Lang>('all'),
		enCount,
		frCount,
		label = 'Filter by language:'
	}: {
		current?: Lang;
		enCount: number;
		frCount: number;
		label?: string;
	} = $props();

	const allCount = $derived(enCount + frCount);
</script>

<div class="language-toggle">
	<span class="toggle-label">{label}</span>
	<div class="toggle-buttons">
		<button
			class="toggle-btn {current === 'all' ? 'active' : ''}"
			onclick={() => (current = 'all')}
		>
			All ({allCount})
		</button>
		<button class="toggle-btn {current === 'en' ? 'active' : ''}" onclick={() => (current = 'en')}>
			English ({enCount})
		</button>
		<button class="toggle-btn {current === 'fr' ? 'active' : ''}" onclick={() => (current = 'fr')}>
			French ({frCount})
		</button>
	</div>
</div>

<style>
	.language-toggle {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-lg);
		flex-wrap: wrap;
	}

	.toggle-label {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		letter-spacing: var(--letter-spacing-wide);
		text-transform: uppercase;
		color: var(--color-text-light);
		font-weight: var(--font-weight-medium);
	}

	.toggle-buttons {
		display: flex;
		gap: 0;
		flex-wrap: wrap;
		/* Segmented control: shared hairline, no gaps between cells. */
		margin-left: calc(-1 * var(--border-width-thin));
	}

	.toggle-btn {
		padding: var(--space-xs) var(--space-md);
		border: var(--border-width-thin) solid var(--color-border);
		margin-left: calc(-1 * var(--border-width-thin));
		background-color: var(--color-surface-elevated);
		color: var(--color-text-soft);
		border-radius: 0;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		letter-spacing: var(--letter-spacing-wide);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.toggle-btn:hover:not(.active) {
		background-color: var(--color-surface);
		border-color: var(--color-accent);
		color: var(--color-text-emphasis);
		z-index: 1;
	}

	.toggle-btn.active {
		background-color: var(--color-accent);
		color: var(--color-text-inverted);
		border-color: var(--color-accent);
		z-index: 2;
	}

	@media (--sm-down) {
		.language-toggle {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-sm);
		}

		.toggle-btn {
			padding: var(--space-2xs) var(--space-sm);
			font-size: var(--font-size-xs);
		}
	}
</style>
