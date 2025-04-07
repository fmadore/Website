<script lang="ts">
    export let href: string;
    export let active = false;
    export let hasDropdown = false;
</script>

<a 
    {href} 
    class="nav-link" 
    class:active 
    aria-haspopup={hasDropdown ? "true" : "false"}
    on:click
    on:keydown
    {...$$restProps}
>
    <slot></slot>
    {#if hasDropdown}
        <span class="dropdown-icon">▾</span>
    {/if}
</a>

<style>
    .nav-link {
        color: var(--color-text);
        text-decoration: none;
        font-weight: 500;
        padding: var(--spacing-2) 0;
        transition: all 0.2s ease;
        position: relative;
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
        margin-left: 4px;
        font-size: 10px;
        transition: transform 0.3s ease;
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