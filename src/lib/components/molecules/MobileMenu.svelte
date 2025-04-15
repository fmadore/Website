<script lang="ts">
    import type { NavItem } from '$lib/types/navigation';
    import ThemeToggle from '$lib/components/atoms/ThemeToggle.svelte';
    import Icon from '@iconify/svelte';
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
                <Icon icon="mdi:close" width={20} height={20} />
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
                                    <a 
                                        href={subItem.path} 
                                        class="mobile-dropdown-link" 
                                        on:click={onCloseMenu}
                                        target={subItem.path.startsWith('http') ? '_blank' : null}
                                        rel={subItem.path.startsWith('http') ? 'noopener noreferrer' : null}
                                    >
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
        transition: transform 0.3s cubic-bezier(.4,0,.2,1), background-color 0.3s;
        overflow-y: auto;
        backdrop-filter: blur(4px);
        box-shadow: var(--shadow-lg);
        border-bottom-left-radius: var(--border-radius-xl);
        border-bottom-right-radius: var(--border-radius-xl);
    }
    
    .mobile-nav-container.active {
        transform: translateY(0);
    }
    
    .mobile-nav {
        padding: var(--spacing-4) var(--spacing-4) var(--spacing-8);
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
        border-bottom: 1px solid var(--color-border);
    }
    
    .mobile-site-title {
        font-size: var(--font-size-xl);
        font-weight: 700;
        color: var(--color-text);
        text-decoration: none;
        transition: color 0.2s;
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
        transition: background-color 0.2s;
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
        margin-bottom: var(--spacing-2);
        width: 100%;
    }
    
    .mobile-nav-link {
        display: block;
        font-size: var(--font-size-xl);
        font-weight: 600;
        color: var(--color-text);
        text-decoration: none;
        padding: var(--spacing-3) 0;
        border-radius: var(--border-radius-md);
        transition: background 0.2s, color 0.2s;
        width: 100%;
    }
    
    .mobile-nav-link:hover,
    .mobile-nav-link:active {
        background: var(--color-border);
        color: var(--color-primary);
    }
    
    .mobile-dropdown {
        list-style: none;
        padding: 0;
        margin-top: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        background: none;
        border-radius: 0;
        box-shadow: none;
        border: none;
        width: 100%;
        margin-left: 0;
        margin-right: 0;
    }
    
    .mobile-dropdown-item {
        margin-bottom: 0;
        width: 100%;
    }
    
    .mobile-dropdown-link {
        display: block;
        font-size: var(--font-size-base);
        color: var(--color-text);
        text-decoration: none;
        padding: var(--spacing-2) 0;
        border-radius: var(--border-radius-sm);
        transition: background 0.2s, color 0.2s;
        width: 100%;
        text-align: center;
    }
    
    .mobile-dropdown-link:hover,
    .mobile-dropdown-link:active {
        background: var(--color-border);
        color: var(--color-primary);
    }
    
    /* Divider between main links and dropdowns */
    .mobile-nav-item + .mobile-nav-item {
        border-top: 1px solid var(--color-border);
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
        border-bottom-left-radius: var(--border-radius-xl);
        border-bottom-right-radius: var(--border-radius-xl);
    }
    
    @media (min-width: 640px) {
        .mobile-nav {
            padding: var(--spacing-6) var(--spacing-12) var(--spacing-12);
        }
    }
</style>