<script lang="ts">
	import { base } from '$app/paths';
	import TagList from '$lib/components/molecules/TagList.svelte'; // Use the one from molecules
	import { scrollAnimate } from '$lib/utils/scrollAnimations';

	let {
		title,
		backLinkHref = undefined,
		backLinkLabel = '← Back',
		date = undefined,
		tags = undefined,
		typeBadgeText = undefined, // e.g., "Journal Article", "Conference Paper"
		authors = undefined,
		editors = undefined // For publications
	}: {
		title: string;
		backLinkHref?: string | undefined;
		backLinkLabel?: string;
		date?: string | undefined;
		tags?: string[] | undefined;
		typeBadgeText?: string | undefined;
		authors?: string[] | undefined;
		editors?: string | string[] | undefined;
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

<header class="page-header enhanced-page-header mb-8" use:scrollAnimate={{ delay: 50, animationClass: 'fade-in-up' }}>
	{#if backLinkHref}
		<a href="{base}/{backLinkHref}" class="back-link mb-4 inline-block" use:scrollAnimate={{ delay: 100, animationClass: 'fade-in-left' }}>
			{backLinkLabel}
		</a>
	{/if}

	<div class="header-content">
		<div class="header-meta flex justify-between items-start mb-3 flex-wrap gap-2" use:scrollAnimate={{ delay: 150, animationClass: 'fade-in-up' }}>
			{#if typeBadgeText}
				<div class="type-badge">
					{typeBadgeText}
				</div>
			{/if}
			{#if date}
				<div class="header-date">{date}</div>
			{/if}
		</div>

		<div class="title-section" use:scrollAnimate={{ delay: 200, animationClass: 'fade-in-up' }}>
			<h1 class="page-title text-3xl md:text-4xl font-bold mb-3">{title}</h1>
			<div class="title-accent"></div>
		</div>

		{#if authors && authors.length > 0}
			<div class="authors text-xl mb-3" use:scrollAnimate={{ delay: 250, animationClass: 'fade-in-up' }}>{authors.join(', ')}</div>
		{/if}

		{#if editors}
			<div class="editors text-text-secondary mb-3" use:scrollAnimate={{ delay: 300, animationClass: 'fade-in-up' }}>
				Edited by {formatEditors(editors)}
			</div>
		{/if}

		{#if tags && tags.length > 0}
			<div class="mt-4" use:scrollAnimate={{ delay: 350, animationClass: 'fade-in-up' }}>
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
		padding: var(--spacing-8) var(--spacing-6);
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-low));
		margin-bottom: var(--spacing-6);
	}

	.header-content {
		position: relative;
	}

	.back-link {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		transition: all 0.2s ease;
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-1);
		padding: var(--spacing-2) var(--spacing-3);
		border-radius: var(--border-radius-md);
		background: rgba(var(--color-primary-rgb), var(--opacity-low));
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-medium));
	}

	.back-link:hover {
		background: rgba(var(--color-primary-rgb), var(--opacity-medium));
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium-high));
		transform: translateX(-2px);
	}

	.type-badge {
		display: inline-flex;
		align-items: center;
		background: linear-gradient(135deg, 
			var(--color-primary) 0%, 
			var(--color-highlight) 100%
		);
		color: var(--color-background);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		padding: var(--spacing-2) var(--spacing-4);
		border-radius: var(--border-radius-full);
		box-shadow: var(--shadow-sm);
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-medium-high));
	}

	.header-date {
		font-size: var(--font-size-sm);
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		white-space: nowrap;
		padding: var(--spacing-2) var(--spacing-3);
		background: rgba(var(--color-surface-rgb), var(--opacity-high));
		border-radius: var(--border-radius-md);
		border: var(--border-width-thin) solid rgba(var(--color-border-rgb), 0.5);
	}

	.title-section {
		position: relative;
		margin-bottom: var(--spacing-4);
	}

	.page-title {
		color: var(--color-primary);
		line-height: var(--line-height-tight);
		font-weight: var(--font-weight-extrabold);
		letter-spacing: var(--letter-spacing-tight);
		margin: 0;
	}

	.title-accent {
		width: 80px;
		height: var(--border-width-thick);
		background: linear-gradient(90deg, 
			var(--color-highlight) 0%, 
			var(--color-accent) 100%
		);
		border-radius: var(--border-radius-sm);
		margin-top: var(--spacing-3);
		transition: width 0.3s ease;
	}

	.authors {
		color: var(--color-text);
		font-weight: var(--font-weight-medium);
		line-height: var(--line-height-relaxed);
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
			rgba(var(--color-primary-rgb), 0.12) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-low)) 35%,
			var(--color-dark-surface-alt) 65%,
			var(--color-dark-surface-deep) 100%
		);
		border-color: rgba(var(--color-primary-rgb), 0.15);
		box-shadow: var(--shadow-lg);
	}

	:global(html.dark) .back-link {
		background: rgba(var(--color-primary-rgb), var(--opacity-medium));
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium-high));
	}

	:global(html.dark) .back-link:hover {
		background: rgba(var(--color-primary-rgb), 0.15);
		border-color: rgba(var(--color-primary-rgb), 0.3);
	}

	:global(html.dark) .header-date {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-high));
		border-color: rgba(var(--color-border-rgb), 0.3);
	}

	/* Mobile responsive design */
	@media (max-width: 640px) {
		.enhanced-page-header {
			padding: var(--spacing-6) var(--spacing-4);
			margin-bottom: var(--spacing-4);
		}

		.page-title {
			font-size: var(--font-size-2xl);
		}

		.authors {
			font-size: var(--font-size-lg);
		}

		.title-accent {
			width: 60px;
		}

		.header-meta {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-2);
		}
	}

	/* Animation for title accent on hover */
	@media (prefers-reduced-motion: no-preference) {
		.title-section:hover .title-accent {
			width: 100px;
		}
	}
</style>
