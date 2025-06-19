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
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-medium));
		
		/* Using global shadow system */
		box-shadow: var(--shadow-sm);
		
		/* Using global transition */
		transition: all var(--anim-duration-base) var(--anim-ease-base);
	}

	.reference-link::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)),
			rgba(var(--color-accent-rgb), var(--opacity-very-low))
		);
		opacity: 0;
		transition: opacity var(--anim-duration-base) var(--anim-ease-out);
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
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium-high));
		
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
		
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-medium-high));
		box-shadow: var(--shadow-sm);
	}

	:global(html.dark) .reference-link.has-popup:hover,
	:global(html.dark) .reference-link.has-popup:focus {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium-high)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-medium)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-low)) 100%
		);
		
		border-color: rgba(var(--color-white-rgb), var(--opacity-medium));
		
		box-shadow: 
			var(--shadow-lg),
			inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), var(--opacity-medium));
	}

	/* Focus ring */
	.reference-link:focus {
		outline: var(--border-width-medium) solid rgba(var(--color-primary-rgb), var(--opacity-medium-high));
		outline-offset: var(--border-width-medium);
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
			border-width: var(--border-width-medium);
		}
	}

	/* Backdrop filter fallback */
	@supports not (backdrop-filter: blur(4px)) {
		.reference-link {
			background: rgba(var(--color-primary-rgb), var(--opacity-low));
		}
		
		:global(html.dark) .reference-link {
			background: rgba(var(--color-primary-rgb), var(--opacity-medium));
		}
	}
</style> 