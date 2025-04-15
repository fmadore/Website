<script lang="ts">
    import NavLink from '$lib/components/atoms/NavLink.svelte';
    import DropdownMenu from '$lib/components/molecules/DropdownMenu.svelte';
    import type { NavItem } from '$lib/types/navigation';
    
    export let item: NavItem;
    export let isActive = false;
    export let index: number;
    
    // Events
    export let onMouseEnter: (index: number) => void;
    export let onMouseLeave: () => void;
    export let onFocusIn: (index: number) => void;
    export let onFocusOut: () => void;
    export let onKeyDown: (event: KeyboardEvent, index: number) => void;
    export let onDropdownItemClick: () => void;
</script>

<li class="nav-item dropdown-container">
    <div 
        class="dropdown-hover-wrapper"
        role="presentation"
        on:mouseenter={() => onMouseEnter(index)}
        on:mouseleave={onMouseLeave}
        on:focusin={() => onFocusIn(index)}
        on:focusout={onFocusOut}
    >
        <NavLink 
            href={item.path}
            hasDropdown={!!item.dropdown}
            aria-expanded={isActive ? "true" : "false"}
            on:keydown={(e) => onKeyDown(e, index)}
        >
            {item.name}
        </NavLink>
        {#if item.dropdown}
            <DropdownMenu 
                items={item.dropdown} 
                isActive={isActive}
                parentName={item.name}
                onItemClick={onDropdownItemClick}
            />
        {/if}
    </div>
</li>

<style>
    .dropdown-hover-wrapper {
        display: inline-block;
        position: relative;
        height: 100%;
    }
    
    /* Add a buffer zone below the nav link to prevent accidental dropdown closing */
    .dropdown-hover-wrapper::after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 0;
        width: 100%;
        height: 10px;
        background: transparent;
    }
    
    /* Ensure the nav item is properly positioned for its dropdown */
    .nav-item {
        position: relative;
        display: inline-block;
    }
    
    /* Override any global styles that might conflict with dropdown positioning */
    :global(.dropdown-container .dropdown-menu) {
        z-index: 1000;
    }
</style>