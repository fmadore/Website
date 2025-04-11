<script lang="ts">
    import type { NavItem } from '$lib/types/navigation';
    import ThemeToggle from '$lib/components/atoms/ThemeToggle.svelte';
    import { X } from 'lucide-svelte';
    import { base } from '$app/paths';
    
    export let navItems: NavItem[];
    export let isActive = false;
    export let onCloseMenu: () => void;
</script>

<div id="mobile-menu" class="mobile-nav-container" class:active={isActive}>
    <nav class="mobile-nav" aria-label="Mobile navigation">
        <!-- Mobile Menu Header -->
        <div class="mobile-nav-header">
            <ThemeToggle size={20} />
            
            <a href="{base}/" class="mobile-site-title" on:click={onCloseMenu}>
                Frédérick Madore
            </a>
            
            <button 
                class="mobile-close" 
                on:click={onCloseMenu}
                aria-label="Close navigation menu"
            >
                <span class="sr-only">Close</span>
                <X size={20} />
            </button>
        </div>

        <ul class="mobile-nav-list">
            {#each navItems as item}
                <li class="mobile-nav-item">
                    <a href={item.path} class="mobile-nav-link" on:click={onCloseMenu}>
                        {item.name}
                    </a>
                    
                    {#if item.dropdown}
                        <ul class="mobile-dropdown">
                            {#each item.dropdown as subItem}
                                <li class="mobile-dropdown-item">
                                    <a href={subItem.path} class="mobile-dropdown-link" on:click={onCloseMenu}>
                                        {subItem.name}
                                    </a>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </li>
            {/each}
        </ul>
    </nav>
</div>

<style>
    /* Mobile Menu */
    .mobile-nav-container {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 100%;
        background-color: var(--color-background);
        z-index: 200;
        transform: translateY(-100%);
        transition: transform 0.3s ease-in-out, background-color 0.3s ease;
        overflow-y: auto;
        backdrop-filter: blur(4px);
    }
    
    .mobile-nav-container.active {
        transform: translateY(0);
    }
    
    .mobile-nav {
        padding: var(--spacing-3) var(--spacing-4) var(--spacing-4);
        min-height: 100vh; /* Ensure minimum height */
        position: relative;
        z-index: 2; /* Above the overlay */
        display: flex;
        flex-direction: column;
    }
    
    .mobile-nav-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-6);
        position: sticky;
        top: 0;
        z-index: 3;
        padding: var(--spacing-3) 0;
        background-color: var(--color-background);
    }
    
    .mobile-site-title {
        font-size: var(--font-size-xl);
        font-weight: 700;
        color: var(--color-text);
        text-decoration: none;
        transition: color 0.2s ease;
        letter-spacing: -0.02em;
        text-align: center;
        flex: 1;
    }
    
    .mobile-site-title:hover {
        color: var(--color-primary);
    }
    
    .mobile-close {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text);
        padding: var(--spacing-2);
        border-radius: var(--border-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        transition: background-color 0.2s ease;
    }
    
    .mobile-close:hover {
        background-color: var(--color-border);
    }
    
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
    }
    
    .mobile-nav-list {
        list-style: none;
        padding: 0;
        margin: 0;
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        justify-content: center;
        flex: 1;
    }
    
    .mobile-nav-item {
        margin-bottom: var(--spacing-4);
    }
    
    .mobile-nav-link {
        display: block;
        font-size: var(--font-size-xl);
        font-weight: 600;
        color: var(--color-text);
        text-decoration: none;
        padding: var(--spacing-2) 0;
        transition: color 0.2s ease;
    }
    
    .mobile-nav-link:hover {
        color: var(--color-primary);
    }
    
    .mobile-dropdown {
        list-style: none;
        padding: 0;
        margin-top: var(--spacing-2);
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    .mobile-dropdown-item {
        margin-bottom: var(--spacing-2);
    }
    
    .mobile-dropdown-link {
        display: block;
        font-size: var(--font-size-base);
        color: var(--color-text);
        text-decoration: none;
        padding: var(--spacing-1) 0;
        transition: color 0.2s ease;
    }
    
    .mobile-dropdown-link:hover {
        color: var(--color-primary);
    }
    
    /* Overlay for mobile menu backdrop */
    /* Changed to ::after to appear behind the content */
    .mobile-nav-container::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--color-background);
        z-index: 1;
        pointer-events: none;
    }
    
    @media (min-width: 640px) {
        .mobile-nav {
            padding: var(--spacing-4) var(--spacing-8) var(--spacing-8);
        }
    }
</style> 