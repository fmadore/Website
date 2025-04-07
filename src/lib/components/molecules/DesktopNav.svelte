<script lang="ts">
    import type { NavItem } from '$lib/types/navigation';
    import NavItemWithDropdown from '$lib/components/molecules/NavItemWithDropdown.svelte';
    
    export let navItems: NavItem[];
    export let activeDropdown: number | null = null;
    
    // Event handlers
    export let onMouseEnter: (index: number) => void;
    export let onMouseLeave: () => void;
    export let onFocusIn: (index: number) => void;
    export let onFocusOut: () => void;
    export let onKeyDown: (event: KeyboardEvent, index: number) => void;
    export let onDropdownItemClick: () => void;
</script>

<nav class="desktop-nav" aria-label="Main navigation">
    <ul class="nav-list">
        {#each navItems as item, i}
            <NavItemWithDropdown 
                {item}
                isActive={activeDropdown === i}
                index={i}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onFocusIn={onFocusIn}
                onFocusOut={onFocusOut}
                onKeyDown={onKeyDown}
                onDropdownItemClick={onDropdownItemClick}
            />
        {/each}
    </ul>
</nav>

<style>
    .desktop-nav {
        display: none;
    }
    
    .nav-list {
        display: flex;
        list-style: none;
        padding: 0;
        margin: 0;
        gap: var(--spacing-4);
    }
    
    @media (min-width: 1024px) {
        .desktop-nav {
            display: block;
        }
        
        .nav-list {
            gap: var(--spacing-6); /* Wider spacing on larger screens */
        }
    }
</style> 