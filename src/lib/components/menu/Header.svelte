<script lang="ts">
	import { base } from '$app/paths';
	import type { NavItem } from '$lib/types/navigation';
	// Import Components
	import DesktopNav from '$lib/components/menu/DesktopNav.svelte';
	import MobileMenu from '$lib/components/menu/MobileMenu.svelte';
	import HamburgerButton from '$lib/components/menu/HamburgerButton.svelte';
	import ThemeToggle from '$lib/components/menu/ThemeToggle.svelte';

	// Navigation items
	const navItems: NavItem[] = [
		{
			name: 'Research',
			path: `${base}/research`,
			dropdown: [
				{
					name: "Islam's 'Peripheries': DH & AI in West Africa and Central Asia",
					path: `${base}/research/islams-peripheries-dh-ai-west-africa-central-asia`
				},
				{
					name: 'Digital Humanities and AI in African Studies',
					path: `${base}/research/dh-ai-african-studies`
				},
				{
					name: 'Religious Activism on Campuses in Togo and Benin',
					path: `${base}/research/religious-activism-campuses-togo-benin`
				},
				{
					name: 'Muslim Minorities in Southern Cities of Benin and Togo',
					path: `${base}/research/muslim-minorities-southern-cities-benin-togo`
				},
				{
					name: "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso",
					path: `${base}/research/youth-womens-islamic-activism-cote-divoire-burkina-faso`
				}
			]
		},
		{
			name: 'Publications',
			path: `${base}/publications`,
			dropdown: [
				{ name: 'All Publications', path: `${base}/publications` },
				{ name: 'Visualisations', path: `${base}/publications/visualisations` }
			]
		},
		{ name: 'Activities', path: `${base}/activities` },
		{
			name: 'Digital Humanities',
			path: `${base}/digital-humanities`,
			dropdown: [
				{ name: 'Islam West Africa Collection', path: 'https://islam.zmo.de/s/westafrica/' }
			]
		},
		{ name: 'Conference Activity', path: `${base}/conference-activity` },
		{ name: 'Teaching', path: `${base}/teaching` },
		{ name: 'CV', path: `${base}/cv` }
	]; // State management
	let mobileMenuOpen = $state(false);
	let activeDropdown = $state<number | null>(null);
	let dropdownTimer = $state<ReturnType<typeof setTimeout> | null>(null);
	let bodyOverflowHidden = $state(false);

	const HIDE_DELAY = 200;

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

	// Lifecycle
	$effect(() => {
		window.addEventListener('resize', handleResize);

		return () => {
			if (dropdownTimer) {
				clearTimeout(dropdownTimer);
			}

			if (bodyOverflowHidden) {
				document.body.style.overflow = '';
			}

			window.removeEventListener('resize', handleResize);
		};
	});
</script>

<svelte:window onclick={handleClickOutside} />

<header class="site-header">
	<div class="container">
		<div class="header-inner">
			<div class="header-logo">
				<a href={`${base}/`} class="site-title"> Frédérick Madore </a>
			</div>

			<!-- Desktop Navigation & Theme Toggle -->
			<div class="desktop-controls">
				<DesktopNav
					{navItems}
					{activeDropdown}
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
	/* Site Header Styles */
	:global(.site-header) {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-white) calc(var(--opacity-80) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-primary) 2%, transparent) 50%,
			color-mix(in srgb, var(--color-highlight) 1%, transparent) 100%
		);
		backdrop-filter: blur(var(--glass-blur-amount, var(--glass-blur-fallback)));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount, var(--glass-blur-fallback)));
		border-bottom: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-30) * 100%), transparent);
		box-shadow:
			var(--shadow-lg),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-40) * 100%), transparent);
		position: sticky;
		top: 0;
		z-index: var(--z-sticky);
		transition:
			background var(--duration-normal) var(--ease-out),
			border-color var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out);
	}

	:global(.site-header:hover) {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-white) calc(var(--opacity-90) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-primary) 3%, transparent) 50%,
			color-mix(in srgb, var(--color-highlight) 2%, transparent) 100%
		);
		border-bottom-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-40) * 100%),
			transparent
		);
		box-shadow:
			var(--shadow-xl),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-50) * 100%), transparent);
	}

	/* Dark mode */
	:global(html.dark .site-header) {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-dark-surface) calc(var(--opacity-80) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-primary) 4%, transparent) 50%,
			color-mix(in srgb, var(--color-highlight) 2%, transparent) 100%
		);
		border-bottom: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-medium) * 100%), transparent);
		box-shadow:
			var(--shadow-lg),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-10) * 100%), transparent);
	}

	:global(html.dark .site-header:hover) {
		background: linear-gradient(
			135deg,
			color-mix(
					in srgb,
					var(--color-dark-surface) calc(var(--glass-opacity-high) * 100%),
					transparent
				)
				0%,
			color-mix(in srgb, var(--color-primary) 6%, transparent) 50%,
			color-mix(in srgb, var(--color-highlight) 3%, transparent) 100%
		);
		border-bottom-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-20) * 100%),
			transparent
		);
		box-shadow:
			var(--shadow-xl),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-medium) * 100%), transparent);
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
		padding: var(--space-4) 0;
		position: relative;
		min-height: var(--space-16);
	}

	.header-logo {
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	.header-logo :global(.site-title) {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-text);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.header-logo :global(.site-title:hover) {
		color: var(--color-primary);
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
	}

	@media (--xl) {
		.header-inner {
			min-height: calc(var(--space-16) + var(--space-2));
		}

		.desktop-controls {
			display: flex;
		}
	}

	/* Theme toggle spacing */
	.desktop-controls :global(.theme-toggle) {
		margin-left: var(--space-4);
	}
</style>
