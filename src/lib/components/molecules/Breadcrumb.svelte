<script lang="ts">
	import { resolve } from '$app/paths';

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
				<a href={resolve('/')} class="breadcrumb-link">Home</a>
			</li>
		{/if}

		{#each items as item, i (item.href)}
			<li>
				{#if i === items.length - 1}
					<span aria-current="page" class="breadcrumb-text">
						{item.label}
					</span>
				{:else}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href passed from caller, pre-resolved -->
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
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-5) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-5) * 100%), transparent) 35%,
			var(--color-surface) 65%,
			var(--color-background) 100%
		);
		border-radius: var(--border-radius-lg);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-10) * 100%), transparent);
		box-shadow: var(--shadow-md);
		position: relative;
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
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
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-30) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-15) * 100%), transparent) 50%,
			transparent 100%
		);
		border-radius: var(--border-radius-sm);
		opacity: var(--opacity-90);
		box-shadow: 0 var(--border-width-thin) var(--space-2xs)
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-15) * 100%), transparent);
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
		opacity: var(--opacity-90);
		text-shadow: 0 var(--border-width-thin) var(--space-2xs)
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-15) * 100%), transparent);
	}

	/* Breadcrumb Link Styles */
	.breadcrumb-link {
		color: var(--color-text);
		text-decoration: none;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--border-radius-md);
		transition:
			color var(--duration-moderate) var(--ease-in-out),
			background var(--duration-moderate) var(--ease-in-out),
			border-color var(--duration-moderate) var(--ease-in-out),
			transform var(--duration-moderate) var(--ease-in-out),
			box-shadow var(--duration-moderate) var(--ease-in-out);
		position: relative;
		font-weight: var(--font-weight-medium);
		background: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-15) * 100%),
			transparent
		);
		border: var(--border-width-thin) solid transparent;
	}

	.breadcrumb-link:hover {
		color: var(--color-primary);
		background: color-mix(in srgb, var(--color-primary) 10%, transparent);
		border-color: color-mix(in srgb, var(--color-primary) 25%, transparent);
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
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-30) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-15) * 100%), transparent) 100%
		);
		border-radius: var(--border-radius-md);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-15) * 100%), transparent);
		box-shadow: inset 0 var(--border-width-thin) var(--space-2xs)
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-15) * 100%), transparent);
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
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-15) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-10) * 100%), transparent) 35%,
			var(--color-surface-alt) 65%,
			var(--color-background) 100%
		);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-15) * 100%),
			transparent
		);
		box-shadow: var(--shadow-lg);
	}

	:global(html.dark) .breadcrumb::after {
		background: linear-gradient(
			90deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-30) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-15) * 100%), transparent) 50%,
			transparent 100%
		);
		box-shadow: 0 var(--border-width-thin) var(--space-2xs)
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-30) * 100%), transparent);
	}

	:global(html.dark) .breadcrumb-link {
		color: var(--color-text);
		background: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-15) * 100%),
			transparent
		);
	}

	:global(html.dark) .breadcrumb-link:hover {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-30) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-15) * 100%), transparent) 100%
		);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-15) * 100%),
			transparent
		);
	}

	:global(html.dark) .breadcrumb-text {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-15) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-30) * 100%), transparent) 100%
		);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-15) * 100%),
			transparent
		);
		box-shadow: inset 0 var(--border-width-thin) var(--space-2xs)
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-30) * 100%), transparent);
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
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-5) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-5) * 100%), transparent) 50%,
			transparent 100%
		);
		opacity: 0;
		transition: opacity var(--duration-moderate) var(--ease-in-out);
		border-radius: var(--border-radius-md);
		z-index: -1;
	}

	.breadcrumb-link:hover::before {
		opacity: 1;
	}

	/* Accessibility - Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.breadcrumb-link {
			transition: color var(--duration-fast) var(--ease-in-out);
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
