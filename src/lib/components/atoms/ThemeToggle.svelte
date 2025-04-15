<script lang="ts">
    import { theme, toggleTheme } from '$lib/stores/themeStore';
    import Icon from '@iconify/svelte';
    
    export let size = 20;
</script>

<button 
    class="theme-toggle" 
    on:click={toggleTheme}
    aria-label={$theme === 'light' ? "Switch to dark theme" : "Switch to light theme"}
>
    {#if $theme === 'light'}
        <Icon icon="mdi:moon-waning-crescent" width={size} height={size} />
    {:else}
        <Icon icon="mdi:white-balance-sunny" width={size} height={size} />
    {/if}
</button>

<style>
    .theme-toggle {
        background: none;
        border: none;
        cursor: pointer;
        padding: var(--spacing-1);
        color: var(--color-text);
        border-radius: 50%;
        transition: background-color 0.2s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
    }
    
    .theme-toggle:hover {
        background-color: var(--color-border);
    }
</style>