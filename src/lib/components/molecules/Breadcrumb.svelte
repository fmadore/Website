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
		/* Paper breadcrumb — content nav chip, not sticky chrome. backdrop-filter
		 * + radial gradient were decorative; replaced with a single warm-tinted
		 * surface and a quiet shadow. */
		font-size: var(--font-size-sm);
		margin-bottom: var(--space-md);
		padding: var(--space-sm) var(--space-md-tight);
		background: color-mix(in srgb, var(--color-primary) 4%, var(--color-surface));
		border-radius: var(--border-radius-lg);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-10) * 100%), transparent);
		box-shadow: var(--shadow-sm);
		position: relative;
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

	/* Breadcrumb Link Styles — editorial underline-expand pattern, matching
	 * NavLink. Quieter than the previous button-tile hover (which stacked
	 * background + border + ::before gradient). */
	.breadcrumb-link {
		color: var(--color-text);
		text-decoration: none;
		padding: var(--space-2xs) 0;
		transition: color var(--duration-fast) var(--ease-out);
		position: relative;
		font-weight: var(--font-weight-medium);
	}

	.breadcrumb-link::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 0;
		height: var(--border-width-thin);
		background-color: var(--color-primary);
		border-radius: var(--border-radius-full);
		transition: width var(--duration-normal) var(--ease-out);
	}

	.breadcrumb-link:hover {
		color: var(--color-primary);
	}

	.breadcrumb-link:hover::after {
		width: 100%;
	}

	.breadcrumb-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: var(--space-2xs);
		border-radius: var(--border-radius-sm);
	}

	@media (hover: none) {
		.breadcrumb-link:hover::after {
			width: 0;
		}

		.breadcrumb-link:active::after {
			width: 100%;
		}
	}

	/* Active/Current Page — primary text, no chip background. The page
	 * heading immediately below acts as the dominant title; the breadcrumb
	 * just orients the reader. */
	.breadcrumb-text {
		color: var(--color-primary);
		font-weight: var(--font-weight-semibold);
		padding: var(--space-2xs) 0;
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
			padding: var(--space-2xs) 0;
			font-size: var(--font-size-xs);
		}

		.breadcrumb::after {
			left: var(--space-md);
			width: var(--space-xl);
		}
	}

	/* Dark Mode — keep the paper-tile feel but use warm surface tokens. The
	 * radial-gradient + heavy shadow that lived here previously was extra
	 * chrome for a small content nav strip. */
	:global(html.dark) .breadcrumb {
		background: color-mix(in srgb, var(--color-primary) 6%, var(--color-surface-alt));
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-15) * 100%),
			transparent
		);
		box-shadow: var(--shadow-sm);
	}

	:global(html.dark) .breadcrumb-link {
		color: var(--color-text);
	}

	/* Accessibility - Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.breadcrumb-link::after {
			transition: none;
		}

		.breadcrumb-link:hover::after {
			width: 100%;
		}

		.breadcrumb::after {
			display: none;
		}
	}
</style>
