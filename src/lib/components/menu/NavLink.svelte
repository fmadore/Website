<script lang="ts">
    let {
        href,
        active = false,
        hasDropdown = false,
        onclick,
        onkeydown,
        children,
        ...restProps
    }: {
        href: string;
        active?: boolean;
        hasDropdown?: boolean;
        onclick?: (event: MouseEvent) => void;
        onkeydown?: (event: KeyboardEvent) => void;
        children?: any;
        [key: string]: any;
    } = $props();
</script>

<a 
    {href} 
    class="nav-link" 
    class:active 
    aria-haspopup={hasDropdown ? "true" : "false"}    {onclick}
    {onkeydown}
    {...restProps}
>
    {@render children?.()}
    {#if hasDropdown}
        <span class="dropdown-icon">▾</span>
    {/if}
</a>

<style>
    .nav-link {
        color: var(--color-text);
        text-decoration: none;
        font-weight: 500;
        font-size: var(--font-size-base);
        padding: var(--spacing-2) 0;
        transition: all 0.2s ease;
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
    }
    
    .nav-link::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 0;
        height: 2px;
        background-color: var(--color-primary);
        transition: width 0.3s ease;
    }
    
    .nav-link:hover {
        color: var(--color-primary);
    }
    
    .nav-link:hover::after {
        width: 100%;
    }
    
    .dropdown-icon {
        display: inline-block;
        font-size: 12px;
        transition: transform 0.3s ease;
        line-height: 1;
    }
    
    .nav-link:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }
    
    @media (hover: none) {
        /* Prevent hover state issues on touch devices */
        .nav-link:hover::after {
            width: 0;
        }
        
        .nav-link:active::after {
            width: 100%;
        }
    }
</style>