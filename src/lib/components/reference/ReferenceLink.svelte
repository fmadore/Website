<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ReferenceIndexEntry } from '$lib/types/referenceIndex';

	let {
		item = undefined,
		itemType = undefined,
		id,
		label = undefined,
		hasPopup = false,
		isActive = false
	}: {
		item?: ReferenceIndexEntry | undefined;
		itemType?: 'publication' | 'communication' | undefined;
		id: string;
		label?: string;
		hasPopup?: boolean;
		isActive?: boolean;
	} = $props();

	// Helper to get year consistently
	function getYear(item: ReferenceIndexEntry): string {
		if ('dateISO' in item && item.dateISO) return item.dateISO.substring(0, 4);
		if ('date' in item && item.date) return item.date.substring(0, 4);
		if ('year' in item && item.year) return item.year.toString();
		return 'N/D';
	}

	// Helper to get author citation text
	function getAuthorCitation(item: ReferenceIndexEntry): string {
		const authors = item.authors;
		if (!authors || authors.length === 0) return 'N/A';

		// Get last names
		const lastNames = authors.map((author) => {
			if (typeof author === 'string') {
				return author.split(' ').pop() || 'N/A';
			}
			return 'N/A';
		});

		if (lastNames.length === 1) {
			return lastNames[0];
		} else if (lastNames.length === 2) {
			return `${lastNames[0]} and ${lastNames[1]}`;
		} else {
			return `${lastNames[0]} et al.`;
		}
	}

	const referenceText = $derived(
		label ? label : item ? `(${getAuthorCitation(item)}, ${getYear(item)})` : `(${id})`
	);

	const itemUrl = $derived(
		item && itemType
			? resolve(`/${itemType === 'publication' ? 'publications' : 'communications'}/${item.id}`)
			: '#'
	);

	const ariaLabel = $derived(
		item ? `View ${itemType || 'item'}: ${item.title}` : `Reference ${id}`
	);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- pre-resolved via resolve() -->
<a
	href={itemUrl}
	class="reference-link {hasPopup ? 'has-popup' : ''} {isActive ? 'is-active' : ''}"
	aria-label={ariaLabel}
	tabindex={hasPopup ? -1 : 0}
>
	{referenceText}
</a>

<!-- eslint-enable svelte/no-navigation-without-resolve -->

<style>
	/* An inline citation reads as text with a pine underline — the accent
	 * marking a link — not a tinted chip. Colour and underline only; no box,
	 * no fill, no shadow. */
	.reference-link {
		display: inline;
		position: relative;
		color: var(--color-accent);
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

	/* Hover / active — the underline firms up to full pine. */
	.reference-link:hover,
	.reference-link:focus-visible,
	.reference-link.is-active {
		color: var(--color-accent-dark);
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
