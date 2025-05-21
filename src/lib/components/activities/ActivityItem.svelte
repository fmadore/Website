<script lang="ts">
  import type { Activity } from '$lib/stores/activities';
  import Card from '$lib/components/common/Card.svelte';
  import { base } from '$app/paths';

  let { activity }: { activity: Activity } = $props();

  // Construct image URL safely
  let imageUrl = $derived(activity.heroImage?.src ? `${base}/${activity.heroImage.src}` : undefined);
  let imageAlt = $derived(activity.heroImage?.alt || activity.title); // Use title as fallback alt text
  let activityLink = $derived(`${base}/activities/${activity.id}`);

</script>

<Card
  title={activity.title}
  imageUrl={imageUrl}
  imageAlt={imageAlt}
  linkUrl={activityLink}
  target="_self" 
>
  {#snippet subtitle()}
    <div class="activity-meta text-sm text-gray-500 mb-2">
      <span>{activity.date}</span>
    </div>
  {/snippet}

  <!-- Default slot for description -->
  {#snippet children()}<p class="activity-description text-sm">
    {activity.description}
  </p>{/snippet}

  <!-- Details slot for tags -->
  {#snippet details()}
    {#if activity.tags && activity.tags.length > 0}
      <div class="activity-tags flex flex-wrap gap-1 mt-2">
        {#each activity.tags as tag}
          <span class="tag bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
            {tag}
          </span>
        {/each}
      </div>
    {/if}
  {/snippet}

  <!-- Action slot for the link -->
  {#snippet action()}
    <a href={activityLink} class="text-sm font-medium">
      Read more →
    </a>
  {/snippet}
</Card>

<style>
  /* Use theme variables for tags if needed, 
     but Card component styles should handle most things */
  .tag {
      background-color: var(--color-border);
      color: var(--color-text);
      font-weight: 500;
  }
  .activity-meta {
      color: var(--color-text-light);
  }
  /* Removed empty .activity-description rule */

  /* Removed empty a rule */

  /* Removed empty a:hover rule */
</style>