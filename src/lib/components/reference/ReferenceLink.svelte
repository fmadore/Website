<script lang="ts">
	import { resolve } from '$app/paths';

	// Renders from the ultra-slim citation entry (itemType + precomputed "(Author,
	// Year)" + title) so the inline link never needs the full reference index —
	// that heavier preview data is loaded lazily on hover by <ItemReference>.
	let {
		cite = undefined,
		title = undefined,
		itemType = undefined,
		id,
		label = undefined,
		hasPopup = false,
		isActive = false
	}: {
		cite?: string;
		title?: string;
		itemType?: 'publication' | 'communication' | undefined;
		id: string;
		label?: string;
		hasPopup?: boolean;
		isActive?: boolean;
	} = $props();

	const referenceText = $derived(label ?? cite ?? `(${id})`);

	const itemUrl = $derived(
		itemType
			? resolve(`/${itemType === 'publication' ? 'publications' : 'communications'}/${id}`)
			: '#'
	);

	const ariaLabel = $derived(title ? `View ${itemType ?? 'item'}: ${title}` : `Reference ${id}`);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- pre-resolved via resolve() -->
<a
	href={itemUrl}
	class="reference-link {hasPopup ? 'has-popup' : ''} {isActive ? 'is-active' : ''}"
	aria-label={ariaLabel}
	tabindex={hasPopup ? -1 : 0}
>
	{referenceText}
</a>

<!-- eslint-enable svelte/no-navigation-without-resolve -->

<style>
	.reference-link {
		/* Blend with text flow - enhanced academic citation style */
		display: inline;
		position: relative;
		color: var(--color-primary);
		text-decoration: none;
		font-size: inherit;
		font-weight: var(--font-weight-medium);
		white-space: nowrap;
		padding: 0 0.15em;
		border-radius: var(--border-radius-sm);
		/* Explicit transition properties for better performance */
		transition:
			color var(--duration-moderate) var(--ease-out),
			background-color var(--duration-moderate) var(--ease-out),
			border-color var(--duration-moderate) var(--ease-out),
			box-shadow var(--duration-moderate) var(--ease-out);

		/* Subtle background instead of underline */
		background-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-10) * 100%),
			transparent
		);
		border: var(--border-width-thin) solid transparent;
	}

	.reference-link.has-popup {
		cursor: pointer;
		pointer-events: auto;
	}

	/* Enhanced hover state */
	.reference-link:hover,
	.reference-link:focus-visible {
		color: var(--color-primary-dark);
		background-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-20) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-25) * 100%),
			transparent
		);
	}

	/* Active/clicked state */
	.reference-link:active {
		background-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-25) * 100%),
			transparent
		);
	}

	/* Focus state for accessibility */
	.reference-link:focus-visible {
		outline: var(--border-width-medium) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-40) * 100%), transparent);
		outline-offset: var(--space-2xs);
	}

	/* Dark mode - enhanced adjustments */
	:global(html.dark) .reference-link {
		color: var(--color-accent);
		background-color: color-mix(
			in srgb,
			var(--color-accent) calc(var(--opacity-10) * 100%),
			transparent
		);
	}

	:global(html.dark) .reference-link:hover,
	:global(html.dark) .reference-link:focus-visible {
		color: var(--color-accent);
		background-color: color-mix(
			in srgb,
			var(--color-accent) calc(var(--opacity-20) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-accent) calc(var(--opacity-30) * 100%),
			transparent
		);
		box-shadow: var(--shadow-sm);
	}

	/* Active state when preview is visible */
	.reference-link.is-active {
		color: var(--color-primary-dark);
		background-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-20) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-30) * 100%),
			transparent
		);
		box-shadow: var(--shadow-sm);
	}

	/* Dark mode active state */
	:global(html.dark) .reference-link.is-active {
		color: var(--color-accent);
		background-color: color-mix(
			in srgb,
			var(--color-accent) calc(var(--opacity-25) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-accent) calc(var(--opacity-40) * 100%),
			transparent
		);
		box-shadow: var(--shadow-sm);
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.reference-link {
			transition: none;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.reference-link {
			border-bottom-width: var(--border-width-medium);
			font-weight: var(--font-weight-semibold);
		}

		.reference-link:hover {
			text-decoration: underline;
		}
	}
</style>
