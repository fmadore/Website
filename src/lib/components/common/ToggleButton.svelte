<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Map } from 'lucide-svelte'; // Import the Map icon
    import Button from '$lib/components/atoms/Button.svelte'; // Import Button component

    interface Props {
        isToggled?: boolean;
        baseText?: string; // e.g., "Map", "Details"
    }

    let { isToggled = false, baseText = 'Toggle' }: Props = $props();
    // Allows passing specific button classes, defaults to secondary outline
    // export let btnClass: string = 'btn btn-sm btn-outline-secondary'; 

    const dispatch = createEventDispatcher();

    function handleClick() {
        dispatch('toggle'); // Dispatch simple toggle event
    }

    // Determine label and aria information based on state
    let labelText = $derived((isToggled ? 'Hide' : 'Show') + ' ' + baseText);
    let ariaTitle = $derived(isToggled ? `Hide ${baseText}` : `Show ${baseText}`);

</script>

<Button
    variant="outline-primary" 
    size="sm"
    on:click={handleClick}
    ariaLabel={ariaTitle}
    title={ariaTitle}
    additionalClasses="control-button-rounded"
>
    {#snippet icon()}
    
             <Map size={18} />
        
    {/snippet}
    {labelText}
</Button>

<!-- No local styles needed if btnClass uses global CSS --> 