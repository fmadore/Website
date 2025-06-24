<script lang="ts">
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/atoms/Button.svelte'; // Import the Button component

	interface Props {
		activeSort?: 'date' | 'title' | 'citations'; // Default sort
		onsortchange?: (data: { sortBy: 'date' | 'title' | 'citations' }) => void; // Svelte 5: callback prop
		availableSorts?: ('date' | 'title' | 'citations')[]; // Which sort options are available
	}

	let { activeSort = 'date', onsortchange, availableSorts = ['date', 'title', 'citations'] }: Props = $props();

	function toggleSort() {
		// Find the current index in the available sorts array
		const currentIndex = availableSorts.indexOf(activeSort);
		// Get the next index, wrapping around to 0 if we're at the end
		const nextIndex = (currentIndex + 1) % availableSorts.length;
		const newSort = availableSorts[nextIndex];
		
		onsortchange?.({ sortBy: newSort });
	}

	// Determine button text and title based on the *current* sort state for display
	let iconName = $derived(
		activeSort === 'date' ? 'lucide:arrow-down-wide-narrow' : activeSort === 'title' ? 'lucide:arrow-down-a-z' : 'lucide:trending-up'
	);
	let labelText = $derived(
		activeSort === 'date'
			? 'Sorted by Date'
			: activeSort === 'title'
				? 'Sorted A-Z'
				: 'Sorted by Citations'
	);
	
	// Dynamic aria title based on available sorts
	let ariaTitle = $derived((() => {
		const currentIndex = availableSorts.indexOf(activeSort);
		const nextIndex = (currentIndex + 1) % availableSorts.length;
		const nextSort = availableSorts[nextIndex];
		
		const sortLabels = {
			date: 'Date (Newest First)',
			title: 'Title (A-Z)',
			citations: 'Citations (Most Cited)'
		};
		
		const currentLabel = sortLabels[activeSort];
		const nextLabel = sortLabels[nextSort];
		
		return `Current sort: ${currentLabel}. Click to sort by ${nextLabel}.`;
	})());
</script>

<div class="sorter">
	<Button
		variant="outline-primary"
		size="sm"
		onclick={toggleSort}
		ariaLabel={ariaTitle}
		title={ariaTitle}
		additionalClasses="control-button-rounded"
	>
		{#snippet icon()}
			<Icon icon={iconName} width="18" height="18" />
		{/snippet}
		{labelText}
	</Button>
</div>

<style>
	/* Add scoped element for Svelte compiler */
	.sorter {
		display: contents; /* Won't affect layout */
	}

	/* The .control-button-rounded styles are now handled globally 
       via src/styles/components/buttons.css and imported in app.css */
</style>
