<script lang="ts">
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/atoms/Button.svelte'; // Import the Button component

	interface Props {
		activeSort?: 'date' | 'title' | 'citations'; // Default sort
		onsortchange?: (data: { sortBy: 'date' | 'title' | 'citations' }) => void; // Svelte 5: callback prop
		availableSorts?: ('date' | 'title' | 'citations')[]; // Which sort options are available
		surface?: boolean; // Render on a flat surface tile
	}

	let {
		activeSort = 'date',
		onsortchange,
		availableSorts = ['date', 'title', 'citations'],
		// Glass retired for the flat redesign; the sorter is a square mono control.
		surface = false
	}: Props = $props();

	// Tactile click acknowledgment: when the active sort changes, briefly
	// add a class that runs a short scale pulse so the button itself reacts
	// (the list flip handles the items, this completes the loop).
	let isPulsing = $state(false);
	let pulseTimer: ReturnType<typeof setTimeout> | null = null;

	function triggerPulse() {
		isPulsing = true;
		if (pulseTimer !== null) clearTimeout(pulseTimer);
		pulseTimer = setTimeout(() => {
			isPulsing = false;
			pulseTimer = null;
		}, 220);
	}

	function toggleSort() {
		// Find the current index in the available sorts array
		const currentIndex = availableSorts.indexOf(activeSort);
		// Get the next index, wrapping around to 0 if we're at the end
		const nextIndex = (currentIndex + 1) % availableSorts.length;
		const newSort = availableSorts[nextIndex];

		triggerPulse();
		onsortchange?.({ sortBy: newSort });
	}

	// Determine button text and title based on the *current* sort state for display
	let iconName = $derived(
		activeSort === 'date'
			? 'lucide:arrow-down-wide-narrow'
			: activeSort === 'title'
				? 'lucide:arrow-down-a-z'
				: 'lucide:trending-up'
	);
	let labelText = $derived(
		activeSort === 'date'
			? 'Sorted by Date'
			: activeSort === 'title'
				? 'Sorted A-Z'
				: 'Sorted by Citations'
	);

	// Dynamic aria title based on available sorts
	let ariaTitle = $derived(
		(() => {
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
		})()
	);

	// Compute additional classes based on surface prop
	let additionalClasses = $derived(
		[surface ? 'surface-button' : '', 'sorter-button', isPulsing ? 'sorter-button--pulse' : '']
			.filter(Boolean)
			.join(' ')
	);
</script>

<div class="sorter">
	<Button
		variant="outline-primary"
		size="sm"
		onclick={toggleSort}
		ariaLabel={ariaTitle}
		title={ariaTitle}
		{additionalClasses}
		{surface}
	>
		{#snippet icon()}
			<Icon icon={iconName} width="18" height="18" />
		{/snippet}
		{labelText}
	</Button>
</div>

<style>
	/* Sorter container */
	.sorter {
		display: contents; /* Won't affect layout */
	}

	/* A flat square mono control. The sort label is chrome, so it reads in the
	 * DATA voice: mono caps, letterspaced. No shadow, no lift, no pulse. */
	:global(.sorter-button) {
		font-family: var(--font-family-mono);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		border-radius: 0 !important;
		box-shadow: none !important;
	}

	:global(.sorter-button:hover) {
		transform: none !important;
		box-shadow: none !important;
	}

	:global(.sorter-button:active) {
		transform: none !important;
	}

	/* The pulse class is retained as a JS hook but no longer animates — the
	 * redesign keeps controls still; the list's own reordering is the feedback. */
	:global(.sorter-button--pulse) {
		animation: none;
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		:global(.sorter-button) {
			transition: none;
		}
	}
</style>
