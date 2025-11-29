<script lang="ts">
	import { base } from '$app/paths';
	import type { Publication, Communication } from '$lib/types';

	let {
		item = undefined,
		itemType = undefined,
		id,
		hasPopup = false,
		isActive = false
	}: {
		item?: Publication | Communication | undefined;
		itemType?: 'publication' | 'communication' | undefined;
		id: string;
		hasPopup?: boolean;
		isActive?: boolean;
	} = $props();

	// Helper to get year consistently
	function getYear(item: Publication | Communication): string {
		if ('dateISO' in item && item.dateISO) return item.dateISO.substring(0, 4);
		if ('date' in item && item.date) return item.date.substring(0, 4);
		if ('year' in item && item.year) return item.year.toString();
		return 'N/D';
	}

	// Helper to get author citation text
	function getAuthorCitation(item: Publication | Communication): string {
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
		item ? `(${getAuthorCitation(item)}, ${getYear(item)})` : `(${id})`
	);

	const itemUrl = $derived(
		item && itemType
			? `${base}/${itemType === 'publication' ? 'publications' : 'communications'}/${item.id}`
			: '#'
	);

	const ariaLabel = $derived(
		item ? `View ${itemType || 'item'}: ${item.title}` : `Reference ${id}`
	);
</script>

<a
	href={itemUrl}
	class="reference-link {hasPopup ? 'has-popup' : ''} {isActive ? 'is-active' : ''}"
	aria-label={ariaLabel}
	tabindex={hasPopup ? -1 : 0}
>
	{referenceText}
</a>

<style>
	.reference-link {
		/* Blend with text flow - enhanced academic citation style */
		display: inline-block;
		position: relative;
		color: var(--color-primary);
		text-decoration: none;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		white-space: nowrap;
		padding: 0 var(--space-2xs);
		border-radius: var(--border-radius);
		/* Explicit transition properties for better performance */
		transition:
			color var(--duration-moderate) var(--ease-out),
			background-color var(--duration-moderate) var(--ease-out),
			border-color var(--duration-moderate) var(--ease-out),
			transform var(--duration-moderate) var(--ease-out),
			box-shadow var(--duration-moderate) var(--ease-out);

		/* Subtle background instead of underline */
		background-color: rgba(var(--color-primary-rgb), var(--opacity-10));
		border: var(--border-width-thin) solid transparent;
	}

	.reference-link.has-popup {
		cursor: pointer;
		pointer-events: auto;
	}

	/* Enhanced hover state */
	.reference-link:hover,
	.reference-link:focus-visible {
		color: var(--color-primary-dark);
		background-color: rgba(var(--color-primary-rgb), var(--opacity-15));
		border-color: rgba(var(--color-primary-rgb), var(--opacity-20));
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	/* Active/clicked state */
	.reference-link:active {
		transform: translateY(0);
		background-color: rgba(var(--color-primary-rgb), var(--opacity-20));
	}

	/* Focus state for accessibility */
	.reference-link:focus-visible {
		outline: var(--border-width-medium) solid rgba(var(--color-primary-rgb), var(--opacity-40));
		outline-offset: var(--space-2xs);
	}

	/* Dark mode - enhanced adjustments */
	:global(html.dark) .reference-link {
		color: var(--color-accent);
		background-color: rgba(var(--color-accent-rgb), var(--opacity-10));
	}

	:global(html.dark) .reference-link:hover,
	:global(html.dark) .reference-link:focus-visible {
		color: var(--color-accent);
		background-color: rgba(var(--color-accent-rgb), var(--opacity-20));
		border-color: rgba(var(--color-accent-rgb), var(--opacity-30));
		box-shadow: var(--shadow-sm);
	}

	/* Active state when preview is visible */
	.reference-link.is-active {
		color: var(--color-primary-dark);
		background-color: rgba(var(--color-primary-rgb), var(--opacity-20));
		border-color: rgba(var(--color-primary-rgb), var(--opacity-30));
		box-shadow: var(--shadow-sm);
	}

	/* Dark mode active state */
	:global(html.dark) .reference-link.is-active {
		color: var(--color-accent);
		background-color: rgba(var(--color-accent-rgb), var(--opacity-25));
		border-color: rgba(var(--color-accent-rgb), var(--opacity-40));
		box-shadow: var(--shadow-sm);
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.reference-link {
			transition: none;
		}

		.reference-link:hover {
			transform: none;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.reference-link {
			border-bottom-width: var(--border-width-medium);
			font-weight: var(--font-weight-semibold);
		}

		.reference-link:hover {
			text-decoration: underline;
		}
	}
</style>
