<script lang="ts">
	let {
		primaryUrl = undefined,
		primaryLabel = 'Access Item',
		additionalUrls = [],
		sectionClass = 'action-links',
		// The single primary action is the one pine fill on the screen;
		// secondary links stay outline. Call sites may override.
		primaryButtonClass = 'btn btn-accent',
		secondaryButtonClass = 'btn btn-outline-secondary',
		primaryDivClass = 'mb-2',
		secondaryDivClass = 'action-links-secondary'
	}: {
		primaryUrl?: string | undefined | null;
		primaryLabel?: string;
		additionalUrls?: Array<{ url: string; label: string }> | undefined | null;
		sectionClass?: string;
		primaryButtonClass?: string;
		secondaryButtonClass?: string;
		primaryDivClass?: string;
		secondaryDivClass?: string;
	} = $props();

	let visibleAdditionalUrls = $derived(
		additionalUrls?.filter((link) => link.url && link.label && typeof link.url === 'string') ?? []
	);
</script>

{#if primaryUrl || visibleAdditionalUrls.length > 0}
	<section class="{sectionClass} scroll-reveal">
		{#if primaryUrl && typeof primaryUrl === 'string' && primaryUrl !== 'undefined'}
			<div class={primaryDivClass}>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link -->
				<a href={primaryUrl} target="_blank" rel="noopener noreferrer" class={primaryButtonClass}>
					{primaryLabel}
				</a>
			</div>
		{/if}

		{#if visibleAdditionalUrls.length > 0}
			<div class={secondaryDivClass}>
				{#each visibleAdditionalUrls as link (link.url)}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link -->
					<a href={link.url} target="_blank" rel="noopener noreferrer" class={secondaryButtonClass}>
						{link.label}
					</a>
				{/each}
			</div>
		{/if}
	</section>
{/if}

<style>
	/* A row of actions in the data voice: one pine primary, the rest
	 * outline. Secondary links wrap in a mono row with a trailing ↗. */
	.action-links {
		margin-bottom: var(--space-lg);
	}

	.action-links-secondary {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.action-links-secondary :global(a[target='_blank'])::after {
		content: ' ↗';
		font-family: var(--font-family-mono);
		font-size: 0.9em;
	}

	/* Reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.action-links {
			opacity: 1;
			transform: none;
			animation: none;
		}
	}
</style>
