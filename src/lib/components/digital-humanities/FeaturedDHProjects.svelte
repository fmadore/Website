<script lang="ts">
	import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';
	import { base } from '$app/paths';
	import Card from '$lib/components/common/Card.svelte';
	import TagList from '$lib/components/molecules/TagList.svelte';
	import Icon from '@iconify/svelte';

	let { projects = [] }: { projects: DigitalHumanitiesProject[] } = $props();

	// Process projects for display
	const processedProjects = $derived(
		projects.map((project) => {
			const isExternal =
				project.linkUrl &&
				(project.linkUrl.startsWith('http://') || project.linkUrl.startsWith('https://'));
			const internalPath = `/digital-humanities/${project.id}`;
			const finalLinkUrl = isExternal ? project.linkUrl! : `${base}${internalPath}`;
			const linkTarget = isExternal ? '_blank' : '_self';
			const actionText = isExternal ? 'Visit Site' : 'Explore project';

			return {
				...project,
				imageUrl: `${base}${project.imageUrl.startsWith('/') ? project.imageUrl : '/' + project.imageUrl}`,
				finalLinkUrl,
				linkTarget,
				actionText
			};
		})
	);
</script>

{#if processedProjects.length > 0}
	<div class="featured-section scroll-reveal">
		<div class="featured-header">
			<Icon icon="lucide:pin" width="20" height="20" />
			<span>Featured Project{processedProjects.length > 1 ? 's' : ''}</span>
		</div>

		<div class="featured-grid grid-stagger">
			{#each processedProjects as project (project.id)}
				<Card
					title={project.title}
					imageUrl={project.imageUrl}
					linkUrl={project.finalLinkUrl}
					target={project.linkTarget}
				>
					{#snippet subtitle()}
						<span>{project.years}</span>
					{/snippet}

					{project.shortDescription}

					{#snippet details()}
						{#if project.skills && project.skills.length > 0}
							<div class="skills-section">
								<TagList
									tags={project.skills.slice(0, 6)}
									baseUrl="/digital-humanities?skill="
									showTitle={false}
									buttonVariant="outline-secondary"
									buttonSize="sm"
								/>
							</div>
						{/if}
					{/snippet}

					{#snippet action()}
						<a
							href={project.finalLinkUrl}
							target={project.linkTarget}
							rel={project.linkTarget === '_blank' ? 'noopener noreferrer' : null}
						>
							{project.actionText}
						</a>
					{/snippet}
				</Card>
			{/each}
		</div>
	</div>
{/if}

<style>
	.featured-section {
		margin-bottom: var(--space-8);
	}

	.featured-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-accent);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wider);
		margin-bottom: var(--space-4);
		padding-left: var(--space-1);
	}

	.featured-grid {
		display: grid;
		gap: var(--space-6);
		grid-template-columns: 1fr;
	}

	.skills-section {
		margin-top: var(--space-2);
		font-size: var(--font-size-sm);
	}

	/* Add a subtle visual separator after featured section */
	.featured-section::after {
		content: '';
		display: block;
		margin-top: var(--space-8);
		height: 1px;
		background: linear-gradient(
			to right,
			transparent,
			color-mix(in srgb, var(--color-primary) 10%, transparent) 20%,
			color-mix(in srgb, var(--color-primary) 10%, transparent) 80%,
			transparent
		);
	}

	/* Dark mode adjustments */
	:global(html.dark) .featured-header {
		color: var(--color-highlight);
	}

	:global(html.dark) .featured-section::after {
		background: linear-gradient(
			to right,
			transparent,
			color-mix(in srgb, var(--color-primary) 20%, transparent) 20%,
			color-mix(in srgb, var(--color-primary) 20%, transparent) 80%,
			transparent
		);
	}
</style>
