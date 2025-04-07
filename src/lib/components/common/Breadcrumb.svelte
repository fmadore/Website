<script lang="ts">
    import { base } from '$app/paths';

    export let items: { 
        label: string; 
        href: string;
    }[] = [];
</script>

<nav aria-label="Breadcrumb" class="breadcrumb">
    <ol>
        <li>
            <a href="{base}/">Home</a>
        </li>
        {#each items as item, i}
            <li>
                {#if i === items.length - 1}
                    <span aria-current="page">{item.label}</span>
                {:else}
                    <a href="{item.href.startsWith('/') ? base + item.href : item.href}">{item.label}</a>
                {/if}
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
        color: var(--color-text-muted);
    }

    .breadcrumb a {
        color: var(--color-text-muted);
        text-decoration: none;
        transition: color 0.2s;
    }

    .breadcrumb a:hover {
        color: var(--color-primary);
        text-decoration: underline;
    }

    .breadcrumb [aria-current="page"] {
        color: var(--color-text);
        font-weight: 500;
    }
</style> 