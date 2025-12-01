<script lang="ts">
	import type { Activity } from '$lib/stores/activities.svelte';
	import Card from '$lib/components/common/Card.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import TagList from '$lib/components/molecules/TagList.svelte';
	import { base } from '$app/paths';

	let { activity }: { activity: Activity } = $props();

	// Construct image URL safely
	let imageUrl = $derived(
		activity.heroImage?.src ? `${base}/${activity.heroImage.src}` : undefined
	);
	let imageAlt = $derived(activity.heroImage?.alt || activity.title); // Use title as fallback alt text
	let activityLink = $derived(`${base}/activities/${activity.id}`);
</script>

<Card title={activity.title} {imageUrl} {imageAlt} linkUrl={activityLink} target="_self">
	{#snippet subtitle()}
		<div class="activity-meta">
			<span>{activity.date}</span>
		</div>
	{/snippet}

	<!-- Default content for description -->
	<p class="activity-description">
		{activity.description}
	</p>

	<!-- Details slot for tags -->
	{#snippet details()}
		<TagList
			tags={activity.tags}
			showTitle={false}
			buttonVariant="ghost"
			buttonSize="sm"
			baseUrl="/activities?tag="
		/>
	{/snippet}

	<!-- Action slot for the link -->
	{#snippet action()}
		<Button
			href={activityLink}
			variant="outline-primary"
			size="sm"
			glass={true}
			ariaLabel="Read more about {activity.title}"
		>
			Read more →
		</Button>
	{/snippet}
</Card>

<style>
	.activity-meta {
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		margin-bottom: var(--space-2);
	}

	.activity-description {
		font-size: var(--font-size-sm);
		line-height: var(--line-height-normal);
		color: var(--color-text);
	}
</style>
