<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Map } from 'lucide-svelte'; // Import the Map icon
    import Button from '$lib/components/atoms/Button.svelte'; // Import Button component

    export let isToggled: boolean = false;
    export let baseText: string = 'Toggle'; // e.g., "Map", "Details"
    // Allows passing specific button classes, defaults to secondary outline
    // export let btnClass: string = 'btn btn-sm btn-outline-secondary'; 

    const dispatch = createEventDispatcher();

    function handleClick() {
        dispatch('toggle'); // Dispatch simple toggle event
    }

    // Determine label and aria information based on state
    $: labelText = (isToggled ? 'Hide' : 'Show') + ' ' + baseText;
    $: ariaTitle = isToggled ? `Hide ${baseText}` : `Show ${baseText}`;

</script>

<Button
    variant="outline-primary" 
    size="sm"
    on:click={handleClick}
    ariaLabel={ariaTitle}
    title={ariaTitle}
    additionalClasses="control-button-rounded"
>
    <svelte:fragment slot="icon">
         <Map size={18} />
    </svelte:fragment>
    {labelText}
</Button>

<style>
    :global(.control-button-rounded) {
       border-radius: var(--border-radius-md);
    }
    :global(.control-button-rounded:hover) {
       background-color: var(--color-primary);
       color: white;
    }
</style>

<!-- No local styles needed if btnClass uses global CSS --> 