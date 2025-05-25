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
