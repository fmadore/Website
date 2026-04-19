<script lang="ts">
	import { tick } from 'svelte';
	import type { NavItem } from '$lib/types/navigation';
	import ThemeToggle from '$lib/components/menu/ThemeToggle.svelte';
	import { resolve } from '$app/paths';

	let {
		navItems,
		isActive = false,
		onCloseMenu
	}: {
		navItems: NavItem[];
		isActive?: boolean;
		onCloseMenu: () => void;
	} = $props();

	let containerEl: HTMLDivElement | null = $state(null);
	let closeButtonEl: HTMLButtonElement | null = $state(null);
	let previouslyFocused: HTMLElement | null = null;

	// Move focus into the menu when it opens and restore it to the element
	// that triggered opening (the hamburger) when it closes.
	$effect(() => {
		if (isActive) {
			previouslyFocused = document.activeElement as HTMLElement | null;
			tick().then(() => {
				closeButtonEl?.focus();
			});
		} else if (previouslyFocused) {
			previouslyFocused.focus?.();
			previouslyFocused = null;
		}
	});

	function getFocusable(): HTMLElement[] {
		if (!containerEl) return [];
		return Array.from(
			containerEl.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
			)
		).filter((el) => !el.hasAttribute('aria-hidden'));
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!isActive) return;

		if (event.key === 'Escape') {
			event.preventDefault();
			onCloseMenu();
			return;
		}

		if (event.key !== 'Tab') return;

		const focusable = getFocusable();
		if (focusable.length === 0) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const active = document.activeElement as HTMLElement | null;

		if (event.shiftKey && active === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && active === last) {
			event.preventDefault();
			first.focus();
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<div
	id="mobile-menu"
	class="mobile-nav-container"
	class:active={isActive}
	bind:this={containerEl}
	aria-hidden={isActive ? 'false' : 'true'}
>
	<nav class="mobile-nav" aria-label="Mobile navigation">
		<!-- Mobile Menu Header -->
		<div class="mobile-nav-header">
			<ThemeToggle size={20} />

			<a href={resolve('/')} class="mobile-site-title" onclick={onCloseMenu}> Frédérick Madore </a>

			<!-- Close button -->
			<button
				class="mobile-close-button"
				onclick={onCloseMenu}
				aria-label="Close navigation menu"
				bind:this={closeButtonEl}
			>
				<span class="mobile-close-line"></span>
				<span class="mobile-close-line"></span>
			</button>
		</div>

		<ul class="mobile-nav-list">
			{#each navItems as item (item.path)}
				<li class="mobile-nav-item">
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- path pre-resolved in navigation data -->
					<a href={item.path} class="mobile-nav-link" onclick={onCloseMenu}>
						{item.name}
					</a>

					{#if item.dropdown}
						<ul class="mobile-dropdown">
							{#each item.dropdown as subItem (subItem.path)}
								<li class="mobile-dropdown-item">
									<!-- eslint-disable svelte/no-navigation-without-resolve -- path pre-resolved in navigation data -->
									<a
										href={subItem.path}
										class="mobile-dropdown-link"
										onclick={onCloseMenu}
										target={subItem.path.startsWith('http') ? '_blank' : null}
										rel={subItem.path.startsWith('http')
											? `noopener noreferrer${subItem.rel ? ` ${subItem.rel}` : ''}`
											: null}
									>
										{subItem.name}
									</a>
									<!-- eslint-enable svelte/no-navigation-without-resolve -->
								</li>
							{/each}
						</ul>
					{/if}
				</li>
			{/each}
		</ul>
	</nav>
</div>

<style>
	.mobile-nav-container {
		position: fixed;
		top: 0;
		left: 0;
		height: 100vh;
		width: 100%;
		background: color-mix(
			in srgb,
			var(--color-white) calc(var(--header-overlay-opacity) * 100%),
			transparent
		);
		backdrop-filter: blur(var(--header-blur, var(--header-blur-fallback))) saturate(180%);
		-webkit-backdrop-filter: blur(var(--header-blur, var(--header-blur-fallback))) saturate(180%);
		z-index: var(--z-modal);
		transform: translateY(-100%);
		transition: transform var(--duration-moderate) var(--ease-in-out);
		overflow-y: auto;
		box-shadow:
			var(--shadow-2xl),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--header-inset-opacity) * 100%), transparent);
		will-change: transform;
	}

	/* Solid fallback for browsers without backdrop-filter support. */
	@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
		.mobile-nav-container {
			background: var(--color-background);
		}
	}

	.mobile-nav-container.active {
		transform: translateY(0);
	}

	.mobile-nav {
		padding: var(--space-2);
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.mobile-nav-header {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: var(--space-3);
		align-items: center;
		margin: var(--space-2);
		padding: var(--space-3) var(--space-4);
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-white) calc(var(--opacity-80) * 100%), transparent),
			color-mix(in srgb, var(--color-white) calc(var(--opacity-60) * 100%), transparent)
		);
		backdrop-filter: blur(var(--header-blur)) saturate(180%);
		-webkit-backdrop-filter: blur(var(--header-blur)) saturate(180%);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--header-border-opacity) * 100%), transparent);
		border-radius: var(--border-radius-xl);
		box-shadow:
			var(--shadow-md),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--header-inset-opacity) * 100%), transparent);
		position: sticky;
		top: var(--space-2);
		z-index: var(--z-above);
	}

	.mobile-close-line {
		width: calc(var(--space-6) - var(--space-1));
		height: var(--border-width-medium);
		background-color: var(--color-text);
		position: absolute;
		transition:
			transform var(--duration-normal) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
	}

	.mobile-close-button:hover .mobile-close-line {
		background-color: var(--color-primary);
	}

	.mobile-close-line:first-child {
		transform: rotate(45deg);
	}

	.mobile-close-line:last-child {
		transform: rotate(-45deg);
	}

	.mobile-close-button:focus-visible {
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: var(--space-1);
		border-radius: var(--border-radius-sm);
	}

	:global(.mobile-nav-header .theme-toggle) {
		justify-self: start;
	}

	:global(.mobile-site-title) {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--color-text);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
		justify-self: center;
		text-align: center;
	}

	:global(.mobile-site-title:hover) {
		color: var(--color-primary);
	}

	.mobile-close-button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: calc(var(--space-6) + var(--space-1));
		height: calc(var(--space-6) + var(--space-1));
		position: relative;
		justify-self: end;
	}

	:global(.mobile-nav-list) {
		list-style: none;
		padding: var(--space-3) 0 0 0;
		margin: 0;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	:global(.mobile-nav-item) {
		opacity: 0;
		transform: translateX(calc(-1 * var(--transform-distance-lg)));
		transition:
			transform var(--duration-moderate) var(--ease-out),
			opacity var(--duration-moderate) var(--ease-out);
		will-change: opacity, transform;
	}

	.mobile-nav-container.active :global(.mobile-nav-item) {
		opacity: 1;
		transform: translateX(0);
	}

	/* Staggered animation for mobile nav items - using modern stagger tokens */
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(1)) {
		transition-delay: var(--stagger-1);
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(2)) {
		transition-delay: var(--stagger-2);
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(3)) {
		transition-delay: var(--stagger-3);
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(4)) {
		transition-delay: var(--stagger-4);
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(5)) {
		transition-delay: var(--stagger-5);
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(6)) {
		transition-delay: var(--stagger-6);
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(n + 7)) {
		transition-delay: calc(var(--stagger-6) + var(--stagger-1));
	}

	:global(.mobile-nav-item:last-child) {
		margin-top: auto;
		padding-top: var(--space-2);
	}

	:global(.mobile-nav-link) {
		display: block;
		padding: var(--space-3) var(--space-5);
		color: var(--color-text);
		text-decoration: none;
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		border-radius: var(--border-radius-lg);
		background: color-mix(in srgb, var(--color-white) calc(var(--opacity-5) * 100%), transparent);
		backdrop-filter: blur(var(--glass-blur-sm));
		-webkit-backdrop-filter: blur(var(--glass-blur-sm));
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-10) * 100%), transparent);
		margin: var(--space-1) var(--space-4);
		transition:
			transform var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
		position: relative;
		overflow: hidden;
		will-change: transform, background-color, border-color;
	}

	:global(.mobile-nav-link::before) {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent,
			color-mix(in srgb, var(--color-white) calc(var(--opacity-30) * 100%), transparent),
			transparent
		);
		transition: left var(--duration-slow) var(--ease-out);
	}

	:global(.mobile-nav-link:hover),
	:global(.mobile-nav-link:focus) {
		color: var(--color-primary);
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-10) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-30) * 100%),
			transparent
		);
		transform: translateX(var(--space-1));
		box-shadow:
			var(--shadow-lg),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-40) * 100%), transparent);
	}

	:global(.mobile-nav-link:hover::before) {
		left: 100%;
	}

	:global(.mobile-dropdown) {
		list-style: none;
		padding: var(--space-2);
		margin: var(--space-2) var(--space-5);
		background: color-mix(in srgb, var(--color-white) calc(var(--opacity-15) * 100%), transparent);
		backdrop-filter: blur(var(--glass-blur-md));
		-webkit-backdrop-filter: blur(var(--glass-blur-md));
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-20) * 100%), transparent);
		border-radius: var(--border-radius-lg);
		box-shadow:
			var(--shadow-md),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-30) * 100%), transparent);
	}

	:global(.mobile-dropdown-link) {
		display: block;
		padding: var(--space-2) var(--space-3);
		color: var(--color-text-light);
		text-decoration: none;
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		transition:
			transform var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
		border-radius: var(--border-radius-md);
		margin-bottom: var(--space-1);
		position: relative;
		background: color-mix(in srgb, var(--color-white) calc(var(--opacity-5) * 100%), transparent);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-5) * 100%), transparent);
		will-change: transform, background-color, border-color;
	}

	:global(.mobile-dropdown-link:hover),
	:global(.mobile-dropdown-link:focus) {
		color: var(--color-primary);
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-10) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-30) * 100%),
			transparent
		);
		box-shadow:
			var(--shadow-md),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-30) * 100%), transparent);
	}

	/* Hide mobile nav on desktop */
	@media (--xl) {
		.mobile-nav-container {
			display: none;
		}
	}

	/* Dark mode */
	:global(html.dark) .mobile-nav-container {
		background: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--header-overlay-opacity) * 100%),
			transparent
		);
		box-shadow:
			var(--shadow-2xl),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--header-inset-opacity) * 100%), transparent);
	}

	:global(html.dark) .mobile-nav-header {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-dark-surface) calc(var(--opacity-80) * 100%), transparent),
			color-mix(in srgb, var(--color-dark-surface) calc(var(--opacity-60) * 100%), transparent)
		);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--header-border-opacity) * 100%), transparent);
		box-shadow:
			var(--shadow-lg),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--header-inset-opacity) * 100%), transparent);
	}

	:global(html.dark .mobile-nav-link) {
		background: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--opacity-10) * 100%),
			transparent
		);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-5) * 100%), transparent);
	}

	:global(html.dark .mobile-nav-link::before) {
		background: linear-gradient(
			90deg,
			transparent,
			color-mix(in srgb, var(--color-white) calc(var(--opacity-10) * 100%), transparent),
			transparent
		);
	}

	:global(html.dark .mobile-dropdown) {
		background: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--opacity-15) * 100%),
			transparent
		);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-10) * 100%), transparent);
		box-shadow:
			var(--shadow-xl),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-10) * 100%), transparent);
	}

	:global(html.dark .mobile-dropdown-link) {
		background: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--opacity-5) * 100%),
			transparent
		);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-5) * 100%), transparent);
	}

	/* Touch device optimizations */
	@media (hover: none) {
		:global(.mobile-dropdown-link:hover) {
			color: var(--color-text-light);
			transform: none;
		}

		:global(.mobile-dropdown-link:active) {
			color: var(--color-primary);
			transform: translateX(var(--space-2));
		}
	}

	/* ===== MODERN ANIMATION SYSTEM ===== */
	/* Slide-in animation using transform for GPU acceleration */
	@keyframes mobileNavSlideIn {
		from {
			transform: translateY(-100%);
		}
		to {
			transform: translateY(0);
		}
	}

	/* Item reveal animation with optimized transforms */
	@keyframes mobileNavItemReveal {
		from {
			opacity: 0;
			transform: translateX(calc(-1 * var(--transform-distance-md)));
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	/* Use animation for active state - smoother than transition */
	.mobile-nav-container.active {
		animation: mobileNavSlideIn var(--duration-moderate) var(--ease-out) forwards;
	}

	.mobile-nav-container.active :global(.mobile-nav-item) {
		animation: mobileNavItemReveal var(--duration-normal) var(--ease-out) forwards;
	}

	/* ===== REDUCED MOTION SUPPORT =====
	 * Fully disable transitions/keyframes for users who ask for it. The
	 * !important flags are intentional: they override the staggered transition
	 * delays declared higher in this file and the keyframe animations
	 * declared below. */
	@media (prefers-reduced-motion: reduce) {
		.mobile-nav-container {
			transition: none;
			transform: translateY(-100%);
		}

		.mobile-nav-container.active {
			animation: none !important;
			transform: translateY(0);
		}

		:global(.mobile-nav-item),
		.mobile-nav-container.active :global(.mobile-nav-item) {
			animation: none !important;
			opacity: 1 !important;
			transform: none !important;
			transition: none !important;
			transition-delay: 0ms !important;
			will-change: auto;
		}

		:global(.mobile-nav-link),
		:global(.mobile-dropdown-link) {
			transition:
				background-color var(--duration-instant) linear,
				color var(--duration-instant) linear;
			will-change: auto;
		}

		:global(.mobile-nav-link::before) {
			display: none;
		}

		.mobile-close-line {
			transition: none;
		}
	}

	/* ===== PERFORMANCE OPTIMIZATION ===== */
	/* Remove will-change when menu is closed */
	.mobile-nav-container:not(.active) {
		will-change: auto;
	}

	.mobile-nav-container:not(.active) :global(.mobile-nav-item) {
		will-change: auto;
	}
</style>
