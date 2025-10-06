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
					name: 'Mining the Islam West Africa Collection',
					path: `${base}/research/mining-the-islam-west-africa-collection`
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
		const mobileBreakpoint = 768;
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
			rgba(255, 255, 255, 0.8) 0%,
			rgba(var(--color-primary-rgb), 0.02) 50%,
			rgba(var(--color-highlight-rgb), 0.01) 100%
		);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.3);
		box-shadow:
			0 4px 24px 0 rgba(31, 38, 135, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
		position: sticky;
		top: 0;
		z-index: 100;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	:global(.site-header:hover) {
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.9) 0%,
			rgba(var(--color-primary-rgb), 0.03) 50%,
			rgba(var(--color-highlight-rgb), 0.02) 100%
		);
		border-bottom-color: rgba(255, 255, 255, 0.4);
		box-shadow:
			0 6px 32px 0 rgba(31, 38, 135, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.5);
	}

	/* Dark mode */
	:global(html.dark .site-header) {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb), 0.8) 0%,
			rgba(var(--color-primary-rgb), 0.04) 50%,
			rgba(var(--color-highlight-rgb), 0.02) 100%
		);
		border-bottom: 1px solid rgba(255, 255, 255, 0.15);
		box-shadow:
			0 4px 24px 0 rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	:global(html.dark .site-header:hover) {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb), 0.85) 0%,
			rgba(var(--color-primary-rgb), 0.06) 50%,
			rgba(var(--color-highlight-rgb), 0.03) 100%
		);
		border-bottom-color: rgba(255, 255, 255, 0.2);
		box-shadow:
			0 6px 32px 0 rgba(0, 0, 0, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}

	.container {
		max-width: 1280px;
		width: 100%;
		margin-left: auto;
		margin-right: auto;
		padding: 0 var(--spacing-4);
	}

	.header-inner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-4) 0;
		position: relative;
		height: 64px;
	}

	.header-logo {
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	.header-logo :global(.site-title) {
		font-size: var(--font-size-xl);
		font-weight: 700;
		color: var(--color-text);
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.header-logo :global(.site-title:hover) {
		color: var(--color-primary);
	}

	.desktop-controls {
		display: none;
		align-items: center;
		gap: var(--spacing-6);
	}

	@media (min-width: 640px) {
		.container {
			padding: 0 var(--spacing-6);
		}
	}

	@media (min-width: 1024px) {
		.header-inner {
			height: 72px;
		}

		.desktop-controls {
			display: flex;
		}
	}

	/* Theme toggle spacing */
	.desktop-controls :global(.theme-toggle) {
		margin-left: var(--spacing-4);
	}
</style>
