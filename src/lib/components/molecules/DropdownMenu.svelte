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
    /* Scoped component styles that will override global styles */
    .dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0; /* Start from left edge of parent */
        z-index: 100;
        min-width: 250px; /* Increase minimum width for longer text */
        width: max-content; /* Allow it to grow based on content */
        background-color: var(--color-background);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-md);
        box-shadow: var(--shadow-md);
        padding: var(--spacing-1) 0;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.15s, transform 0.15s;
        pointer-events: none;
    }
    
    /* Make sure dropdown displays at the right position without transformation */
    @media (min-width: 768px) {
        .dropdown-menu {
            left: 0;
            transform: none;
            max-width: none;
        }
    }
    
    /* Fix Research menu item specifically - needs to be even wider */
    :global(.nav-item:first-child .dropdown-menu) {
        min-width: 350px;
    }
    
    .dropdown-menu.active {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
    }
    
    .dropdown-menu ul {
        list-style: none;
        padding: 0;
        margin: 0;
        width: 100%;
    }
    
    .dropdown-item {
        display: block;
        width: 100%;
        text-align: left;
        padding: var(--spacing-2) var(--spacing-4);
        color: var(--color-text);
        text-decoration: none;
        transition: background 0.15s, color 0.15s;
        border-radius: 0;
        white-space: normal; /* Allow text wrapping for very long items */
        word-wrap: break-word;
    }
    
    .dropdown-item:hover,
    .dropdown-item:focus {
        background-color: var(--color-border);
        color: var(--color-primary);
    }
</style>