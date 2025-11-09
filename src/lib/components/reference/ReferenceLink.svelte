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
		display: inline;
		position: relative;
		color: var(--color-primary);
		text-decoration: none;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		white-space: nowrap;
		padding: 0 var(--spacing-1);
		border-radius: var(--border-radius-sm);
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

		/* Subtle background with sophisticated gradient */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.06) 0%,
			rgba(var(--color-accent-rgb), 0.03) 100%
		);

		/* Refined bottom border for academic feel */
		border-bottom: var(--border-width-thin) solid rgba(var(--color-primary-rgb), 0.25);
	}

	.reference-link.has-popup {
		cursor: pointer;
		pointer-events: auto;
	}

	/* Enhanced hover state with sophisticated glassmorphism */
	.reference-link:hover,
	.reference-link:focus-visible {
		color: var(--color-primary-dark);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.12) 0%,
			rgba(var(--color-accent-rgb), 0.08) 100%
		);
		border-bottom-color: rgba(var(--color-primary-rgb), 0.45);
		transform: translateY(-1px);
		box-shadow: 
			0 2px 8px rgba(var(--color-primary-rgb), 0.12),
			inset 0 1px 0 rgba(var(--color-white-rgb), 0.3);
	}

	/* Active/clicked state */
	.reference-link:active {
		transform: translateY(0);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.15) 0%,
			rgba(var(--color-accent-rgb), 0.1) 100%
		);
	}

	/* Focus state for accessibility */
	.reference-link:focus-visible {
		outline: var(--border-width-medium) solid rgba(var(--color-primary-rgb), 0.4);
		outline-offset: var(--spacing-1);
		border-radius: var(--border-radius-sm);
	}

	/* Dark mode - enhanced adjustments */
	:global(html.dark) .reference-link {
		color: var(--color-accent);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-accent-rgb), 0.04) 100%
		);
		border-bottom-color: rgba(var(--color-accent-rgb), 0.25);
	}

	:global(html.dark) .reference-link:hover,
	:global(html.dark) .reference-link:focus-visible {
		color: var(--color-accent);
		background: linear-gradient(
			135deg,
			rgba(var(--color-accent-rgb), 0.15) 0%,
			rgba(var(--color-primary-rgb), 0.08) 100%
		);
		border-bottom-color: rgba(var(--color-accent-rgb), 0.45);
		box-shadow: 
			0 2px 8px rgba(var(--color-accent-rgb), 0.15),
			inset 0 1px 0 rgba(var(--color-accent-rgb), 0.1);
	}

	/* Active state when preview is visible */
	.reference-link.is-active {
		color: var(--color-primary-dark);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.18) 0%,
			rgba(var(--color-accent-rgb), 0.12) 100%
		);
		border-bottom-color: rgba(var(--color-primary-rgb), 0.4);
		box-shadow: 
			0 2px 8px rgba(var(--color-primary-rgb), 0.15),
			inset 0 1px 0 rgba(var(--color-white-rgb), 0.3);
	}

	/* Dark mode active state */
	:global(html.dark) .reference-link.is-active {
		color: var(--color-accent);
		background: linear-gradient(
			135deg,
			rgba(var(--color-accent-rgb), 0.2) 0%,
			rgba(var(--color-primary-rgb), 0.12) 100%
		);
		border-bottom-color: rgba(var(--color-accent-rgb), 0.4);
		box-shadow: 
			0 2px 8px rgba(var(--color-accent-rgb), 0.2),
			inset 0 1px 0 rgba(var(--color-accent-rgb), 0.15);
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
