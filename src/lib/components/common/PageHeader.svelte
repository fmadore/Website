<script lang="ts">
	import { base } from '$app/paths';
	import TagList from '$lib/components/molecules/TagList.svelte'; // Use the one from molecules

	let {
		title,
		backLinkHref = undefined,
		backLinkLabel = '← Back',
		date = undefined,
		tags = undefined,
		typeBadgeText = undefined, // e.g., "Journal Article", "Conference Paper"
		authors = undefined,
		editors = undefined, // For publications
		additionalClasses = ''
	}: {
		title: string;
		backLinkHref?: string | undefined;
		backLinkLabel?: string;
		date?: string | undefined;
		tags?: string[] | undefined;
		typeBadgeText?: string | undefined;
		authors?: string[] | undefined;
		editors?: string | string[] | undefined;
		additionalClasses?: string;
	} = $props();

	// Helper function to format editors (copied from publications/[id])
	function formatEditors(eds: string | string[] | undefined): string {
		if (!eds) return '';
		if (typeof eds === 'string') return eds;
		if (eds.length === 1) return eds[0];
		if (eds.length === 2) return `${eds[0]} and ${eds[1]}`;
		return eds.join(', ');
	}
</script>

<header class="page-header enhanced-page-header page-enter scroll-reveal mb-8 {additionalClasses}">
	{#if backLinkHref}
		<a href={`${base}/${backLinkHref}`} class="back-link mb-4 inline-block">
			{backLinkLabel}
		</a>
	{/if}

	<div class="header-content">
		<div class="header-meta flex justify-between items-start mb-3 flex-wrap gap-2">
			{#if typeBadgeText}
				<div class="type-badge">
					{typeBadgeText}
				</div>
			{/if}
			{#if date}
				<div class="header-date">{date}</div>
			{/if}
		</div>

		<div class="title-section">
			<h1 class="page-title text-3xl md:text-4xl font-bold mb-3">{title}</h1>
			<div class="title-accent"></div>
		</div>

		{#if authors && authors.length > 0}
			<div class="authors text-xl mb-3">
				{authors.join(', ')}
			</div>
		{/if}

		{#if editors}
			<div class="editors text-secondary mb-3">
				Edited by {formatEditors(editors)}
			</div>
		{/if}

		{#if tags && tags.length > 0}
			<div class="mt-4">
				<TagList {tags} />
			</div>
		{/if}
	</div>
</header>

<style>
	.page-header {
		position: relative;
	}

	.enhanced-page-header {
		background: radial-gradient(
			circle at 20% 20%,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 35%,
			var(--color-surface) 65%,
			var(--color-background) 100%
		);
		border-radius: var(--border-radius-xl);
		box-shadow: var(--shadow-md);
		/* Mobile-first padding */
		padding: var(--space-6) var(--space-4);
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-low));
		/* Mobile-first margin */
		margin-bottom: var(--space-4);
	}

	.header-content {
		position: relative;
	}

	/* Mobile-first header meta */
	.header-meta {
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-2);
	}

	.back-link {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		transition: all var(--transition-duration-200) var(--transition-ease-out);
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--border-radius-md);
		background: rgba(var(--color-primary-rgb), var(--opacity-low));
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-medium));
	}

	.back-link:hover {
		background: rgba(var(--color-primary-rgb), var(--opacity-medium));
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium-high));
		transform: translateX(calc(-1 * var(--space-3xs)));
	}

	.type-badge {
		display: inline-flex;
		align-items: center;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-highlight) 100%);
		color: var(--color-background);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		padding: var(--space-2) var(--space-4);
		border-radius: var(--border-radius-full);
		box-shadow: var(--shadow-sm);
		border: var(--border-width-thin) solid
			rgba(var(--color-primary-rgb), var(--opacity-medium-high));
	}

	.header-date {
		font-size: var(--font-size-sm);
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		white-space: nowrap;
		padding: var(--space-2) var(--space-3);
		background: rgba(var(--color-surface-rgb), var(--opacity-high));
		border-radius: var(--border-radius-md);
		/* Fixed missing variable */
		border: var(--border-width-thin) solid var(--color-border);
	}

	.title-section {
		position: relative;
		margin-bottom: var(--space-4);
	}

	.page-title {
		color: var(--color-primary);
		line-height: var(--line-height-tight);
		font-weight: var(--font-weight-extrabold);
		letter-spacing: var(--letter-spacing-tight);
		margin: 0;
		/* Mobile-first font size override */
		font-size: var(--font-size-2xl);
	}

	.title-accent {
		/* Mobile-first width */
		width: 60px;
		height: var(--border-width-thick);
		background: linear-gradient(90deg, var(--color-highlight) 0%, var(--color-accent) 100%);
		border-radius: var(--border-radius-sm);
		margin-top: var(--space-3);
		transition: width var(--transition-duration-300) var(--transition-ease-out);
	}

	.authors {
		color: var(--color-text);
		font-weight: var(--font-weight-medium);
		line-height: var(--line-height-relaxed);
		/* Mobile-first font size override */
		font-size: var(--font-size-lg);
	}

	.editors {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-medium);
		line-height: var(--line-height-relaxed);
	}

	/* Dark mode enhancements */
	:global(html.dark) .enhanced-page-header {
		background: radial-gradient(
			circle at 20% 20%,
			rgba(var(--color-primary-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-low)) 35%,
			var(--color-dark-surface-alt) 65%,
			var(--color-dark-surface-deep) 100%
		);
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium));
		box-shadow: var(--shadow-lg);
	}

	:global(html.dark) .back-link {
		background: rgba(var(--color-primary-rgb), var(--opacity-medium));
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium-high));
	}

	:global(html.dark) .back-link:hover {
		background: rgba(var(--color-primary-rgb), var(--opacity-medium));
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium-high));
	}

	:global(html.dark) .header-date {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-high));
		/* Fixed missing variable */
		border-color: var(--color-border-dark);
	}

	/* Desktop responsive design */
	@media (--sm) {
		.enhanced-page-header {
			padding: var(--space-8) var(--space-6);
			margin-bottom: var(--space-6);
		}

		.page-title {
			/* Reset to inherit or larger size */
			font-size: var(--font-size-4xl);
		}

		.authors {
			font-size: var(--font-size-xl);
		}

		.title-accent {
			width: var(--space-4xl);
		}

		.header-meta {
			flex-direction: row;
			align-items: flex-start;
			justify-content: space-between;
		}
	}

	/* Animation for title accent on hover */
	@media (prefers-reduced-motion: no-preference) {
		.title-section:hover .title-accent {
			width: calc(var(--space-4xl) + var(--space-md-tight));
		}
	}
</style>
