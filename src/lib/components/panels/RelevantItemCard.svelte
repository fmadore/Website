<script lang="ts">
	import { base } from '$app/paths';
	import type { RelevantItem } from '$lib/components/panels/RelevantItemsList.svelte';

	// Props - same interface as the old ItemCard for compatibility
	let {
		item,
		basePath,
		formatType,
		formatAuthors
	}: {
		item: RelevantItem;
		basePath: string; // Base path for the item detail link
		formatType: (type: string) => string;
		formatAuthors: (authors: string[]) => string;
	} = $props();

	// Construct the link URL
	let itemLink = $derived(`${base}${basePath}/${item.id}`);
</script>

<div class="relevant-item">
	<div class="relevant-item-meta">
		{#if item.type}
			<span class="relevant-item-type">{formatType(item.type)}</span>
		{/if}
		<span class="relevant-item-date">{item.date}</span>
	</div>

	<h3 class="relevant-item-title">
		<a href={itemLink}>{item.title}</a>
	</h3>

	{#if item.authors && item.authors.length > 0}
		<div class="relevant-item-authors">
			{formatAuthors(item.authors)}
		</div>
	{/if}

	{#if item.abstract}
		<div class="relevant-item-abstract">
			{item.abstract.length > 120 ? item.abstract.substring(0, 120) + '...' : item.abstract}
		</div>
	{/if}

	<div class="relevant-item-action">
		<a href={itemLink} class="relevant-item-link"> View details → </a>
	</div>
</div>

<style>
	.relevant-item {
		position: relative;
		padding: var(--space-4);
		border-radius: var(--border-radius-md);
		overflow: hidden;
		will-change: transform, box-shadow;
		transition:
			transform var(--duration-normal) var(--ease-out),
			background var(--duration-normal) var(--ease-out),
			border-color var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out);
		/* Use glass-card utility for consistent glassmorphism */
		background: color-mix(
			in srgb,
			var(--color-white) calc(var(--card-glass-opacity-light) * 100%),
			transparent
		);
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		border: var(--border-width-thin) solid
			color-mix(
				in srgb,
				var(--color-white) calc(var(--card-glass-border-light) * 100%),
				transparent
			);
		box-shadow:
			0 8px 32px 0
				color-mix(
					in srgb,
					rgb(var(--card-shadow-color)) calc(var(--card-shadow-opacity) * 100%),
					transparent
				),
			inset 0 1px 0
				color-mix(
					in srgb,
					var(--color-white) calc(var(--card-glass-inset-light) * 100%),
					transparent
				);
	}

	.relevant-item::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 0;
		background: linear-gradient(180deg, var(--color-accent) 0%, var(--color-highlight) 100%);
		border-radius: var(--border-radius-md) 0 0 var(--border-radius-md);
		transition: width var(--duration-normal) var(--ease-out);
		opacity: var(--opacity-high);
	}

	.relevant-item:hover::before {
		width: var(--border-width-thick);
	}

	.relevant-item:hover {
		transform: var(--transform-lift-sm);
		background: color-mix(
			in srgb,
			var(--color-white) calc(var(--card-glass-opacity-light-hover) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--card-glass-border-light-hover) * 100%),
			transparent
		);
		box-shadow:
			0 12px 40px 0
				color-mix(
					in srgb,
					rgb(var(--card-shadow-color)) calc(var(--card-shadow-opacity-hover) * 100%),
					transparent
				),
			inset 0 1px 0
				color-mix(
					in srgb,
					var(--color-white) calc(var(--card-glass-inset-light-hover) * 100%),
					transparent
				);
	}

	.relevant-item-meta {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.relevant-item-type {
		font-size: var(--font-size-xs);
		text-transform: uppercase;
		font-weight: var(--font-weight-semibold);
		color: var(--color-accent);
		background-color: color-mix(
			in srgb,
			var(--color-accent) calc(var(--opacity-medium) * 100%),
			transparent
		);
		padding: var(--space-1) var(--space-3);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-medium-high) * 100%), transparent);
		border-radius: var(--border-radius-full);
		transition:
			color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.relevant-item-date {
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		min-width: 0;
		line-height: var(--line-height-snug);
	}

	.relevant-item-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		margin: 0 0 var(--space-2) 0;
		line-height: var(--line-height-relaxed);
	}

	.relevant-item-title a {
		color: var(--color-text);
		text-decoration: none;
		transition: color var(--duration-normal) var(--ease-out);
	}

	.relevant-item-title a:hover {
		color: var(--color-accent);
	}

	.relevant-item-authors {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		font-style: italic;
		margin-bottom: var(--space-2);
		line-height: var(--line-height-relaxed);
	}

	.relevant-item-abstract {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		line-height: var(--line-height-relaxed);
		margin-bottom: var(--space-3);
	}

	.relevant-item-action {
		margin-top: auto;
	}

	.relevant-item-link {
		color: var(--color-accent);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-sm);
		transition: color var(--duration-normal) var(--ease-out);
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		position: relative;
		overflow: hidden;
	}

	.relevant-item-link::before {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 0;
		height: var(--border-width-thin);
		background: var(--color-accent);
		transition: width var(--duration-normal) var(--ease-out);
	}

	.relevant-item-link:hover {
		color: var(--color-highlight);
		text-decoration: none;
	}

	.relevant-item-link:hover::before {
		width: 100%;
	}

	/* Dark mode overrides */
	:global(html.dark) .relevant-item {
		background: color-mix(
			in srgb,
			var(--color-black) calc(var(--card-glass-opacity-dark) * 100%),
			transparent
		);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--card-glass-border-dark) * 100%), transparent);
		box-shadow:
			0 8px 32px 0
				color-mix(
					in srgb,
					rgb(var(--card-shadow-color)) calc(var(--card-shadow-opacity) * 100%),
					transparent
				),
			0 2px 8px 0 color-mix(in srgb, var(--color-black) calc(var(--opacity-5) * 100%), transparent),
			inset 0 1px 0
				color-mix(
					in srgb,
					var(--color-white) calc(var(--card-glass-inset-dark) * 100%),
					transparent
				);
	}

	:global(html.dark) .relevant-item:hover {
		background: color-mix(
			in srgb,
			var(--color-black) calc(var(--card-glass-opacity-dark-hover) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--card-glass-border-dark-hover) * 100%),
			transparent
		);
		box-shadow:
			0 12px 40px 0
				color-mix(
					in srgb,
					rgb(var(--card-shadow-color)) calc(var(--card-shadow-opacity-hover) * 100%),
					transparent
				),
			0 4px 12px 0
				color-mix(in srgb, var(--color-black) calc(var(--opacity-10) * 100%), transparent),
			inset 0 1px 0
				color-mix(
					in srgb,
					var(--color-white) calc(var(--card-glass-inset-dark-hover) * 100%),
					transparent
				);
	}

	:global(html.dark) .relevant-item-type {
		background-color: color-mix(
			in srgb,
			var(--color-accent) calc(var(--opacity-medium) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-accent) calc(var(--opacity-medium-high) * 100%),
			transparent
		);
	}

	/* Responsive design */
	@media (max-width: 640px) {
		.relevant-item-meta {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-2);
		}

		.relevant-item-date {
			align-self: flex-end;
		}

		.relevant-item-title {
			font-size: var(--font-size-base);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.relevant-item,
		.relevant-item::before,
		.relevant-item-title a,
		.relevant-item-type,
		.relevant-item-link,
		.relevant-item-link::before {
			transition: none !important;
			will-change: auto !important;
		}

		.relevant-item:hover {
			transform: none !important;
		}
	}
</style>
