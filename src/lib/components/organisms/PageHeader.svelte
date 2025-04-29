<script lang="ts">
	import { base } from '$app/paths';
	import TagList from '$lib/components/molecules/TagList.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	
	export let title: string;
	export let backLinkHref: string | undefined = undefined;
	export let backLinkLabel: string = '← Back';
	export let date: string | undefined = undefined;
	export let tags: string[] | undefined = undefined;
	export let typeBadgeText: string | undefined = undefined;
	export let authors: string[] | undefined = undefined;
	export let editors: string | string[] | undefined = undefined;
	
	// Breadcrumb properties
	export let breadcrumbItems: { label: string; href: string }[] = [];
	export let showBreadcrumb = true;
	export let showHomeInBreadcrumb = true;

	// Helper function to format editors
	function formatEditors(eds: string | string[] | undefined): string {
		if (!eds) return '';
		if (typeof eds === 'string') return eds;
		if (eds.length === 1) return eds[0];
		if (eds.length === 2) return `${eds[0]} and ${eds[1]}`;
		return eds.join(', ');
	}
</script>

<header class="page-header mb-6">
	{#if showBreadcrumb}
		<div class="breadcrumb-container">
			<Breadcrumb 
				items={breadcrumbItems} 
				showHomeLink={showHomeInBreadcrumb}
			/>
		</div>
	{/if}
	
	{#if backLinkHref}
		<a href="{base}/{backLinkHref}" class="back-link mb-4 inline-block">
			{backLinkLabel}
		</a>
	{/if}

	<div class="header-meta flex justify-between items-start mb-2 flex-wrap gap-2">
		{#if typeBadgeText}
			<div class="type-badge">
				{typeBadgeText}
			</div>
		{/if}
		{#if date}
			<div class="header-date">{date}</div>
		{/if}
	</div>

	<h1 class="page-title text-2xl md:text-3xl font-bold mb-2">{title}</h1>

	{#if authors && authors.length > 0}
		<div class="authors text-lg mb-2">{authors.join(', ')}</div>
	{/if}

	{#if editors}
		<div class="editors text-secondary mb-2">
			Edited by {formatEditors(editors)}
		</div>
	{/if}

	{#if tags && tags.length > 0}
		<div class="mt-3">
			<TagList tags={tags} />
		</div>
	{/if}
	
	<slot></slot>
</header>

<style>
	.breadcrumb-container {
		margin-bottom: var(--spacing-4);
	}
	
	.back-link {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: 500;
	}
	.back-link:hover {
		text-decoration: underline;
	}

	.type-badge {
		display: inline-block;
		background-color: var(--color-primary-light);
		color: var(--color-primary-dark);
		font-size: var(--font-size-xs);
		font-weight: 600;
		text-transform: uppercase;
		padding: 0.25rem 0.75rem;
		border-radius: var(--border-radius-full);
	}

	.header-date {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		white-space: nowrap; /* Prevent date from wrapping */
	}

	.page-title {
		color: var(--color-primary);
		line-height: 1.3;
	}

	.authors {
		color: var(--color-text);
	}
	.editors {
		font-size: var(--font-size-base);
	}
</style>