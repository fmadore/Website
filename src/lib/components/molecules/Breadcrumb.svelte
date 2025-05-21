<script lang="ts">
    import { base } from '$app/paths';
    import BreadcrumbLink from '$lib/components/atoms/BreadcrumbLink.svelte';

    let { 
        items = [], 
        showHomeLink = true 
    }: {
        items: { label: string; href: string; }[];
        showHomeLink?: boolean;
    } = $props();

</script>

<nav aria-label="Breadcrumb" class="breadcrumb">
    <ol>
        {#if showHomeLink}
            <li>
                <BreadcrumbLink href={`${base}/`}>Home</BreadcrumbLink>
            </li>
        {/if}
        
        {#each items as item, i}
            <li>
                <BreadcrumbLink 
                    href={item.href} 
                    active={i === items.length - 1}
                >
                    {item.label}
                </BreadcrumbLink>
            </li>
        {/each}
    </ol>
</nav>

<style>
    .breadcrumb {
        font-size: var(--font-size-sm);
        margin-bottom: var(--spacing-4);
    }

    .breadcrumb ol {
        display: flex;
        flex-wrap: wrap;
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .breadcrumb li {
        display: inline-flex;
        align-items: center;
    }

    .breadcrumb li:not(:last-child)::after {
        content: "/";
        margin: 0 var(--spacing-2);
        color: var(--color-text-light);
    }
</style>