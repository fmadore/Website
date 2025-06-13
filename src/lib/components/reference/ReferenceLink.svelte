<script lang="ts">
	import { base } from '$app/paths';
	import type { Publication, Communication } from '$lib/types';

	let {
		item = undefined,
		itemType = undefined,
		id,
		hasPopup = false
	}: {
		item?: Publication | Communication | undefined;
		itemType?: 'publication' | 'communication' | undefined;
		id: string;
		hasPopup?: boolean;
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
	class="reference-link"
	aria-label={ariaLabel}
	tabindex="-1"
	class:has-popup={hasPopup}
>
	{referenceText}
</a>

<style>
	.reference-link {
		position: relative;
		display: inline-block;
		color: var(--color-primary);
		text-decoration: none;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		padding: var(--spacing-1) var(--spacing-2);
		border-radius: var(--border-radius);
		pointer-events: none; /* Let parent span handle interactions */
		
		/* Using global glassmorphism values */
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		
		/* Using global opacity values */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
		
		/* Using global border system */
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), 0.2);
		
		/* Using global shadow system */
		box-shadow: var(--shadow-sm);
		
		/* Using global transition */
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.reference-link::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.03),
			rgba(var(--color-accent-rgb), 0.02)
		);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.reference-link.has-popup {
		cursor: pointer;
		pointer-events: auto;
	}

	.reference-link.has-popup:hover,
	.reference-link.has-popup:focus {
		transform: var(--transform-lift-md);
		
		/* Enhanced hover gradient using global values */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium-high)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-medium)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-low)) 100%
		);
		
		/* Enhanced hover border */
		border-color: rgba(var(--color-primary-rgb), 0.3);
		
		/* Enhanced hover shadow using global values */
		box-shadow: var(--shadow-lg);
	}

	.reference-link.has-popup:hover::before,
	.reference-link.has-popup:focus::before {
		opacity: 1;
	}

	.reference-link.has-popup:active {
		transform: translateY(0);
		box-shadow: var(--shadow);
	}

	/* Dark mode styles using global values */
	:global(html.dark) .reference-link {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium-high)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-medium)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-low)) 100%
		);
		
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), 0.3);
		box-shadow: var(--shadow-sm);
	}

	:global(html.dark) .reference-link.has-popup:hover,
	:global(html.dark) .reference-link.has-popup:focus {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.12) 0%,
			rgba(var(--color-primary-rgb), 0.10) 50%,
			rgba(var(--color-accent-rgb), 0.08) 100%
		);
		
		border-color: rgba(255, 255, 255, 0.15);
		
		box-shadow: 
			0 12px 40px 0 rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}

	/* Focus ring */
	.reference-link:focus {
		outline: 2px solid rgba(var(--color-primary-rgb), 0.5);
		outline-offset: 2px;
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.reference-link {
			transition: none;
		}
		
		.reference-link.has-popup:hover {
			transform: none;
		}
	}

	/* High contrast support */
	@media (prefers-contrast: high) {
		.reference-link {
			border-width: 2px;
		}
	}

	/* Backdrop filter fallback */
	@supports not (backdrop-filter: blur(4px)) {
		.reference-link {
			background: rgba(var(--color-primary-rgb), 0.1);
		}
		
		:global(html.dark) .reference-link {
			background: rgba(var(--color-primary-rgb), 0.15);
		}
	}
</style> 