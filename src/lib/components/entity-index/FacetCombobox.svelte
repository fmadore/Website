<script lang="ts">
	/**
	 * Facet combobox — a typed way into a facet too long to lay out.
	 *
	 * The tag column carried 95 values and the co-author column 60. Expanding
	 * either dumped the whole list into one grid cell, growing the page by a
	 * screen and a half while the three neighbouring columns sat empty. The
	 * field replaces that: the top values stay printed as the frequency-ranked
	 * head of the column (real data as ornament), and the long tail is reached
	 * by typing, in a listbox that overlays what follows instead of displacing
	 * it.
	 *
	 * WAI-ARIA editable combobox with list autocomplete: the input owns the
	 * keyboard, `aria-activedescendant` moves the selection without moving DOM
	 * focus, and the listbox stays open across picks because multi-select is the
	 * norm here — a reader narrows by three tags, not by one.
	 *
	 * Each row is a ledger line — serif name left, mono count right, hairline
	 * between — so the overlay reads as the same apparatus as the facet columns
	 * it hangs under, not as an app dropdown. Styles: `.facet-combobox-*` in
	 * `src/styles/components/ink-signal.css`.
	 *
	 * Labels are typeset at render time; the RAW value stays the toggle key, so
	 * URL sync and `?tag=` deep links keep matching the data.
	 */
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
	import { matchFacetOptions } from './facetSearch';

	interface Props {
		/** The full option universe for this facet, as raw data values. */
		options: string[];
		/** Live disjunctive facet counts, keyed by raw value. */
		counts: Record<string, number>;
		/** Currently selected raw values. */
		selected: string[];
		/** The facet as a plural noun — "tags", "co-authors". */
		label: string;
		/** Toggles one raw value. Focus stays in the field, the list stays open. */
		ontoggle: (value: string) => void;
	}

	let { options, counts, selected, label, ontoggle }: Props = $props();

	// Per-instance id: two comboboxes sit in one grid, and colliding option ids
	// would make `aria-activedescendant` ambiguous.
	const uid = $props.id();
	const listId = `${uid}-listbox`;
	const optionId = (index: number) => `${uid}-option-${index}`;

	let query = $state('');
	let open = $state(false);
	/** Index into `matches` of the virtually focused row; -1 for none. */
	let activeIndex = $state(-1);
	let root = $state<HTMLElement>();
	let input = $state<HTMLInputElement>();
	let list = $state<HTMLElement>();

	const matches = $derived(matchFacetOptions(options, query, counts));
	/** Rendered rows: the closed list is deliberately empty (see the markup). */
	const rows = $derived(open ? matches : []);
	const fieldLabel = $derived(`Find among ${options.length} ${label}`);
	const activeId = $derived(
		open && activeIndex >= 0 && activeIndex < matches.length ? optionId(activeIndex) : undefined
	);

	// Keep the virtually focused row in view when the keyboard walks past the
	// scroll edge. `block: 'nearest'` scrolls the listbox, never the page.
	$effect(() => {
		if (!activeId) return;
		list?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
	});

	function close() {
		open = false;
		activeIndex = -1;
	}

	/** Moves the virtual focus, opening the list first if it was closed. */
	function move(delta: number) {
		open = true;
		const count = matches.length;
		if (count === 0) {
			activeIndex = -1;
			return;
		}
		activeIndex =
			activeIndex < 0 ? (delta > 0 ? 0 : count - 1) : (activeIndex + delta + count) % count;
	}

	function pick(value: string) {
		ontoggle(value);
		// Multi-select: the field keeps focus and the list keeps its query, so
		// the next pick is one keystroke away.
		input?.focus();
	}

	function handleKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				move(1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				move(-1);
				break;
			case 'Home':
				if (open && matches.length > 0) {
					event.preventDefault();
					activeIndex = 0;
				}
				break;
			case 'End':
				if (open && matches.length > 0) {
					event.preventDefault();
					activeIndex = matches.length - 1;
				}
				break;
			case 'Enter': {
				// The active option wins; with none, a typed query commits its top
				// match — what a scholar who typed `cote` and hit Enter meant.
				const value =
					activeIndex >= 0
						? matches[activeIndex]
						: open && query.trim() && matches.length > 0
							? matches[0]
							: undefined;
				if (value !== undefined) {
					event.preventDefault();
					pick(value);
				}
				break;
			}
			case 'Escape':
				// Closes and clears in one stroke: with the list gone the query
				// narrows nothing, so leaving it behind would only mislead.
				event.preventDefault();
				query = '';
				close();
				break;
			case 'Tab':
				close();
				break;
		}
	}

	/** Closes on click-outside and on tabbing away; a pick never blurs. */
	function handleFocusOut(event: FocusEvent) {
		const next = event.relatedTarget as Node | null;
		if (next && root?.contains(next)) return;
		close();
	}
</script>

<div class="facet-combobox" bind:this={root} onfocusout={handleFocusOut}>
	<div class="facet-combobox-field">
		<span class="facet-combobox-icon" aria-hidden="true">⌕</span>
		<input
			bind:this={input}
			bind:value={query}
			class="facet-combobox-input"
			type="text"
			role="combobox"
			autocomplete="off"
			spellcheck="false"
			aria-expanded={open}
			aria-controls={listId}
			aria-autocomplete="list"
			aria-activedescendant={activeId}
			aria-label={fieldLabel}
			placeholder="Type to find…"
			onfocus={() => (open = true)}
			onclick={() => (open = true)}
			oninput={() => {
				open = true;
				activeIndex = -1;
			}}
			onkeydown={handleKeydown}
		/>
	</div>

	<div class="facet-combobox-panel" hidden={!open}>
		<ul
			bind:this={list}
			id={listId}
			class="facet-combobox-list"
			role="listbox"
			aria-label="Matching {label}"
		>
			<!-- Populated only while open: the closed list is an empty box the
			     field can keep pointing `aria-controls` at, not 95 hidden rows. -->
			{#each rows as option, index (option)}
				{@const on = selected.includes(option)}
				<!-- No key handler on the row by design: the input owns the keyboard
				     for the whole widget, which is exactly what the APG pattern's
				     `aria-activedescendant` is for. -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<li
					id={optionId(index)}
					class="facet-combobox-option"
					class:facet-combobox-option--virtual={index === activeIndex}
					role="option"
					aria-selected={on}
					onmousedown={(event) => event.preventDefault()}
					onclick={() => pick(option)}
				>
					<span class="facet-combobox-mark" class:facet-combobox-mark--on={on} aria-hidden="true"
					></span>
					<span class="facet-combobox-name">{typesetQuotes(option)}</span>
					<span class="facet-combobox-count">{counts[option] ?? 0}</span>
				</li>
			{/each}
		</ul>
		{#if open && matches.length === 0}
			<p class="facet-combobox-empty" role="status">No {label} match “{query}”.</p>
		{/if}
	</div>
</div>
