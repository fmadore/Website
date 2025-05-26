<script lang="ts">
	import Icon from '@iconify/svelte'; // Import Iconify
	import Button from '$lib/components/atoms/Button.svelte'; // Import Button component

	interface Props {
		isToggled?: boolean;
		baseText?: string; // e.g., "Map", "Details"
		onclick?: () => void; // Svelte 5: callback prop instead of event dispatcher
	}

	let { isToggled = false, baseText = 'Toggle', onclick }: Props = $props();

	function handleClick() {
		onclick?.(); // Call the onclick callback if provided
	}

	// Determine label and aria information based on state
	let labelText = $derived((isToggled ? 'Hide' : 'Show') + ' ' + baseText);
	let ariaTitle = $derived(isToggled ? `Hide ${baseText}` : `Show ${baseText}`);
</script>

<Button
	variant="outline-primary"
	size="sm"
	onclick={handleClick}
	ariaLabel={ariaTitle}
	title={ariaTitle}
	additionalClasses="control-button-rounded"
>
	{#snippet icon()}
		<Icon icon="lucide:map" width="18" height="18" />
	{/snippet}
	{labelText}
</Button>

<!-- No local styles needed if btnClass uses global CSS -->
