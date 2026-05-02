<script lang="ts">
	import { resolve } from '$app/paths';
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

	// Helper function to format a list of names with "and" before the last one
	function formatNameList(names: string | string[] | undefined): string {
		if (!names) return '';
		if (typeof names === 'string') return names;
		if (names.length === 1) return names[0];
		if (names.length === 2) return `${names[0]} and ${names[1]}`;
		return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
	}
</script>

<header class="page-header enhanced-page-header page-enter scroll-reveal mb-8 {additionalClasses}">
	{#if backLinkHref}
		<!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic path resolved at runtime -->
		<a href={resolve(`/${backLinkHref}` as any)} class="back-link mb-4 inline-block">
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
		</div>

		{#if authors && authors.length > 0}
			<div class="authors text-xl mb-3">
				{formatNameList(authors)}
			</div>
		{/if}

		{#if editors}
			<div class="editors text-secondary mb-3">
				Edited by {formatNameList(editors)}
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

	/*
	 * Warm-paper detail-page header. Single solid surface, hairline border,
	 * single-layer shadow — no radial gradient, no double accent tint, no
	 * decorative `.title-accent` bar. The page title reads as ink on paper
	 * and inherits Spectral so the serif heading stack matches CV and
	 * editorial featured-lead conventions; the type-badge / back-link still
	 * carry the rare terracotta accents around the title.
	 */
	.enhanced-page-header {
		background: var(--color-surface);
		border-radius: var(--border-radius-xl);
		box-shadow: var(--shadow-sm);
		/* Mobile-first padding */
		padding: var(--space-6) var(--space-4);
		border: var(--border-width-thin) solid var(--color-border-light);
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
		transition: all var(--duration-normal) var(--ease-out);
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--border-radius-md);
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-10) * 100%),
			transparent
		);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-15) * 100%), transparent);
	}

	.back-link:hover {
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-15) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-30) * 100%),
			transparent
		);
		transform: translateX(calc(-1 * var(--space-3xs)));
	}

	.type-badge {
		display: inline-flex;
		align-items: center;
		background: var(--color-primary);
		color: var(--color-text-inverted);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		padding: var(--space-2) var(--space-4);
		border-radius: var(--border-radius-full);
		box-shadow: var(--shadow-sm);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-30) * 100%), transparent);
	}

	.header-date {
		font-size: var(--font-size-sm);
		color: var(--color-secondary);
		font-weight: var(--font-weight-medium);
		white-space: nowrap;
		padding: var(--space-2) var(--space-3);
		background: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-90) * 100%),
			transparent
		);
		border-radius: var(--border-radius-md);
		/* Fixed missing variable */
		border: var(--border-width-thin) solid var(--color-border);
	}

	.title-section {
		position: relative;
		margin-bottom: var(--space-4);
	}

	.page-title {
		font-family: var(--font-family-serif);
		color: var(--color-text-emphasis);
		line-height: var(--line-height-tight);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--letter-spacing-tight);
		margin: 0;
		/* Mobile-first font size override */
		font-size: var(--font-size-2xl);
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

	/* Dark mode — warm-dusk surface tile, hairline border, single shadow.
	 * Same depatterning as light mode: no radial gradient, no double-tint
	 * accent layer. */
	:global(html.dark) .enhanced-page-header {
		background: var(--color-surface);
		border-color: var(--color-border);
		box-shadow: var(--shadow-md);
	}

	:global(html.dark) .back-link {
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-15) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-30) * 100%),
			transparent
		);
	}

	:global(html.dark) .back-link:hover {
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-15) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-30) * 100%),
			transparent
		);
	}

	:global(html.dark) .header-date {
		background: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--opacity-90) * 100%),
			transparent
		);
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

		.header-meta {
			flex-direction: row;
			align-items: flex-start;
			justify-content: space-between;
		}
	}
</style>
