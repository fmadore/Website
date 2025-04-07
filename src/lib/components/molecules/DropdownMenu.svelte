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
                >
                    {item.name}
                </a>
            </li>
        {/each}
    </ul>
</div>

<style>
    .dropdown-menu {
        position: absolute;
        top: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%);
        z-index: 10;
        min-width: 240px;
        max-width: 90vw; /* Prevent overflow on small screens */
        background-color: var(--color-background);
        box-shadow: var(--shadow-md);
        border-radius: var(--border-radius-md);
        padding: var(--spacing-2);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        transform-origin: top center;
        transform: translateX(-50%) translateY(10px);
        margin-top: -8px;
        padding-top: 16px;
    }
    
    .dropdown-menu.active {
        opacity: 1;
        visibility: visible;
        transform: translateX(-50%) translateY(0);
    }
    
    .dropdown-menu::before {
        content: '';
        position: absolute;
        top: 10px; /* Adjusted for new padding-top */
        left: 50%;
        transform: translateX(-50%);
        width: 12px;
        height: 12px;
        background-color: var(--color-background);
        transform: translateX(-50%) rotate(45deg);
        z-index: -1;
    }
    
    .dropdown-menu ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
    .dropdown-item {
        display: block;
        padding: var(--spacing-3) var(--spacing-4);
        color: var(--color-text);
        text-decoration: none;
        font-size: var(--font-size-sm);
        border-radius: var(--border-radius-sm);
        transition: all 0.2s ease;
    }
    
    .dropdown-item:hover {
        background-color: var(--color-border);
        color: var(--color-primary);
        transform: translateX(4px);
    }
    
    @media (hover: none) {
        .dropdown-menu {
            transition: opacity 0.2s ease, visibility 0.2s ease;
        }
    }
</style> 