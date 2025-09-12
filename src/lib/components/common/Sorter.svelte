<script lang="ts">
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/atoms/Button.svelte'; // Import the Button component

	interface Props {
		activeSort?: 'date' | 'title' | 'citations'; // Default sort
		onsortchange?: (data: { sortBy: 'date' | 'title' | 'citations' }) => void; // Svelte 5: callback prop
		availableSorts?: ('date' | 'title' | 'citations')[]; // Which sort options are available
		glass?: boolean; // Enable glassmorphism effect
	}

	let {
		activeSort = 'date',
		onsortchange,
		availableSorts = ['date', 'title', 'citations'],
		glass = true
	}: Props = $props();

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

	// Compute additional classes based on glass prop
	let additionalClasses = $derived(glass ? 'glass-button sorter-button' : 'sorter-button');
</script>

<div class="sorter">
	<Button
		variant="outline-primary"
		size="sm"
		onclick={toggleSort}
		ariaLabel={ariaTitle}
		title={ariaTitle}
		{additionalClasses}
		{glass}
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

	/* Enhanced sorter button styling that integrates with glassmorphism */
	:global(.sorter-button) {
		/* Use CSS variables for consistent spacing and typography */
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--letter-spacing-wide);
		transition: all var(--transition-duration-200) var(--transition-ease-out);

		/* Enhanced border radius for better visual appeal */
		border-radius: var(--border-radius-lg) !important;

		/* Subtle shadow for depth */
		box-shadow: var(--shadow-sm);
	}

	:global(.sorter-button:hover) {
		/* Enhanced hover effect with glassmorphism */
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-md);
	}

	:global(.sorter-button:active) {
		/* Subtle press effect */
		transform: scale(var(--scale-95));
		transition-duration: var(--transition-duration-75);
	}

	/* Enhanced glassmorphism integration */
	:global(.sorter-button.glass-button) {
		/* Additional glassmorphism enhancements for the sorter */
		backdrop-filter: blur(var(--glass-blur-amount)) saturate(150%);
		-webkit-backdrop-filter: blur(var(--glass-blur-amount)) saturate(150%);

		/* Subtle gradient overlay for better visual hierarchy */
		background-image: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-highlight-rgb), 0.02) 100%
		);
	}

	:global(.sorter-button.glass-button:hover) {
		/* Enhanced hover state for glassmorphism */
		background-image: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 100%
		);
	}

	/* Dark mode enhancements */
	:global(html.dark .sorter-button.glass-button) {
		background-image: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 100%
		);
	}

	:global(html.dark .sorter-button.glass-button:hover) {
		background-image: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-low)) 100%
		);
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		:global(.sorter-button) {
			transition: none;
		}

		:global(.sorter-button:hover) {
			transform: none;
		}

		:global(.sorter-button:active) {
			transform: none;
		}
	}
</style>
