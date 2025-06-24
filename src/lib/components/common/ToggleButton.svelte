<script lang="ts">
	import Icon from '@iconify/svelte'; // Import Iconify
	import Button from '$lib/components/atoms/Button.svelte'; // Import Button component

	interface Props {
		isToggled?: boolean;
		baseText?: string; // e.g., "Map", "Details"
		onclick?: () => void; // Svelte 5: callback prop instead of event dispatcher
		glass?: boolean; // Enable glassmorphism effect
	}

	let { isToggled = false, baseText = 'Toggle', onclick, glass = true }: Props = $props();

	function handleClick() {
		onclick?.(); // Call the onclick callback if provided
	}

	// Determine label and aria information based on state
	let labelText = $derived((isToggled ? 'Hide' : 'Show') + ' ' + baseText);
	let ariaTitle = $derived(isToggled ? `Hide ${baseText}` : `Show ${baseText}`);

	// Compute additional classes based on glass prop and toggle state
	let additionalClasses = $derived(
		glass 
			? `glass-button toggle-button ${isToggled ? 'toggle-button-active' : ''}` 
			: `toggle-button ${isToggled ? 'toggle-button-active' : ''}`
	);
</script>

<Button
	variant="outline-primary"
	size="sm"
	onclick={handleClick}
	ariaLabel={ariaTitle}
	title={ariaTitle}
	{additionalClasses}
	glass={glass}
>
	{#snippet icon()}
		<Icon icon="lucide:map" width="18" height="18" />
	{/snippet}
	{labelText}
</Button>

<style>
	/* Enhanced toggle button styling that integrates with glassmorphism */
	:global(.toggle-button) {
		/* Use CSS variables for consistent spacing and typography */
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--letter-spacing-wide);
		transition: all var(--transition-duration-200) var(--transition-ease-out);
		
		/* Enhanced border radius for better visual appeal */
		border-radius: var(--border-radius-lg) !important;
		
		/* Subtle shadow for depth */
		box-shadow: var(--shadow-sm);
	}

	:global(.toggle-button:hover) {
		/* Enhanced hover effect */
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-md);
	}

	:global(.toggle-button:active) {
		/* Subtle press effect */
		transform: scale(var(--scale-95));
		transition-duration: var(--transition-duration-75);
	}

	/* Active state styling */
	:global(.toggle-button-active) {
		background-color: var(--color-primary) !important;
		color: var(--color-white) !important;
		border-color: var(--color-primary) !important;
		box-shadow: 
			var(--shadow-md),
			0 0 0 var(--border-width-thin) rgba(var(--color-primary-rgb), var(--opacity-medium));
	}

	:global(.toggle-button-active:hover) {
		background-color: var(--color-primary-dark) !important;
		border-color: var(--color-primary-dark) !important;
		box-shadow: 
			var(--shadow-lg),
			0 0 0 var(--border-width-medium) rgba(var(--color-primary-rgb), var(--opacity-medium-high));
	}

	/* Enhanced glassmorphism integration */
	:global(.toggle-button.glass-button) {
		/* Additional glassmorphism enhancements for the toggle button */
		backdrop-filter: blur(var(--glass-blur-amount)) saturate(150%);
		-webkit-backdrop-filter: blur(var(--glass-blur-amount)) saturate(150%);
		
		/* Subtle gradient overlay for better visual hierarchy */
		background-image: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-highlight-rgb), 0.02) 100%
		);
	}

	:global(.toggle-button.glass-button:hover) {
		/* Enhanced hover state for glassmorphism */
		background-image: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 100%
		);
	}

	/* Glassmorphism active state */
	:global(.toggle-button-active.glass-button) {
		background-image: linear-gradient(
			135deg,
			var(--color-primary) 0%,
			color-mix(in srgb, var(--color-primary) 90%, var(--color-highlight)) 100%
		) !important;
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
	}

	:global(.toggle-button-active.glass-button:hover) {
		background-image: linear-gradient(
			135deg,
			var(--color-primary-dark) 0%,
			color-mix(in srgb, var(--color-primary-dark) 90%, var(--color-highlight)) 100%
		) !important;
	}

	/* Dark mode enhancements */
	:global(html.dark .toggle-button.glass-button) {
		background-image: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 100%
		);
	}

	:global(html.dark .toggle-button.glass-button:hover) {
		background-image: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-low)) 100%
		);
	}

	:global(html.dark .toggle-button-active) {
		background-color: var(--color-primary) !important;
		border-color: var(--color-primary) !important;
		color: var(--color-background) !important;
	}

	:global(html.dark .toggle-button-active:hover) {
		background-color: var(--color-primary-dark) !important;
		border-color: var(--color-primary-dark) !important;
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		:global(.toggle-button) {
			transition: none;
		}
		
		:global(.toggle-button:hover) {
			transform: none;
		}
		
		:global(.toggle-button:active) {
			transform: none;
		}
	}
</style>
