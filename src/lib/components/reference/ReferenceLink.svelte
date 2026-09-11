<script lang="ts">
	import { resolve } from '$app/paths';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
	import type { ReferenceIndexEntry } from '$lib/types/referenceIndex';

	let {
		item,
		itemType,
		label = undefined,
		hasPopup = false,
		isActive = false,
		ariaExpanded = undefined,
		ariaControls = undefined,
		onclick = undefined,
		onkeydown = undefined,
		onfocus = undefined,
		onblur = undefined,
		onpointerenter = undefined,
		onpointerleave = undefined
	}: {
		// Both required: `<ItemReference>` renders this component only inside its
		// resolved branch, so there is no such thing here as a link to a record
		// the index does not hold. The `href="#"` / `(id)` fallback this used to
		// carry was unreachable, and printed a dead anchor if it ever was not.
		item: ReferenceIndexEntry;
		itemType: 'publication' | 'communication';
		label?: string;
		hasPopup?: boolean;
		isActive?: boolean;
		// When the link hosts a preview popup, the interaction attributes and
		// handlers live on the <a> itself (the single interactive control) so it
		// never nests inside a role="button" wrapper (WCAG 4.1.2).
		ariaExpanded?: boolean;
		ariaControls?: string;
		onclick?: (event: MouseEvent) => void;
		onkeydown?: (event: KeyboardEvent) => void;
		onfocus?: (event: FocusEvent) => void;
		onblur?: (event: FocusEvent) => void;
		onpointerenter?: (event: PointerEvent) => void;
		onpointerleave?: (event: PointerEvent) => void;
	} = $props();

	// Helper to get year consistently. An undated record prints the scholarly
	// abbreviation a reader already knows from any bibliography, not a form-field
	// placeholder: "(Madore, n.d.)", never "(Madore, N/D)".
	function getYear(item: ReferenceIndexEntry): string {
		if ('dateISO' in item && item.dateISO) return item.dateISO.substring(0, 4);
		if ('date' in item && item.date) return item.date.substring(0, 4);
		if ('year' in item && item.year) return item.year.toString();
		return 'n.d.';
	}

	// Helper to get author citation text. A record with no attributable author
	// yields an empty string and the citation drops the clause entirely — "N/A"
	// announced a database gap in the middle of a typeset sentence.
	function getAuthorCitation(item: ReferenceIndexEntry): string {
		const authors = item.authors;
		if (!authors || authors.length === 0) return '';

		// Get last names
		const lastNames = authors
			.map((author) => (typeof author === 'string' ? (author.split(' ').pop() ?? '') : ''))
			.filter(Boolean);

		if (lastNames.length === 0) {
			return '';
		} else if (lastNames.length === 1) {
			return lastNames[0] ?? '';
		} else if (lastNames.length === 2) {
			return `${lastNames[0]} and ${lastNames[1]}`;
		} else {
			return `${lastNames[0]} et al.`;
		}
	}

	/** "(Author, 2024)", "(2024)" with no author, "(n.d.)" with neither. */
	function inlineCitation(item: ReferenceIndexEntry): string {
		const authorClause = getAuthorCitation(item);
		const year = getYear(item);
		return authorClause ? `(${authorClause}, ${year})` : `(${year})`;
	}

	// The inline citation sits in running prose, so it takes the same register as
	// the sentence around it — "(N'Dri, 2024)" would otherwise be the one
	// straight apostrophe in a typeset paragraph.
	const referenceText = $derived(typesetQuotes(label ? label : inlineCitation(item)));

	const itemUrl = $derived(
		resolve(`/${itemType === 'publication' ? 'publications' : 'communications'}/${item.id}`)
	);

	// WCAG 2.5.3 (Label in Name): the accessible name must contain the visible
	// link text, so the label leads with referenceText before the full title.
	// "Communication" is the internal noun for the record; the reader is told
	// what they will land on, which is a talk.
	const kindNoun = $derived(itemType === 'communication' ? 'talk' : 'publication');
	const ariaLabel = $derived(`${referenceText}, view ${kindNoun}: ${typesetQuotes(item.title)}`);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- pre-resolved via resolve() -->
<!--
	`no-underline` opts out of the prose-link idiom, which this link always sits
	inside (a citation is only ever set in a sentence). The component draws its
	own, softer rule in the style block below — 55% pine at a 0.18em offset —
	and the idiom's 100% / 3px arm would otherwise overrule it. This is the
	opt-out working as designed, an apparatus link inside a prose container, and
	never a bare coloured word: the underline stays, it is just quieter.
-->
<a
	href={itemUrl}
	class="reference-link no-underline {hasPopup ? 'has-popup' : ''} {isActive ? 'is-active' : ''}"
	aria-label={ariaLabel}
	aria-haspopup={hasPopup ? 'dialog' : undefined}
	aria-expanded={hasPopup ? ariaExpanded : undefined}
	aria-controls={ariaControls}
	{onclick}
	{onkeydown}
	{onfocus}
	{onblur}
	{onpointerenter}
	{onpointerleave}
>
	{referenceText}
</a>

<!-- eslint-enable svelte/no-navigation-without-resolve -->

<style>
	/* An inline citation is a prose link with a softer rule: ink text like the
	 * sentence it sits in, marked by a pine underline held at 55% and set
	 * closer to the baseline than the prose idiom's — the citation is
	 * apparatus inside the sentence, and a run of them in one paragraph should
	 * not out-shout the paragraph. Pine arrives on hover, focus and while the
	 * preview is open. Colour and underline only; no box, no fill, no shadow.
	 *
	 * Its own decoration used to lose to the prose-link rule's 100% / 3px arm
	 * whenever the citation sat in a `<p>`; the idiom is opt-in by container
	 * now, and a component that writes its own underline keeps it. */
	.reference-link {
		display: inline;
		position: relative;
		color: var(--color-primary);
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, var(--color-accent) 55%, transparent);
		text-decoration-thickness: var(--border-width-thin);
		text-underline-offset: 0.18em;
		font-size: inherit;
		font-weight: var(--font-weight-medium);
		white-space: nowrap;
		transition:
			color var(--duration-fast) var(--ease-out),
			text-decoration-color var(--duration-fast) var(--ease-out);
	}

	.reference-link.has-popup {
		cursor: pointer;
		pointer-events: auto;
	}

	/* Hover / active — the text warms to pine and the underline firms up to
	 * full pine, the same response the prose-link idiom gives. */
	.reference-link:hover,
	.reference-link:focus-visible,
	.reference-link.is-active {
		color: var(--color-accent);
		text-decoration-color: var(--color-accent);
	}

	.reference-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-2xs);
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.reference-link {
			transition: none;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.reference-link {
			text-decoration-thickness: var(--border-width-medium);
			font-weight: var(--font-weight-semibold);
		}
	}
</style>
