<script lang="ts">
	import { base } from '$app/paths';
	import type { Publication, Communication } from '$lib/types';
	import Button from '$lib/components/atoms/Button.svelte';

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

<Button
	href={itemUrl}
	variant="outline-primary"
	size="sm"
	glass={true}
	ariaLabel={ariaLabel}
	additionalClasses="reference-link {hasPopup ? 'has-popup' : ''}"
>
	{referenceText}
</Button>

<style>
	/* Minimal custom styling for reference-specific behavior */
	:global(.reference-link) {
		/* Let parent span handle interactions when hasPopup is true */
		pointer-events: none;
		
		/* Reference-specific sizing */
		font-size: var(--font-size-sm);
		padding: var(--spacing-1) var(--spacing-2);
	}

	:global(.reference-link.has-popup) {
		cursor: pointer;
		pointer-events: auto;
	}

	/* Enhanced hover effect for references with popup */
	:global(.reference-link.has-popup:hover) {
		transform: var(--transform-lift-md);
	}
</style> 