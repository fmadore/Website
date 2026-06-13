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
		/* Plain orientation line — no tile, no shadow, no decorative connector.
		 * The breadcrumb just orients the reader above the headline; boxing it
		 * gave a one-line nav the visual weight of content. */
		font-size: var(--font-size-sm);
		margin-bottom: var(--space-md);
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
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
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
	}

	/* Accessibility - Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.breadcrumb-link::after {
			transition: none;
		}

		.breadcrumb-link:hover::after {
			width: 100%;
		}
	}
</style>
