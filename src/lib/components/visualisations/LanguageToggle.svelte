<script module lang="ts">
	export type Lang = 'all' | 'en' | 'fr';

	export type LanguageOption = { value: Lang; label: string; count: number };

	/**
	 * The options a corpus actually offers.
	 *
	 * A three-way toggle drawn over a corpus with one language in it is three
	 * buttons for one answer: two of them are dead and the third repeats the
	 * default. So the list is derived from the counts — a language appears only
	 * when it has works, and `All` appears only when there is something for it
	 * to be the alternative to. Exported so a call site can ask how many options
	 * there are and drop the control rather than render a control of one.
	 */
	export function languageToggleOptions(enCount: number, frCount: number): LanguageOption[] {
		const languages: LanguageOption[] = [];
		if (enCount > 0) languages.push({ value: 'en', label: 'English', count: enCount });
		if (frCount > 0) languages.push({ value: 'fr', label: 'French', count: frCount });
		if (languages.length < 2) return languages;
		return [{ value: 'all', label: 'All', count: enCount + frCount }, ...languages];
	}
</script>

<script lang="ts">
	/**
	 * Three-way All / English / French toggle used by the corpus word-cloud
	 * and bigrams sections of the publications visualisations page.
	 *
	 * It is a facet control, so it is the house chip: 1px border unselected,
	 * **solid ink** selected. It used to fill pine, which made it the only chip
	 * on the site to do so and spent the accent on a filter that is on by
	 * default — pine marks the current thing, and "All" is not it.
	 *
	 * Two-way bind via $bindable: `<LanguageToggle bind:current={...} ... />`.
	 */
	let {
		current = $bindable<Lang>('all'),
		enCount,
		frCount,
		label = 'Language'
	}: {
		current?: Lang;
		enCount: number;
		frCount: number;
		label?: string;
	} = $props();

	const options = $derived(languageToggleOptions(enCount, frCount));
</script>

<div class="language-toggle">
	<span class="toggle-label">{label}</span>
	<div class="chip-row toggle-buttons">
		{#each options as option (option.value)}
			<button
				type="button"
				class="chip toggle-btn"
				class:chip--selected={current === option.value}
				aria-pressed={current === option.value}
				onclick={() => (current = option.value)}
			>
				{option.label}
				<span class="chip-count">{option.count}</span>
			</button>
		{/each}
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
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--color-text-light);
		font-weight: var(--font-weight-medium);
	}

	/*
	 * Segmented rather than spaced: the three options are one control, so they
	 * share a hairline instead of standing apart like independent facets.
	 */
	.toggle-buttons {
		gap: 0;
		margin-left: calc(-1 * var(--border-width-thin));
	}

	.toggle-btn {
		margin-left: calc(-1 * var(--border-width-thin));
		/* WCAG 2.5.8: the chip's own padding clears 24px, this holds the floor
		   when the label wraps to a shorter cell. */
		min-height: var(--space-6);
		padding-inline: var(--space-sm);
	}

	.toggle-btn:hover {
		z-index: 1;
	}

	.toggle-btn.chip--selected {
		z-index: 2;
	}

	@media (--sm-down) {
		.language-toggle {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-sm);
		}

		.toggle-btn {
			padding-inline: var(--space-2);
		}
	}
</style>
