<script lang="ts">
    import { base } from '$app/paths';
    
    export let href: string;
    export let active = false;

    // Process the href to ensure it has the base path if it starts with /
    $: processedHref = href.startsWith('/') ? `${base}${href}` : href;
</script>

{#if active}
    <span aria-current="page" class="breadcrumb-text">
        <slot></slot>
    </span>
{:else}
    <a {href} class="breadcrumb-link">
        <slot></slot>
    </a>
{/if}

<style>
    .breadcrumb-link {
        color: var(--color-text-light);
        text-decoration: none;
        transition: color 0.2s;
    }

    .breadcrumb-link:hover {
        color: var(--color-primary);
        text-decoration: underline;
    }

    .breadcrumb-text {
        color: var(--color-text);
        font-weight: 500;
    }
</style>