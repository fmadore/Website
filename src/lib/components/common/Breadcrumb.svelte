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
		margin-bottom: var(--spacing-4);
		padding: var(--spacing-3) var(--spacing-5);
		background: radial-gradient(
			circle at 15% 15%,
			rgba(var(--color-primary-rgb), 0.04) 0%,
			rgba(var(--color-accent-rgb), 0.01) 35%,
			var(--color-surface) 65%,
			var(--color-background) 100%
		);
		border-radius: var(--border-radius-lg);
		border: 1px solid rgba(var(--color-primary-rgb), 0.08);
		box-shadow: var(--shadow-md);
		position: relative;
		backdrop-filter: blur(8px);
	}

	/* Enhanced connection line to the page header */
	.breadcrumb::after {
		content: '';
		position: absolute;
		bottom: calc(-1 * var(--spacing-2) - 1px);
		left: var(--spacing-5);
		width: 3rem;
		height: 3px;
		background: linear-gradient(90deg, 
			rgba(var(--color-primary-rgb), 0.4) 0%,
			rgba(var(--color-accent-rgb), 0.3) 50%,
			transparent 100%
		);
		border-radius: var(--border-radius-sm);
		opacity: 0.8;
		box-shadow: 0 1px 2px rgba(var(--color-primary-rgb), 0.1);
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
		margin: 0 var(--spacing-3);
		color: var(--color-primary);
		font-size: var(--font-size-sm);
		font-weight: 600;
		opacity: 0.6;
		text-shadow: 0 1px 2px rgba(var(--color-primary-rgb), 0.1);
	}

	/* Breadcrumb Link Styles */
	.breadcrumb-link {
		color: var(--color-text);
		text-decoration: none;
		padding: var(--spacing-2) var(--spacing-3);
		border-radius: var(--border-radius-md);
		transition: all 0.3s ease;
		position: relative;
		font-weight: 500;
		background: rgba(var(--color-surface-rgb), 0.3);
		border: 1px solid transparent;
	}

	.breadcrumb-link:hover {
		color: var(--color-primary);
		background: linear-gradient(135deg, 
			rgba(var(--color-primary-rgb), 0.1) 0%, 
			rgba(var(--color-accent-rgb), 0.05) 100%
		);
		border-color: rgba(var(--color-primary-rgb), 0.2);
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	.breadcrumb-link:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	/* Active/Current Page Styles */
	.breadcrumb-text {
		color: var(--color-primary);
		font-weight: 700;
		padding: var(--spacing-2) var(--spacing-3);
		background: linear-gradient(135deg, 
			rgba(var(--color-primary-rgb), 0.2) 0%, 
			rgba(var(--color-accent-rgb), 0.15) 100%
		);
		border-radius: var(--border-radius-md);
		border: 1px solid rgba(var(--color-primary-rgb), 0.3);
		box-shadow: inset 0 1px 2px rgba(var(--color-primary-rgb), 0.1);
	}

	/* Responsive Design */
	@media (max-width: 640px) {
		.breadcrumb {
			padding: var(--spacing-3) var(--spacing-4);
			margin-bottom: var(--spacing-3);
		}

		.breadcrumb li:not(:last-child)::after {
			margin: 0 var(--spacing-2);
		}

		.breadcrumb-link,
		.breadcrumb-text {
			padding: var(--spacing-1) var(--spacing-2);
			font-size: var(--font-size-xs);
		}

		.breadcrumb::after {
			left: var(--spacing-4);
			width: 2rem;
		}
	}

	/* Dark Mode Support */
	:global(html.dark) .breadcrumb {
		background: radial-gradient(
			circle at 15% 15%,
			rgba(var(--color-primary-rgb), 0.1) 0%,
			rgba(var(--color-accent-rgb), 0.05) 35%,
			var(--color-dark-surface-alt) 65%,
			var(--color-dark-surface-deep) 100%
		);
		border-color: rgba(var(--color-primary-rgb), 0.15);
		box-shadow: var(--shadow-lg);
	}

	:global(html.dark) .breadcrumb::after {
		background: linear-gradient(90deg, 
			rgba(var(--color-primary-rgb), 0.5) 0%,
			rgba(var(--color-accent-rgb), 0.4) 50%,
			transparent 100%
		);
		box-shadow: 0 1px 3px rgba(var(--color-primary-rgb), 0.2);
	}

	:global(html.dark) .breadcrumb-link {
		color: var(--color-text);
		background: rgba(var(--color-dark-surface-rgb), 0.4);
	}

	:global(html.dark) .breadcrumb-link:hover {
		background: linear-gradient(135deg, 
			rgba(var(--color-primary-rgb), 0.2) 0%, 
			rgba(var(--color-accent-rgb), 0.1) 100%
		);
		border-color: rgba(var(--color-primary-rgb), 0.3);
	}

	:global(html.dark) .breadcrumb-text {
		background: linear-gradient(135deg, 
			rgba(var(--color-primary-rgb), 0.3) 0%, 
			rgba(var(--color-accent-rgb), 0.25) 100%
		);
		border-color: rgba(var(--color-primary-rgb), 0.4);
		box-shadow: inset 0 1px 2px rgba(var(--color-primary-rgb), 0.2);
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
			135deg,
			rgba(var(--color-primary-rgb), 0.03) 0%,
			rgba(var(--color-accent-rgb), 0.02) 50%,
			transparent 100%
		);
		opacity: 0;
		transition: opacity 0.3s ease;
		border-radius: var(--border-radius-md);
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

		.breadcrumb::after {
			display: none;
		}
	}
</style>
