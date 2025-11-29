<script lang="ts">
	let {
		primaryUrl = undefined,
		primaryLabel = 'Access Item',
		additionalUrls = [],
		sectionClass = 'action-links',
		primaryButtonClass = 'btn btn-primary',
		secondaryButtonClass = 'btn btn-outline',
		primaryDivClass = 'mb-2',
		secondaryDivClass = 'flex flex-wrap gap-2'
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
				<a href={primaryUrl} target="_blank" rel="noopener noreferrer" class={primaryButtonClass}>
					{primaryLabel}
				</a>
			</div>
		{/if}

		{#if visibleAdditionalUrls.length > 0}
			<div class={secondaryDivClass}>
				{#each visibleAdditionalUrls as link (link.url)}
					<a href={link.url} target="_blank" rel="noopener noreferrer" class={secondaryButtonClass}>
						{link.label}
					</a>
				{/each}
			</div>
		{/if}
	</section>
{/if}

<style>
	/* Action links section with scroll reveal animation support */
	.action-links {
		margin-bottom: var(--space-lg);
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
