<script lang="ts">
	import { base } from '$app/paths';
	
	// Navigation items based on the WordPress site
	const navItems = [
		{ 
			name: 'Research', 
			path: `${base}/research`,
			dropdown: [
				{ name: 'Mining the Islam West Africa Collection (2025)', path: `${base}/research/mining-the-islam-west-africa-collection` },
				{ name: 'Religious Activism on Campuses in Togo and Benin (2021-24)', path: `${base}/research/religious-activism-campuses-togo-benin` },
				{ name: 'Muslim Minorities in Southern Cities of Benin and Togo (2018-20)', path: `${base}/research/muslim-minorities-southern-cities-benin-togo` },
				{ name: 'Youth and Women\'s Islamic Activism in Côte d\'Ivoire and Burkina Faso​ (2013-18)', path: `${base}/research/youth-womens-islamic-activism-cote-divoire-burkina-faso` }
			] 
		},
		{ name: 'Publications', path: `${base}/publications` },
		{ name: 'Activities', path: `${base}/activities` },
		{ 
			name: 'Digital Humanities', 
			path: `${base}/digital-humanities`,
			dropdown: [
				{ name: 'Islam West Africa Collection', path: `${base}/digital-humanities/islam-west-africa-collection` },
				{ name: 'Visualising the IWAC', path: `${base}/digital-humanities/visualising-the-iwac` }
			] 
		},
		{ name: 'Conference Activity', path: `${base}/conference-activity` },
		{ name: 'Teaching', path: `${base}/teaching` },
		{ name: 'Contact', path: `${base}/contact` }
	];

	// State for mobile menu toggle
	let mobileMenuOpen = false;
	
	// Track active dropdown for hover delay
	let activeDropdown: number | null = null;
	let dropdownTimer: ReturnType<typeof setTimeout> | null = null;
	
	// Show dropdown with index
	function showDropdown(index: number) {
		if (dropdownTimer) {
			clearTimeout(dropdownTimer);
			dropdownTimer = null;
		}
		activeDropdown = index;
	}
	
	// Hide dropdown with delay
	function hideDropdown() {
		if (dropdownTimer) {
			clearTimeout(dropdownTimer);
		}
		dropdownTimer = setTimeout(() => {
			activeDropdown = null;
		}, 300); // 300ms delay before hiding
	}
	
	// Toggle mobile menu
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
	
	// Close mobile menu
	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
	
	// Close mobile menu when clicked outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (mobileMenuOpen && target && 
			!target.closest('.mobile-nav-container') && 
			!target.closest('.hamburger')) {
			mobileMenuOpen = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<header class="site-header">
	<div class="container">
		<div class="header-inner">
			<div class="header-logo">
				<a href="{base}/" class="site-title">
					Frédérick Madore
				</a>
			</div>
			
			<!-- Mobile menu toggle -->
			<button class="hamburger" on:click={toggleMobileMenu} aria-label="Toggle navigation menu">
				<span class="hamburger-line"></span>
				<span class="hamburger-line"></span>
				<span class="hamburger-line"></span>
			</button>
			
			<!-- Desktop Navigation -->
			<nav class="desktop-nav">
				<ul class="nav-list">
					{#each navItems as item, i}
						<li 
							class="nav-item dropdown-container"
							on:mouseenter={() => item.dropdown && showDropdown(i)}
							on:mouseleave={hideDropdown}
						>
							<a href={item.path} class="nav-link dropdown-trigger">
								{item.name} {#if item.dropdown}<span class="dropdown-icon">▾</span>{/if}
							</a>
							
							{#if item.dropdown}
								<div class="dropdown-menu" class:active={activeDropdown === i}>
									<ul>
										{#each item.dropdown as subItem}
											<li>
												<a href={subItem.path} class="dropdown-item">
													{subItem.name}
												</a>
											</li>
										{/each}
									</ul>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			</nav>
			
			<!-- Mobile Navigation -->
			<div class="mobile-nav-container" class:active={mobileMenuOpen}>
				<nav class="mobile-nav">
					<ul class="mobile-nav-list">
						{#each navItems as item}
							<li class="mobile-nav-item">
								<a href={item.path} class="mobile-nav-link" on:click={closeMobileMenu}>
									{item.name}
								</a>
								
								{#if item.dropdown}
									<ul class="mobile-dropdown">
										{#each item.dropdown as subItem}
											<li class="mobile-dropdown-item">
												<a href={subItem.path} class="mobile-dropdown-link" on:click={closeMobileMenu}>
													{subItem.name}
												</a>
											</li>
										{/each}
									</ul>
								{/if}
							</li>
						{/each}
					</ul>
				</nav>
			</div>
		</div>
	</div>
</header>

<style>
	.site-header {
		background-color: white;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
		position: sticky;
		top: 0;
		z-index: 1000;
		transition: all 0.3s ease;
	}
	
	.site-header:hover {
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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
	}
	
	.header-logo {
		flex-shrink: 0;
	}
	
	.site-title {
		font-size: var(--font-size-xl);
		font-weight: 700;
		color: var(--color-text);
		text-decoration: none;
		transition: color 0.2s ease;
		letter-spacing: -0.02em;
	}
	
	.site-title:hover {
		color: var(--color-primary);
	}
	
	/* Desktop Navigation */
	.desktop-nav {
		display: none;
	}
	
	.nav-list {
		display: flex;
		list-style: none;
		padding: 0;
		margin: 0;
		gap: var(--spacing-6);
	}
	
	.nav-item {
		position: relative;
	}
	
	.nav-link {
		color: var(--color-text);
		text-decoration: none;
		font-weight: 500;
		padding: var(--spacing-2) 0;
		transition: all 0.2s ease;
		position: relative;
	}
	
	.nav-link::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 0;
		height: 2px;
		background-color: var(--color-primary);
		transition: width 0.3s ease;
	}
	
	.nav-link:hover {
		color: var(--color-primary);
	}
	
	.nav-link:hover::after {
		width: 100%;
	}
	
	.dropdown-icon {
		display: inline-block;
		margin-left: 4px;
		font-size: 10px;
		transition: transform 0.3s ease;
	}
	
	.dropdown-container:hover .dropdown-icon {
		transform: rotate(180deg);
	}
	
	.dropdown-container:has(.dropdown-menu.active) .dropdown-icon {
		transform: rotate(180deg);
	}
	
	.dropdown-container {
		position: relative;
	}
	
	.dropdown-container::after {
		content: '';
		position: absolute;
		height: 20px; /* Buffer height */
		width: 100%;
		bottom: -20px;
		left: 0;
		z-index: 5;
	}
	
	.dropdown-menu {
		position: absolute;
		top: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%);
		z-index: 10;
		min-width: 240px;
		background-color: white;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		border-radius: var(--border-radius-md);
		padding: var(--spacing-2);
		opacity: 0;
		visibility: hidden;
		transition: all 0.3s ease;
		transform-origin: top center;
		transform: translateX(-50%) translateY(10px);
		margin-top: -8px;
		padding-top: 16px;
	}
	
	.dropdown-menu.active {
		opacity: 1;
		visibility: visible;
		transform: translateX(-50%) translateY(0);
	}
	
	.dropdown-menu::before {
		content: '';
		position: absolute;
		top: 10px; /* Adjusted for new padding-top */
		left: 50%;
		transform: translateX(-50%);
		width: 12px;
		height: 12px;
		background-color: white;
		transform: translateX(-50%) rotate(45deg);
		z-index: -1;
	}
	
	.dropdown-menu ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	
	.dropdown-item {
		display: block;
		padding: var(--spacing-3) var(--spacing-4);
		color: var(--color-text);
		text-decoration: none;
		font-size: var(--font-size-sm);
		border-radius: var(--border-radius-sm);
		transition: all 0.2s ease;
	}
	
	.dropdown-item:hover {
		background-color: var(--color-gray-100);
		color: var(--color-primary);
		transform: translateX(4px);
	}
	
	/* Hamburger Menu */
	.hamburger {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: 24px;
		height: 18px;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
		z-index: 210;
	}
	
	.hamburger-line {
		width: 100%;
		height: 2px;
		background-color: var(--color-text);
		transition: all 0.3s ease;
	}
	
	/* Mobile Menu */
	.mobile-nav-container {
		position: fixed;
		top: 0;
		right: 0;
		height: 100vh;
		width: 100%;
		max-width: 300px;
		background-color: white;
		z-index: 200;
		box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
		transform: translateX(100%);
		transition: transform 0.3s ease-in-out;
		overflow-y: auto;
	}
	
	.mobile-nav-container.active {
		transform: translateX(0);
	}
	
	.mobile-nav {
		padding: var(--spacing-12) var(--spacing-4) var(--spacing-4);
	}
	
	.mobile-nav-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	
	.mobile-nav-item {
		margin-bottom: var(--spacing-4);
	}
	
	.mobile-nav-link {
		display: block;
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text);
		text-decoration: none;
		padding: var(--spacing-2) 0;
		transition: color 0.2s ease;
	}
	
	.mobile-nav-link:hover {
		color: var(--color-primary);
	}
	
	.mobile-dropdown {
		list-style: none;
		padding-left: var(--spacing-4);
		margin-top: var(--spacing-2);
	}
	
	.mobile-dropdown-item {
		margin-bottom: var(--spacing-2);
	}
	
	.mobile-dropdown-link {
		display: block;
		font-size: var(--font-size-base);
		color: var(--color-text);
		text-decoration: none;
		padding: var(--spacing-1) 0;
		transition: color 0.2s ease;
	}
	
	.mobile-dropdown-link:hover {
		color: var(--color-primary);
	}
	
	/* Responsive Design */
	@media (min-width: 768px) {
		.hamburger {
			display: none;
		}
		
		.desktop-nav {
			display: block;
		}
	}
</style> 