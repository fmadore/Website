<script lang="ts">
	import { base } from '$app/paths';

	let {
		items = [],
		showHomeLink = true
	}: {
		items: { label: string; href: string }[];
		showHomeLink?: boolean;
	} = $props();
</script>

<nav aria-label="Breadcrumb" class="breadcrumb">
	<ol>
		{#if showHomeLink}
			<li>
				<a href={`${base}/`} class="breadcrumb-link">Home</a>
			</li>
		{/if}

		{#each items as item, i}
			<li>
				{#if i === items.length - 1}
					<span aria-current="page" class="breadcrumb-text">
						{item.label}
					</span>
				{:else}
					<a href={item.href} class="breadcrumb-link">
						{item.label}
					</a>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.breadcrumb {
		font-size: var(--font-size-sm);
		margin-bottom: var(--spacing-6);
		padding: var(--spacing-3) var(--spacing-4);
		background-color: var(--color-surface);
		border-radius: var(--border-radius-md);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-sm);
	}

	.breadcrumb ol {
		display: flex;
		flex-wrap: wrap;
		list-style: none;
		padding: 0;
		margin: 0;
		align-items: center;
	}

	.breadcrumb li {
		display: inline-flex;
		align-items: center;
	}

	.breadcrumb li:not(:last-child)::after {
		content: '›';
		margin: 0 var(--spacing-2);
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
		font-weight: 400;
		opacity: 0.7;
	}

	/* Breadcrumb Link Styles */
	.breadcrumb-link {
		color: var(--color-text-light);
		text-decoration: none;
		padding: var(--spacing-1) var(--spacing-2);
		border-radius: var(--border-radius-sm);
		transition: all 0.2s ease;
		position: relative;
		font-weight: 400;
	}

	.breadcrumb-link:hover {
		color: var(--color-primary);
		background-color: rgba(var(--color-primary-rgb), 0.1);
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	.breadcrumb-link:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	/* Active/Current Page Styles */
	.breadcrumb-text {
		color: var(--color-text);
		font-weight: 600;
		padding: var(--spacing-1) var(--spacing-2);
		background-color: rgba(var(--color-primary-rgb), 0.15);
		border-radius: var(--border-radius-sm);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
	}

	/* Responsive Design */
	@media (max-width: 640px) {
		.breadcrumb {
			padding: var(--spacing-2) var(--spacing-3);
			margin-bottom: var(--spacing-4);
		}

		.breadcrumb li:not(:last-child)::after {
			margin: 0 var(--spacing-1);
		}

		.breadcrumb-link,
		.breadcrumb-text {
			padding: var(--spacing-1);
			font-size: var(--font-size-xs);
		}
	}

	/* Dark Mode Support */
	:global(html.dark) .breadcrumb {
		background-color: var(--color-surface);
		border-color: var(--color-border);
	}

	:global(html.dark) .breadcrumb-link:hover {
		background-color: rgba(var(--color-primary-rgb), 0.2);
	}

	:global(html.dark) .breadcrumb-text {
		background-color: rgba(var(--color-primary-rgb), 0.25);
		border-color: rgba(var(--color-primary-rgb), 0.3);
	}

	/* Enhanced Visual Effects */
	.breadcrumb-link::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(var(--color-primary-rgb), 0.05) 50%,
			transparent 100%
		);
		opacity: 0;
		transition: opacity 0.3s ease;
		border-radius: var(--border-radius-sm);
		z-index: -1;
	}

	.breadcrumb-link:hover::before {
		opacity: 1;
	}

	/* Accessibility - Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.breadcrumb-link {
			transition: color 0.1s ease;
			transform: none;
		}

		.breadcrumb-link:hover {
			transform: none;
		}

		.breadcrumb-link::before {
			transition: none;
		}
	}
</style>
