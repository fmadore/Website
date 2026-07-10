<script lang="ts">
	import Icon from '@iconify/svelte'; // Import Iconify
	import Button from '$lib/components/atoms/Button.svelte'; // Import Button component

	interface Props {
		isToggled?: boolean;
		baseText?: string; // e.g., "Map", "Details"
		onclick?: () => void; // Svelte 5: callback prop instead of event dispatcher
		surface?: boolean; // Render on a flat surface tile
	}

	// Glass retired for the flat redesign; the toggle is a square mono control.
	let { isToggled = false, baseText = 'Toggle', onclick, surface = false }: Props = $props();

	function handleClick() {
		onclick?.(); // Call the onclick callback if provided
	}

	// Determine label and aria information based on state
	let labelText = $derived((isToggled ? 'Hide' : 'Show') + ' ' + baseText);
	let ariaTitle = $derived(isToggled ? `Hide ${baseText}` : `Show ${baseText}`);

	// Dynamically choose variant based on toggle state
	let buttonVariant = $derived<'primary' | 'outline-primary'>(
		isToggled ? 'primary' : 'outline-primary'
	);

	// Compute additional classes based on surface prop and toggle state
	let additionalClasses = $derived(
		surface
			? `surface-button toggle-button ${isToggled ? 'toggle-button-active' : ''}`
			: `toggle-button ${isToggled ? 'toggle-button-active' : ''}`
	);
</script>

<Button
	variant={buttonVariant}
	size="sm"
	onclick={handleClick}
	ariaLabel={ariaTitle}
	title={ariaTitle}
	{additionalClasses}
	{surface}
>
	{#snippet icon()}
		<Icon icon="lucide:map" width="18" height="18" />
	{/snippet}
	{labelText}
</Button>

<!-- This empty span ensures there's a scopable element for Svelte -->
<span class="toggle-button-styles" style="display: none;"></span>

<style>
	/* Scoped element to prevent warning */
	.toggle-button-styles {
		display: none !important;
	}

	/* A flat square mono control. The active state is carried by the Button's
	 * primary variant (ink fill); here we only enforce square corners, the mono
	 * data voice, and no shadow/lift/blur. */
	:global(.toggle-button) {
		font-family: var(--font-family-mono);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		border-radius: 0 !important;
		box-shadow: none !important;
	}

	:global(.toggle-button:hover) {
		transform: none !important;
		box-shadow: none !important;
	}

	:global(.toggle-button:active) {
		transform: none !important;
	}
</style>
