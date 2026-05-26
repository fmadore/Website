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
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		font-weight: var(--font-weight-medium);
	}

	.toggle-buttons {
		display: flex;
		gap: var(--space-xs);
		flex-wrap: wrap;
	}

	.toggle-btn {
		padding: var(--space-xs) var(--space-md);
		border: var(--border-width-thin) solid var(--color-border);
		background-color: var(--color-surface);
		color: var(--color-text);
		border-radius: var(--border-radius-full);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	.toggle-btn:hover:not(.active) {
		background-color: var(--color-surface-alt);
		border-color: var(--color-primary);
		transform: var(--transform-lift-sm);
	}

	.toggle-btn.active {
		background-color: var(--color-primary);
		color: var(--color-white);
		border-color: var(--color-primary);
		box-shadow: var(--shadow-sm);
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
