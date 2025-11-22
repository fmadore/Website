<script lang="ts">
	import { base } from '$app/paths';
	import { scrollAnimate } from '$lib/utils/scrollAnimations';
	import { DELAY_STEP } from '$lib/utils/animationConstants';

	let {
		items = [],
		showHomeLink = true,
		animationDelay = DELAY_STEP
	}: {
		items: { label: string; href: string }[];
		showHomeLink?: boolean;
		animationDelay?: number;
	} = $props();
</script>

<nav
	aria-label="Breadcrumb"
	class="breadcrumb"
	use:scrollAnimate={{ delay: animationDelay, animationClass: 'fade-in-up' }}
>
	<ol>
		{#if showHomeLink}
			<li>
				<a href={`${base}/`} class="breadcrumb-link">Home</a>
			</li>
		{/if}

		{#each items as item, i (item.href)}
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
		margin-bottom: var(--space-md);
		padding: var(--space-sm) var(--space-md-tight);
		background: radial-gradient(
			circle at 15% 15%,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 35%,
			var(--color-surface) 65%,
			var(--color-background) 100%
		);
		border-radius: var(--border-radius-lg);
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-low));
		box-shadow: var(--shadow-md);
		position: relative;
		backdrop-filter: blur(var(--glass-blur-amount));
	}

	/* Enhanced connection line to the page header */
	.breadcrumb::after {
		content: '';
		position: absolute;
		bottom: calc(-1 * var(--space-xs) - var(--border-width-thin));
		left: var(--space-md-tight);
		width: var(--space-2xl);
		height: var(--space-2xs);
		background: linear-gradient(
			90deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium-high)) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-medium)) 50%,
			transparent 100%
		);
		border-radius: var(--border-radius-sm);
		opacity: var(--opacity-high);
		box-shadow: 0 var(--border-width-thin) var(--space-2xs)
			rgba(var(--color-primary-rgb), var(--opacity-medium));
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
		margin: 0 var(--space-sm);
		color: var(--color-primary);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		opacity: var(--opacity-high);
		text-shadow: 0 var(--border-width-thin) var(--space-2xs)
			rgba(var(--color-primary-rgb), var(--opacity-medium));
	}

	/* Breadcrumb Link Styles */
	.breadcrumb-link {
		color: var(--color-text);
		text-decoration: none;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--border-radius-md);
		transition:
			color var(--anim-duration-base) var(--anim-ease-base),
			background var(--anim-duration-base) var(--anim-ease-base),
			border-color var(--anim-duration-base) var(--anim-ease-base),
			transform var(--anim-duration-base) var(--anim-ease-base),
			box-shadow var(--anim-duration-base) var(--anim-ease-base);
		position: relative;
		font-weight: var(--font-weight-medium);
		background: rgba(var(--color-surface-rgb), var(--opacity-medium));
		border: var(--border-width-thin) solid transparent;
	}

	.breadcrumb-link:hover {
		color: var(--color-primary);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-low)) 100%
		);
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium-high));
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-sm);
	}

	.breadcrumb-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: var(--space-2xs);
	}

	/* Active/Current Page Styles */
	.breadcrumb-text {
		color: var(--color-primary);
		font-weight: var(--font-weight-bold);
		padding: var(--space-xs) var(--space-sm);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium-high)) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-medium)) 100%
		);
		border-radius: var(--border-radius-md);
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-medium));
		box-shadow: inset 0 var(--border-width-thin) var(--space-2xs)
			rgba(var(--color-primary-rgb), var(--opacity-medium));
	}

	/* Responsive Design */
	@media (--sm) {
		.breadcrumb {
			padding: var(--space-sm) var(--space-md);
			margin-bottom: var(--space-sm);
		}

		.breadcrumb li:not(:last-child)::after {
			margin: 0 var(--space-xs);
		}

		.breadcrumb-link,
		.breadcrumb-text {
			padding: var(--space-2xs) var(--space-xs);
			font-size: var(--font-size-xs);
		}

		.breadcrumb::after {
			left: var(--space-md);
			width: var(--space-xl);
		}
	}

	/* Dark Mode Support */
	:global(html.dark) .breadcrumb {
		background: radial-gradient(
			circle at 15% 15%,
			rgba(var(--color-primary-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-low)) 35%,
			var(--color-surface-alt) 65%,
			var(--color-background) 100%
		);
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium));
		box-shadow: var(--shadow-lg);
	}

	:global(html.dark) .breadcrumb::after {
		background: linear-gradient(
			90deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium-high)) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-medium)) 50%,
			transparent 100%
		);
		box-shadow: 0 var(--border-width-thin) var(--space-2xs)
			rgba(var(--color-primary-rgb), var(--opacity-medium-high));
	}

	:global(html.dark) .breadcrumb-link {
		color: var(--color-text);
		background: rgba(var(--color-surface-rgb), var(--opacity-medium));
	}

	:global(html.dark) .breadcrumb-link:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium-high)) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-medium)) 100%
		);
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium));
	}

	:global(html.dark) .breadcrumb-text {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-medium-high)) 100%
		);
		border-color: rgba(var(--color-primary-rgb), var(--opacity-medium));
		box-shadow: inset 0 var(--border-width-thin) var(--space-2xs)
			rgba(var(--color-primary-rgb), var(--opacity-medium-high));
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
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 50%,
			transparent 100%
		);
		opacity: 0;
		transition: opacity var(--anim-duration-base) var(--anim-ease-base);
		border-radius: var(--border-radius-md);
		z-index: -1;
	}

	.breadcrumb-link:hover::before {
		opacity: 1;
	}

	/* Accessibility - Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.breadcrumb-link {
			transition: color var(--anim-duration-fast) var(--anim-ease-base);
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
