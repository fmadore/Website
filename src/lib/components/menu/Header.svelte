<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
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
	const currentPath = $derived(page.url.pathname);

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
	/* Site header — the masthead. A solid page-ground bar closed by a heavy
	 * ink rule (cream on midnight). No glass, no blur, no shadow: the rule
	 * does the separating. */
	:global(.site-header) {
		background: var(--color-background);
		border-bottom: var(--rule-masthead) solid var(--color-primary);
		box-shadow: none;
		position: sticky;
		top: 0;
		z-index: var(--z-sticky);
		transform: translateY(0);
		transition: transform var(--duration-normal) var(--ease-out);
		will-change: transform;
	}

	/* Scrolled state — the masthead stays solid; no opacity or shadow change. */
	:global(.site-header.header-scrolled) {
		background: var(--color-background);
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

	/* Midnight — the negative: film ground closed by a cream masthead rule. */
	:global(html.dark .site-header) {
		background: var(--color-background);
		border-bottom: var(--rule-masthead) solid var(--color-primary);
		box-shadow: none;
	}

	:global(html.dark .site-header.header-scrolled) {
		background: var(--color-background);
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

	/* Wordmark — the compact nameplate: Archivo, wide and heavy, uppercase.
	 * The persistent masthead name, echoing the home hero nameplate in
	 * miniature. Warms to pine on hover. */
	.header-logo :global(.site-title) {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-wordmark);
		font-size: clamp(1.15rem, 0.95rem + 0.9vw, 1.6rem);
		font-weight: 830;
		letter-spacing: -0.01em;
		text-transform: uppercase;
		line-height: 1;
		color: var(--color-text-emphasis);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
		white-space: nowrap;
	}

	.header-logo :global(.site-title:hover) {
		color: var(--color-accent);
	}

	.header-logo :global(.site-title:focus-visible) {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-1);
		border-radius: 0;
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
