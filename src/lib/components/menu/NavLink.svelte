<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		href,
		active = false,
		hasDropdown = false,
		onclick,
		onkeydown,
		// 'hover' (not 'eager'): eager preloading downloads EVERY nav target's
		// route code immediately on load — even for the desktop nav that's
		// display:none on mobile — pulling the whole app (incl. the full
		// publications/communications datasets) into the home page's critical
		// path. 'hover' preloads on pointer-hover (desktop) / touchstart (mobile),
		// so navigation still feels instant with zero upfront cost.
		preloadStrategy = 'hover',
		children,
		...restProps
	}: {
		href: string;
		active?: boolean;
		hasDropdown?: boolean;
		onclick?: (event: MouseEvent) => void;
		onkeydown?: (event: KeyboardEvent) => void;
		preloadStrategy?: 'eager' | 'hover' | 'tap' | 'off';
		children?: Snippet;
		[key: string]: unknown;
	} = $props();
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- prop passthrough, caller responsible for resolving -->
<a
	{href}
	class="nav-link"
	class:active
	aria-haspopup={hasDropdown ? 'true' : 'false'}
	data-sveltekit-preload-code={preloadStrategy}
	{onclick}
	{onkeydown}
	{...restProps}
>
	{@render children?.()}
	{#if hasDropdown}
		<span class="dropdown-icon">▾</span>
	{/if}
</a>

<!-- eslint-enable svelte/no-navigation-without-resolve -->

<style>
	/* Nav link — the DATA voice: mono, letterspaced caps, muted ink. The
	 * current section is pine with a persistent 2px accent underline. */
	.nav-link {
		font-family: var(--font-family-mono);
		color: var(--color-text-soft);
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		font-size: var(--font-size-2xs);
		letter-spacing: 0.13em;
		text-transform: uppercase;
		padding: var(--space-2) 0;
		transition: color var(--duration-fast) var(--ease-out);
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--space-1);
		white-space: nowrap;
	}

	/* Underline — a square-cut pine rule that grows on hover and holds
	 * on the active section. */
	.nav-link::after {
		content: '';
		position: absolute;
		bottom: calc(-1 * var(--space-0-5));
		left: 0;
		width: 0;
		height: var(--border-width-medium);
		background-color: var(--color-accent);
		transition: width var(--duration-fast) var(--ease-out);
	}

	.nav-link:hover {
		color: var(--color-text-emphasis);
	}

	.nav-link:hover::after,
	.nav-link.active::after {
		width: 100%;
	}

	.nav-link.active {
		color: var(--color-accent);
	}

	.dropdown-icon {
		display: inline-block;
		font-size: var(--font-size-2xs);
		transition: transform var(--duration-fast) var(--ease-out);
		line-height: 1;
	}

	.nav-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-1);
		border-radius: 0;
	}

	@media (hover: none) {
		/* Prevent hover state issues on touch devices */
		.nav-link:hover::after {
			width: 0;
		}

		.nav-link:active::after {
			width: 100%;
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.nav-link::after {
			height: calc(var(--border-width-medium) + var(--border-width-thin));
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.nav-link,
		.nav-link::after,
		.dropdown-icon {
			transition: none;
		}
	}
</style>
