<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import { navItems } from '$lib/data/navigation';
	// Import Components
	import DesktopNav from '$lib/components/menu/DesktopNav.svelte';
	import MobileMenu from '$lib/components/menu/MobileMenu.svelte';
	import HamburgerButton from '$lib/components/menu/HamburgerButton.svelte';
	import ThemeToggle from '$lib/components/menu/ThemeToggle.svelte';

	// State management
	let mobileMenuOpen = $state(false);
	let activeDropdown = $state<number | null>(null);
	let dropdownTimer = $state<ReturnType<typeof setTimeout> | null>(null);
	let bodyOverflowHidden = $state(false);

	// Scroll-direction-aware header: hides on scroll down past a threshold,
	// reveals on scroll up. Disabled while a dropdown or mobile menu is open
	// so the header can't vanish mid-interaction.
	let headerHidden = $state(false);
	// Solid-ish state once the user has scrolled past the very top, so the
	// header is reliably readable over body copy and images.
	let headerScrolled = $state(false);
	let headerEl: HTMLElement | null = $state(null);

	// Current pathname, used for highlighting the active nav link.
	const currentPath = $derived($page.url.pathname);

	const HIDE_DELAY = 200;
	const SCROLL_HIDE_THRESHOLD = 120; // px before we start hiding
	const SCROLL_DELTA = 10; // min delta to consider a direction change
	const SCROLLED_STATE_THRESHOLD = 8; // px to switch to solid-ish background

	// Dropdown handlers
	function showDropdown(index: number) {
		if (dropdownTimer) {
			clearTimeout(dropdownTimer);
			dropdownTimer = null;
		}
		activeDropdown = index;
	}

	function startHideTimer() {
		if (dropdownTimer) {
			clearTimeout(dropdownTimer);
		}
		dropdownTimer = setTimeout(() => {
			activeDropdown = null;
			dropdownTimer = null;
		}, HIDE_DELAY);
	}

	function handleDropdownItemClick() {
		activeDropdown = null;
	}

	// Mobile menu handlers
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;

		// Toggle body scroll blocking
		if (mobileMenuOpen) {
			document.body.style.overflow = 'hidden';
			bodyOverflowHidden = true;
		} else {
			document.body.style.overflow = '';
			bodyOverflowHidden = false;
		}
	}

	function closeMobileMenu() {
		if (mobileMenuOpen) {
			mobileMenuOpen = false;
			document.body.style.overflow = '';
			bodyOverflowHidden = false;
		}
	}

	// Keyboard navigation
	function handleKeyDown(event: KeyboardEvent, index: number) {
		if (event.key === 'Escape' && activeDropdown !== null) {
			activeDropdown = null;
		} else if (event.key === 'Enter' || event.key === ' ') {
			if (activeDropdown === index) {
				activeDropdown = null;
			} else {
				activeDropdown = index;
			}
		}
	}

	// Click outside handler
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;

		// Close mobile menu if clicked outside
		if (
			mobileMenuOpen &&
			target &&
			!target.closest('.mobile-nav-container') &&
			!target.closest('.hamburger')
		) {
			closeMobileMenu();
		}

		// Close dropdown if clicked outside
		if (activeDropdown !== null && target && !target.closest('.dropdown-container')) {
			activeDropdown = null;
		}
	}

	// Window resize handler
	function handleResize() {
		const mobileBreakpoint = 1280; // Match 80rem desktop breakpoint
		if (window.innerWidth >= mobileBreakpoint && mobileMenuOpen) {
			closeMobileMenu();
		}
	}

	// Scroll-direction tracking via rAF-throttled scroll listener.
	let lastScrollY = 0;
	let scrollTicking = false;

	function handleScroll() {
		if (scrollTicking) return;
		scrollTicking = true;

		requestAnimationFrame(() => {
			const currentY = window.scrollY;
			const delta = currentY - lastScrollY;

			headerScrolled = currentY > SCROLLED_STATE_THRESHOLD;

			// Never hide while menus/dropdowns are open, near the top, or
			// while keyboard focus lives inside the header.
			const focusInsideHeader =
				headerEl !== null &&
				document.activeElement !== null &&
				headerEl.contains(document.activeElement);

			if (
				mobileMenuOpen ||
				activeDropdown !== null ||
				focusInsideHeader ||
				currentY < SCROLL_HIDE_THRESHOLD
			) {
				headerHidden = false;
			} else if (Math.abs(delta) > SCROLL_DELTA) {
				headerHidden = delta > 0; // hide on scroll down, show on scroll up
			}

			lastScrollY = currentY;
			scrollTicking = false;
		});
	}

	// Lifecycle
	$effect(() => {
		window.addEventListener('resize', handleResize);
		window.addEventListener('scroll', handleScroll, { passive: true });
		lastScrollY = window.scrollY;
		// Seed the scrolled state so pages opened at a non-zero scroll
		// position (refresh with scroll restoration, deep-link hash, etc.)
		// render with the correct header styling before any scroll event.
		headerScrolled = window.scrollY > SCROLLED_STATE_THRESHOLD;

		return () => {
			if (dropdownTimer) {
				clearTimeout(dropdownTimer);
			}

			if (bodyOverflowHidden) {
				document.body.style.overflow = '';
			}

			window.removeEventListener('resize', handleResize);
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<svelte:window onclick={handleClickOutside} />

<header
	class="site-header"
	class:header-hidden={headerHidden}
	class:header-scrolled={headerScrolled}
	bind:this={headerEl}
>
	<div class="container">
		<div class="header-inner">
			<div class="header-logo">
				<a href={resolve('/')} class="site-title"> Frédérick Madore </a>
			</div>

			<!-- Desktop Navigation & Theme Toggle -->
			<div class="desktop-controls">
				<DesktopNav
					{navItems}
					{activeDropdown}
					{currentPath}
					onMouseEnter={showDropdown}
					onMouseLeave={startHideTimer}
					onFocusIn={showDropdown}
					onFocusOut={startHideTimer}
					onKeyDown={handleKeyDown}
					onDropdownItemClick={handleDropdownItemClick}
				/>

				<ThemeToggle />
			</div>

			<!-- Mobile Menu Toggle -->
			<HamburgerButton isActive={mobileMenuOpen} onClick={toggleMobileMenu} />

			<!-- Mobile Navigation -->
			<MobileMenu {navItems} isActive={mobileMenuOpen} onCloseMenu={closeMobileMenu} />
		</div>
	</div>
</header>

<style>
	/* Site header — sticky paper-glass.
	 * Single warm-surface background with chrome blur (legitimate glass use
	 * for sticky nav over scrolling content). Previously used a 3-stop
	 * primary→highlight gradient with ~2-3% tint that was visually
	 * imperceptible but added ornamental code. */
	:global(.site-header) {
		background: color-mix(
			in srgb,
			var(--color-surface-elevated) calc(var(--header-bg-opacity) * 100%),
			transparent
		);
		backdrop-filter: blur(var(--header-blur, var(--header-blur-fallback))) saturate(180%);
		-webkit-backdrop-filter: blur(var(--header-blur, var(--header-blur-fallback))) saturate(180%);
		border-bottom: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-text) calc(var(--header-border-opacity) * 12%), transparent);
		box-shadow: var(--shadow-sm);
		position: sticky;
		top: 0;
		z-index: var(--z-sticky);
		transform: translateY(0);
		transition:
			transform var(--duration-normal) var(--ease-out),
			background var(--duration-normal) var(--ease-out),
			border-color var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out);
		will-change: transform;
	}

	/* Scrolled state: raise opacity + shadow so the header stays legible
	 * over page content and asserts a clearer separation. */
	:global(.site-header.header-scrolled) {
		background: color-mix(
			in srgb,
			var(--color-surface-elevated) calc(var(--header-bg-opacity-scrolled) * 100%),
			transparent
		);
		border-bottom-color: color-mix(
			in srgb,
			var(--color-text) calc(var(--header-border-opacity-scrolled) * 18%),
			transparent
		);
		box-shadow: var(--shadow-md);
	}

	/* Scroll-direction hide: transform rather than top/display so the
	 * sticky behaviour and layout are unaffected when revealed again. */
	:global(.site-header.header-hidden) {
		transform: translateY(-100%);
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.site-header),
		:global(.site-header.header-hidden) {
			transform: none;
			transition: none;
		}
	}

	/* Dark mode — warm dusk surface, slightly translucent over body. */
	:global(html.dark .site-header) {
		background: color-mix(
			in srgb,
			var(--color-surface-alt) calc(var(--header-bg-opacity) * 100%),
			transparent
		);
		border-bottom: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-text) calc(var(--header-border-opacity) * 18%), transparent);
		box-shadow: var(--shadow-sm);
	}

	:global(html.dark .site-header.header-scrolled) {
		background: color-mix(
			in srgb,
			var(--color-surface-alt) calc(var(--header-bg-opacity-scrolled) * 100%),
			transparent
		);
		border-bottom-color: color-mix(
			in srgb,
			var(--color-text) calc(var(--header-border-opacity-scrolled) * 25%),
			transparent
		);
		box-shadow: var(--shadow-md);
	}

	/* Solid fallback for browsers without backdrop-filter. */
	@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
		:global(.site-header) {
			background: var(--color-background);
		}

		:global(html.dark .site-header) {
			background: var(--color-background);
		}
	}

	.container {
		max-width: var(--container-xl);
		width: 100%;
		margin-left: auto;
		margin-right: auto;
		padding: 0 var(--space-4);
	}

	.header-inner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-3) 0;
		position: relative;
		min-height: var(--space-14);
	}

	.header-logo {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		min-width: 0;
	}

	.header-logo :global(.site-title) {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-text);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
		white-space: nowrap;
	}

	.header-logo :global(.site-title:hover) {
		color: var(--color-primary);
	}

	.header-logo :global(.site-title:focus-visible) {
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: var(--space-1);
		border-radius: var(--border-radius-sm);
	}

	.desktop-controls {
		display: none;
		align-items: center;
		gap: var(--space-6);
	}

	@media (--sm) {
		.container {
			padding: 0 var(--space-6);
		}

		.header-inner {
			padding: var(--space-4) 0;
			min-height: var(--space-16);
		}
	}

	@media (--xl) {
		.header-inner {
			min-height: calc(var(--space-16) + var(--space-2));
		}

		.desktop-controls {
			display: flex;
		}
	}

	/* Theme toggle sits to the right of the nav; keep rhythm consistent
	 * with the --space-6 gap already present on .desktop-controls. */
	.desktop-controls :global(.theme-toggle) {
		margin-left: 0;
	}
</style>
