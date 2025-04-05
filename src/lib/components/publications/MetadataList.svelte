<script lang="ts">
  export let metadata: Array<{ label: string; value: string | number | undefined | null }> = [];

  // Filter out items with empty/null values before rendering
  $: visibleMetadata = metadata.filter(item => item.value !== null && item.value !== undefined && item.value !== '');
</script>

{#if visibleMetadata.length > 0}
  <span class="metadata-list">
    {#each visibleMetadata as item, i}
      <span class="metadata-item">
        {#if item.label}
          <span class="metadata-label">{item.label}:</span>
        {/if}
        <span class="metadata-value">{item.value}</span>
      </span>{#if i < visibleMetadata.length - 1}<span class="metadata-separator">, </span>{/if}
    {/each}
  </span>
{/if}

<style>
  .metadata-list {
    display: inline; /* Keep it inline with surrounding text */
    color: var(--color-text-light);
    font-size: var(--font-size-sm); /* Use text-sm variable */
  }
  .metadata-item {
    display: inline; /* Keep items on the same line */
  }
  .metadata-label {
    /* font-weight: 500; Optional: Make label slightly bolder */
    margin-right: var(--spacing-1); /* Use spacing variable */
  }
  /* .metadata-value removed - empty ruleset */
  .metadata-separator {
    /* Separator styling if needed */
    color: var(--color-text-light); /* Match text color */
  }
</style> 