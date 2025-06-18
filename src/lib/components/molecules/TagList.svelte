<script lang="ts">
	import { base } from '$app/paths';
	import Button from '../atoms/Button.svelte';

	let {
		tags = [],
		baseUrl = '/search?tag=', // Default base URL, can be overridden
		sectionTitle = 'Tags',
		titleClass = 'text-lg font-semibold mb-2 text-text-emphasis',
		listClass = 'flex flex-wrap gap-2',
		sectionClass = 'mb-6',
		buttonVariant = 'outline-secondary',
		buttonSize = 'sm'
	}: {
		tags?: string[] | undefined | null;
		baseUrl?: string;
		sectionTitle?: string;
		titleClass?: string;
		listClass?: string;
		sectionClass?: string;
		buttonVariant?: 'primary' | 'secondary' | 'outline-primary' | 'outline-secondary';
		buttonSize?: 'sm' | 'base' | 'lg';
	} = $props();

	let visibleTags = $derived(tags?.filter((tag) => !!tag) ?? []);
</script>

{#if visibleTags.length > 0}
	<section class={sectionClass}>
		<h2 class={titleClass}>{sectionTitle}</h2>
		<div class={listClass}>
			{#each visibleTags as tag}
				<Button 
					href="{base}{baseUrl}{encodeURIComponent(tag)}"
					variant={buttonVariant}
					size={buttonSize}
					additionalClasses="glass-button tag-button"
				>
					{#snippet children()}
						{tag}
					{/snippet}
				</Button>
			{/each}
		</div>
	</section>
{/if}

<style>
	/* Enhanced styling for tag buttons with glassmorphism */
	:global(.tag-button) {
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--letter-spacing-wide);
		transition: all var(--anim-duration-base) var(--anim-ease-base);
		border-radius: var(--border-radius-full) !important;
	}

	:global(.tag-button:hover) {
		transform: var(--transform-lift-sm);
		box-shadow: 0 8px 25px 0 rgba(var(--color-primary-rgb), var(--opacity-medium)) !important;
	}

	/* Section title styling using CSS variables */
	h2 {
		font-family: var(--font-family-serif);
		color: var(--color-text-emphasis);
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
