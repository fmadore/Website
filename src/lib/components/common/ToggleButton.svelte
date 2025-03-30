<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let isToggled: boolean = false;
    export let baseText: string = 'Toggle'; // e.g., "Map", "Details"
    // Allows passing specific button classes, defaults to secondary outline
    export let btnClass: string = 'btn btn-sm btn-outline-secondary'; 

    const dispatch = createEventDispatcher();

    function handleClick() {
        dispatch('toggle'); // Dispatch simple toggle event
    }
</script>

<button 
    class={btnClass} 
    on:click={handleClick}
>
    {isToggled ? 'Hide' : 'Show'} {baseText}
</button>

<!-- No local styles needed if btnClass uses global CSS --> 