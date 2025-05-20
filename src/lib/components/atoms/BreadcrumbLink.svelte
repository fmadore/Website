<script lang="ts">
    let { href, active = false, children }: { href: string, active?: boolean, children: any } = $props();
</script>

{#if active}
    <span aria-current="page" class="breadcrumb-text">
        {@render children()}
    </span>
{:else}
    <a {href} class="breadcrumb-link">
        {@render children()}
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