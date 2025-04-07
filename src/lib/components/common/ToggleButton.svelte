<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Map } from 'lucide-svelte'; // Import the Map icon

    export let isToggled: boolean = false;
    export let baseText: string = 'Toggle'; // e.g., "Map", "Details"
    // Allows passing specific button classes, defaults to secondary outline
    // export let btnClass: string = 'btn btn-sm btn-outline-secondary'; 

    const dispatch = createEventDispatcher();

    function handleClick() {
        dispatch('toggle'); // Dispatch simple toggle event
    }
</script>

<button 
    class="toggle-button btn btn-outline p-2 flex items-center space-x-1"
    on:click={handleClick}
    aria-label={isToggled ? `Hide ${baseText}` : `Show ${baseText}`}
    title={isToggled ? `Hide ${baseText}` : `Show ${baseText}`}
>
    <Map size={18} class="text-primary" />
    <span class="text-sm text-primary">{isToggled ? 'Hide' : 'Show'} {baseText}</span>
</button>

<!-- No local styles needed if btnClass uses global CSS --> 
<style>
    .toggle-button {
        border-radius: var(--border-radius-md);
        transition: all 0.2s ease;
    }
    .toggle-button:hover {
        background-color: var(--color-border-hover);
    }
    .text-primary {
        color: var(--color-primary);
    }
</style> 