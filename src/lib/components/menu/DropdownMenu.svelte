<script lang="ts">
	import type { NavItem } from '$lib/types/navigation';

	let {
		items,
		isActive = false,
		parentName = '',
		onItemClick = () => {}
	}: {
		items: NavItem[];
		isActive?: boolean;
		parentName?: string;
		onItemClick?: () => void;
	} = $props();
</script>

<div class="dropdown-menu" class:active={isActive}>
	<ul role="menu" aria-label={`${parentName} submenu`}>
		{#each items as item (item.path)}
			<li role="none">
				<!-- eslint-disable svelte/no-navigation-without-resolve -- path pre-resolved in navigation data -->
				<a
					href={item.path}
					class="dropdown-item"
					data-sveltekit-preload-code="eager"
					onclick={onItemClick}
					role="menuitem"
					target={item.path.startsWith('http') ? '_blank' : null}
					rel={item.path.startsWith('http')
						? `noopener noreferrer${item.rel ? ` ${item.rel}` : ''}`
						: null}
				>
					{item.name}
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</li>
		{/each}
	</ul>
</div>

<style>
	/*
	 * Dropdown popover — warm paper surface with a single chrome blur.
	 * Previously layered white-based glass with inset highlight + inset
	 * lowlight; replaced with a single warm-tinted surface and one shadow.
	 * Opens over body content, so blur is legitimate chrome.
	 */
	.dropdown-menu {
		position: absolute;
		top: calc(100% + var(--space-3));
		left: 0;
		z-index: var(--z-dropdown);
		min-width: min(90vw, var(--content-width-xs));
		width: max-content;
		max-width: min(100vw, var(--content-width-sm));
		background: color-mix(
			in srgb,
			var(--color-surface-elevated) calc(var(--header-dropdown-opacity) * 100%),
			transparent
		);
		backdrop-filter: blur(var(--header-blur, var(--header-blur-fallback))) saturate(180%);
		-webkit-backdrop-filter: blur(var(--header-blur, var(--header-blur-fallback))) saturate(180%);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-lg);
		padding: var(--space-3);
		opacity: 0;
		visibility: hidden;
		transform: translateY(calc(-1 * var(--transform-distance-sm)));
		transition:
			opacity var(--duration-normal) var(--ease-out),
			visibility var(--duration-normal) var(--ease-out),
			transform var(--duration-normal) var(--ease-out);
		pointer-events: none;
		will-change: opacity, transform, visibility;
	}

	/* Solid fallback for browsers without backdrop-filter support. */
	@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
		.dropdown-menu {
			background: var(--color-background);
		}
	}

	.dropdown-menu.active {
		opacity: 1;
		visibility: visible;
		transform: translateY(0);
		pointer-events: auto;
	}

	.dropdown-menu ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	/*
	 * Dropdown items — editorial list, not dashboard chips. No sliding
	 * shimmer ::before, no scale-on-hover. Hover conveys state via a soft
	 * warm tint + colour shift + a quiet translateX nudge.
	 */
	:global(.dropdown-item) {
		display: block;
		padding: var(--space-3) var(--space-4);
		color: var(--color-text);
		text-decoration: none;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		border-radius: var(--border-radius-md);
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			transform var(--duration-normal) var(--ease-out);
		margin-bottom: var(--space-2);
		position: relative;
		will-change: transform, background-color;
	}

	:global(.dropdown-item:hover),
	:global(.dropdown-item:focus) {
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-10) * 100%),
			transparent
		);
		color: var(--color-primary);
		transform: translateX(var(--space-2));
	}

	:global(.dropdown-item:focus-visible) {
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: var(--space-0-5);
		border-radius: var(--border-radius-md);
	}

	:global(.dropdown-item:last-child) {
		margin-bottom: 0;
	}

	/* Dark mode — warm dusk surface matching the header. */
	:global(html.dark) .dropdown-menu {
		background: color-mix(
			in srgb,
			var(--color-surface-alt) calc(var(--header-dropdown-opacity) * 100%),
			transparent
		);
		border: var(--border-width-thin) solid var(--color-border-dark);
		box-shadow: var(--shadow-lg);
	}

	/* Touch device optimizations */
	@media (hover: none) {
		:global(.dropdown-item:hover) {
			background-color: transparent;
			color: var(--color-text);
			transform: none;
		}

		:global(.dropdown-item:active) {
			background-color: var(--color-primary);
			color: var(--color-background);
		}
	}

	/* ===== MODERN ANIMATION SYSTEM ===== */
	/* Dropdown open animation using transform-based keyframes */
	@keyframes dropdownReveal {
		from {
			opacity: 0;
			transform: translateY(calc(-1 * var(--transform-distance-sm)));
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.dropdown-menu.active {
		animation: dropdownReveal var(--duration-normal) var(--ease-out) forwards;
	}

	/* Staggered item reveal animation */
	@keyframes dropdownItemReveal {
		from {
			opacity: 0;
			transform: translateX(calc(-1 * var(--transform-distance-sm)));
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	/* Base item state - visible by default, animated when parent is active */
	:global(.dropdown-item) {
		opacity: 0;
		transform: translateX(calc(-1 * var(--transform-distance-sm)));
	}

	.dropdown-menu.active :global(.dropdown-item) {
		animation: dropdownItemReveal var(--duration-fast) var(--ease-out) forwards;
	}

	/* Stagger delays using design tokens */
	.dropdown-menu.active :global(.dropdown-item:nth-child(1)) {
		animation-delay: var(--stagger-1);
	}

	.dropdown-menu.active :global(.dropdown-item:nth-child(2)) {
		animation-delay: var(--stagger-2);
	}

	.dropdown-menu.active :global(.dropdown-item:nth-child(3)) {
		animation-delay: var(--stagger-3);
	}

	.dropdown-menu.active :global(.dropdown-item:nth-child(4)) {
		animation-delay: var(--stagger-4);
	}

	.dropdown-menu.active :global(.dropdown-item:nth-child(5)) {
		animation-delay: var(--stagger-5);
	}

	.dropdown-menu.active :global(.dropdown-item:nth-child(n + 6)) {
		animation-delay: var(--stagger-6);
	}

	/* ===== REDUCED MOTION SUPPORT ===== */
	/* Respect user preference for reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.dropdown-menu {
			transition: opacity var(--duration-instant) linear;
			transform: translateY(0);
		}

		.dropdown-menu.active {
			animation: none;
			opacity: 1;
		}

		:global(.dropdown-item) {
			animation: none !important;
			opacity: 1 !important;
			transform: none !important;
			transition:
				background-color var(--duration-instant) linear,
				color var(--duration-instant) linear;
			will-change: auto;
		}

		:global(.dropdown-item:hover),
		:global(.dropdown-item:focus) {
			transform: none;
		}
	}

	/* ===== PERFORMANCE OPTIMIZATION ===== */
	/* Remove will-change after animation completes for better memory usage */
	.dropdown-menu:not(.active) {
		will-change: auto;
	}
</style>
