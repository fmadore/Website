<script lang="ts">
	import { base } from '$app/paths';
	import Button from '../atoms/Button.svelte';

	let {
		tags = [],
		baseUrl = '/search?tag=', // Default base URL, can be overridden
		sectionTitle = 'Tags',
		showTitle = true,
		buttonVariant = 'outline-secondary',
		buttonSize = 'sm'
	}: {
		tags?: string[] | undefined | null;
		baseUrl?: string;
		sectionTitle?: string;
		showTitle?: boolean;
		buttonVariant?:
			| 'primary'
			| 'secondary'
			| 'outline-primary'
			| 'outline-secondary'
			| 'ghost'
			| 'danger';
		buttonSize?: 'sm' | 'base' | 'lg';
	} = $props();

	let visibleTags = $derived(tags?.filter((tag) => !!tag) ?? []);
</script>

{#if visibleTags.length > 0}
	<section class="tag-list-section">
		{#if showTitle}
			<h2 class="tag-list-title">{sectionTitle}</h2>
		{/if}
		<div class="tag-list">
			{#each visibleTags as tag (tag)}
				<Button
					href="{base}{baseUrl}{encodeURIComponent(tag)}"
					variant={buttonVariant}
					size={buttonSize}
					glass={true}
					additionalClasses="tag-button"
					label={tag}
				/>
			{/each}
		</div>
	</section>
{/if}

<style>
	.tag-list-section {
		margin-bottom: var(--spacing-6);
	}

	.tag-list-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--spacing-2);
		line-height: var(--line-height-tight);
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-2);
	}

	/* Enhanced styling for tag buttons with glassmorphism */
	:global(.tag-button) {
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--letter-spacing-wide);
		border-radius: var(--border-radius-full) !important;
	}

	:global(.tag-button:hover) {
		transform: var(--transform-lift-sm);
		box-shadow: 0 var(--spacing-2) var(--spacing-6) 0
			rgba(var(--color-primary-rgb), var(--opacity-medium)) !important;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		:global(.tag-button) {
			font-size: var(--font-size-xs);
			padding: var(--spacing-1) var(--spacing-2);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		:global(.tag-button),
		:global(.tag-button:hover) {
			transition: none;
			transform: none;
		}
	}
</style>
