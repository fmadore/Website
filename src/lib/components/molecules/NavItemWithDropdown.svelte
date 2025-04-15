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

<li 
    class="nav-item dropdown-container"
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
</li>

<style>
/* All dropdown and nav styles will be moved to menu.css for consistency */
</style>