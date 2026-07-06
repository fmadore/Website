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
		/* Orientation line in the DATA voice: mono, letterspaced caps, faint ink,
		 * " / " separators. No tile, no shadow — the headline below carries the
		 * weight; the breadcrumb just stamps the path like a finding-aid header. */
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.1em;
		text-transform: uppercase;
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
		content: '/';
		margin: 0 var(--space-2);
		color: var(--color-text-muted);
	}

	/* Links read as faint ink and turn pine on hover — instant colour, no
	 * moving underline (the redesign keeps chrome nearly motionless). */
	.breadcrumb-link {
		color: var(--color-text-light);
		text-decoration: none;
		padding: var(--space-2xs) 0;
		transition: color var(--duration-fast) var(--ease-out);
		font-weight: var(--font-weight-medium);
	}

	.breadcrumb-link:hover {
		color: var(--color-accent);
	}

	.breadcrumb-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-2xs);
	}

	/* Active/Current Page — solid ink, the stamp of "you are here". */
	.breadcrumb-text {
		color: var(--color-text-emphasis);
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
		.breadcrumb-link {
			transition: none;
		}
	}
</style>
