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
		font-size: 0.9em;
		font-weight: 600;
		padding: 4px 8px;
		border-radius: var(--border-radius);
		pointer-events: none; /* Let parent span handle interactions */
		
		/* Reduced glassmorphism for better readability */
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		
		/* More subtle background for better text contrast */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-primary-rgb), 0.06) 50%,
			rgba(var(--color-accent-rgb), 0.04) 100%
		);
		
		/* Subtle border */
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		
		/* Reduced shadow for cleaner look */
		box-shadow: 
			0 2px 8px 0 rgba(31, 38, 135, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		
		/* Standard transition */
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
		transform: var(--transform-lift-sm, translateY(-2px));
		
		/* Enhanced hover gradient */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-primary-rgb), 0.06) 50%,
			rgba(var(--color-accent-rgb), 0.04) 100%
		);
		
		/* Enhanced hover border */
		border-color: rgba(255, 255, 255, 0.3);
		
		/* Enhanced hover shadow */
		box-shadow: 
			0 12px 40px 0 rgba(31, 38, 135, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.reference-link.has-popup:hover::before,
	.reference-link.has-popup:focus::before {
		opacity: 1;
	}

	.reference-link.has-popup:active {
		transform: translateY(0);
		box-shadow: 
			0 4px 16px 0 rgba(31, 38, 135, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	/* Dark mode styles */
	:global(html.dark) .reference-link {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.12) 0%,
			rgba(var(--color-primary-rgb), 0.10) 50%,
			rgba(var(--color-accent-rgb), 0.08) 100%
		);
		
		border: 1px solid rgba(var(--color-primary-rgb), 0.3);
		
		box-shadow: 
			0 2px 8px 0 rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
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