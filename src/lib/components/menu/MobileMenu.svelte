<script lang="ts">
    import type { NavItem } from '$lib/types/navigation';
    import ThemeToggle from '$lib/components/menu/ThemeToggle.svelte';
    import Icon from '@iconify/svelte';
    import { base } from '$app/paths';
    
    let {
        navItems,
        isActive = false,
        onCloseMenu
    }: {
        navItems: NavItem[];
        isActive?: boolean;
        onCloseMenu: () => void;
    } = $props();
</script>

<div id="mobile-menu" class="mobile-nav-container" class:active={isActive}>
    <nav class="mobile-nav" aria-label="Mobile navigation">        <!-- Mobile Menu Header -->
        <div class="mobile-nav-header">
            <ThemeToggle size={20} />
              <a href="{base}/" class="mobile-site-title" onclick={onCloseMenu}>
                Frédérick Madore
            </a>
            
            <!-- Empty placeholder for grid balance -->
            <div class="mobile-header-spacer"></div>
        </div>

        <ul class="mobile-nav-list">
            {#each navItems as item}
                <li class="mobile-nav-item">                    <a href={item.path} class="mobile-nav-link" onclick={onCloseMenu}>
                        {item.name}
                    </a>
                    
                    {#if item.dropdown}
                        <ul class="mobile-dropdown">
                            {#each item.dropdown as subItem}
                                <li class="mobile-dropdown-item">                                    <a 
                                        href={subItem.path} 
                                        class="mobile-dropdown-link" 
                                        onclick={onCloseMenu}
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
    /* Mobile navigation styles are defined in the unified navigation CSS file */
    /* This ensures consistency and maintainability */
</style>