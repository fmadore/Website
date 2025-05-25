<script lang="ts">
    import { base } from '$app/paths';
    import BreadcrumbLink from '$lib/components/common/BreadcrumbLink.svelte';

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
