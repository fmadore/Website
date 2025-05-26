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
		font-weight: 500;
		padding: 2px 6px;
		border-radius: var(--border-radius);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08),
			rgba(var(--color-primary-rgb), 0.12)
		);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
		pointer-events: none; /* Let parent span handle interactions */
		box-shadow:
			0 1px 3px rgba(var(--color-primary-rgb), 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.reference-link::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.05),
			rgba(var(--color-accent), 0.05)
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
		transform: translateY(-1px);
		box-shadow:
			0 4px 12px rgba(var(--color-primary-rgb), 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		border-color: rgba(var(--color-primary-rgb), 0.3);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.12),
			rgba(var(--color-primary-rgb), 0.16)
		);
	}

	.reference-link.has-popup:hover::before,
	.reference-link.has-popup:focus::before {
		opacity: 1;
	}

	.reference-link.has-popup:active {
		transform: translateY(0);
		box-shadow:
			0 2px 6px rgba(var(--color-primary-rgb), 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	/* Dark mode styles */
	:global(html.dark) .reference-link {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.15),
			rgba(var(--color-primary-rgb), 0.2)
		);
		border-color: rgba(var(--color-primary-rgb), 0.3);
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	:global(html.dark) .reference-link.has-popup:hover,
	:global(html.dark) .reference-link.has-popup:focus {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.2),
			rgba(var(--color-primary-rgb), 0.25)
		);
		border-color: rgba(var(--color-primary-rgb), 0.4);
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	/* Focus ring */
	.reference-link:focus {
		outline: 2px solid rgba(var(--color-primary-rgb), 0.5);
		outline-offset: 2px;
	}

	/* Micro-animations */
	@keyframes shimmer {
		0% {
			background-position: -200% center;
		}
		100% {
			background-position: 200% center;
		}
	}

	.reference-link.has-popup:hover {
		animation: none;
		background-size: 200% 100%;
	}
</style>
