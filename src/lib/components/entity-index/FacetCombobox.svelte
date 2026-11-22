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
	import { typesetQuotes } from '#lib/utils/typesetQuotes.ts';
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
			aria-multiselectable="true"
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

<style>
	/* ===========================================================================
	 * FACET COMBOBOX — a typed way into a facet too long to print
	 *
	 * Scoped to this component, its one consumer, rather than set in the global
	 * idiom sheet, which is inlined into every prerendered page.
	 *
	 * The chip row and the facet ledger both lay every value out, which is right
	 * for a closed list (nine countries, six types) and wrong for an open one: the
	 * publications tag facet holds 95 values and the co-author facet 60. Printing
	 * those grew the page by a screen and a half while the neighbouring facet
	 * columns sat empty.
	 *
	 * So the head of the facet stays printed — the frequency-ranked top twelve,
	 * real data as ornament — and the tail is reached by typing. The field is
	 * machine-facing, so it takes the data voice and mirrors `.pub-search`: square,
	 * 1px edge, accent edge on focus. The listbox is a PLATE, not a floating card:
	 * paper ground, 1px border, square corners, no shadow. It overlays what follows
	 * (which is the point — nothing below it moves) and each row is a ledger line,
	 * serif name left, mono count right, hairline between.
	 * =========================================================================== */

	.facet-combobox {
		position: relative;
		margin-top: var(--space-2);
	}

	.facet-combobox-field {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-2);
		border: var(--border-width-thin) solid var(--color-border);
		background: var(--color-surface);
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.facet-combobox-field:focus-within {
		border-color: var(--color-accent);
	}

	.facet-combobox-icon {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		line-height: 1;
		color: var(--color-text-light);
	}

	.facet-combobox-input {
		flex: 1;
		min-width: 0;
		/* WCAG 2.5.8 asks 24px; a coarse pointer gets the 44px guideline below. */
		min-height: 24px;
		padding: 0;
		border: none;
		background: transparent;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--color-text-emphasis);
	}

	.facet-combobox-input::placeholder {
		color: var(--color-text-light);
		text-transform: uppercase;
	}

	/* The field's own edge is the focus indicator (see :focus-within above), so the
	 * input inside it does not draw a second ring around the same box. */
	.facet-combobox-input:focus {
		outline: none;
	}

	.facet-combobox-panel {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		z-index: var(--z-dropdown);
		/* Collapse the plate edge onto the field edge, so the two boxes read as one
		 * drawn object rather than as two stacked rules. */
		margin-top: calc(-1 * var(--border-width-thin));

		border: var(--border-width-thin) solid var(--color-border);
		/* The same ground as the field above it, so the two read as one drawn
		 * object. It must also stay one step off --color-background-muted, which
		 * marks the hovered/virtually-focused row: in midnight the raised and muted
		 * surfaces resolve to the same film step, and a plate drawn on that step
		 * would swallow its own selection. */
		background: var(--color-surface);
	}

	.facet-combobox-panel[hidden] {
		display: none;
	}

	.facet-combobox-list {
		/* The controlled listbox owns scrolling; keyboard focus stays in its input. */
		max-height: 17rem;
		overflow-y: auto;
		overscroll-behavior: contain;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	/* A ledger line, operable: marker, serif name, mono count. */
	.facet-combobox-option {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1-5) var(--space-2);
		cursor: pointer;
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		line-height: var(--line-height-snug);
		color: var(--color-text-soft);
		transition:
			background var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.facet-combobox-option + .facet-combobox-option {
		border-top: var(--rule-hairline) solid var(--color-hairline);
	}

	.facet-combobox-option:hover,
	.facet-combobox-option--virtual {
		background: var(--color-background-muted);
		color: var(--color-text-emphasis);
	}

	.facet-combobox-option[aria-selected='true'] {
		color: var(--color-accent);
		font-weight: var(--font-weight-medium);
	}

	/* Same square marker the projects facet uses — filled solid ink when on, the
	 * swap a selected chip makes. A selection is not "the current thing": a facet
	 * ledger can hold a dozen of them at once, and pine is scarce by rule. */
	.facet-combobox-mark {
		flex: 0 0 auto;
		width: 9px;
		height: 9px;
		border: var(--border-width-thin) solid var(--color-border-dark);
		background: transparent;
		transition:
			background var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.facet-combobox-mark--on {
		background: var(--color-primary);
		border-color: var(--color-primary);
	}

	.facet-combobox-name {
		flex: 1;
		min-width: 0;
		overflow-wrap: break-word;
	}

	.facet-combobox-count {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		color: var(--color-text-muted);
		text-align: right;
	}

	.facet-combobox-empty {
		margin: 0;
		padding: var(--space-2);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	@media (--touch) {
		.facet-combobox-input {
			min-height: 44px;
		}

		/* Eight rows at 44px overflow a phone, so the plate takes half the viewport
		 * and scrolls — still the whole facet, still nothing displaced below it. */
		.facet-combobox-panel {
			max-height: 50vh;
		}

		.facet-combobox-option {
			padding: var(--space-2-5) var(--space-2);
			min-height: 44px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.facet-combobox-field,
		.facet-combobox-option,
		.facet-combobox-mark {
			transition: none;
		}
	}
</style>
