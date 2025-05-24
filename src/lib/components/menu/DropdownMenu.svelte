<script lang="ts">
    import type { NavItem } from '$lib/types/navigation';
    
    export let items: NavItem[];
    export let isActive = false;
    export let parentName = '';
    export let onItemClick = () => {};
</script>

<div 
    class="dropdown-menu" 
    class:active={isActive}
    role="menu"
    tabindex="-1"
    aria-label={`${parentName} submenu`}
>
    <ul>
        {#each items as item}
            <li role="none">
                <a 
                    href={item.path} 
                    class="dropdown-item"
                    on:click={onItemClick}
                    role="menuitem"
                    target={item.path.startsWith('http') ? '_blank' : null}
                    rel={item.path.startsWith('http') ? 'noopener noreferrer' : null}
                >
                    {item.name}
                </a>
            </li>
        {/each}
    </ul>
</div>

<style>
    /* Dropdown menu styles are defined in the unified navigation CSS file */
    /* This ensures consistency and maintainability */
</style>