<script lang="ts">
    import { base } from '$app/paths';
    import { onMount } from 'svelte';
    import type { NavItem } from '$lib/types/navigation';
      // Import Components
    import DesktopNav from '$lib/components/menu/DesktopNav.svelte';
    import MobileMenu from '$lib/components/menu/MobileMenu.svelte';
    import HamburgerButton from '$lib/components/menu/HamburgerButton.svelte';
    import ThemeToggle from '$lib/components/atoms/ThemeToggle.svelte';
    
    // Navigation items
    const navItems: NavItem[] = [
        { 
            name: 'Research', 
            path: `${base}/research`,
            dropdown: [
                { name: 'Mining the Islam West Africa Collection', path: `${base}/research/mining-the-islam-west-africa-collection` },
                { name: 'Religious Activism on Campuses in Togo and Benin', path: `${base}/research/religious-activism-campuses-togo-benin` },
                { name: 'Muslim Minorities in Southern Cities of Benin and Togo', path: `${base}/research/muslim-minorities-southern-cities-benin-togo` },
                { name: 'Youth and Women\'s Islamic Activism in Côte d\'Ivoire and Burkina Faso', path: `${base}/research/youth-womens-islamic-activism-cote-divoire-burkina-faso` }
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
                { name: 'Islam West Africa Collection', path: 'https://islam.zmo.de/s/westafrica/' },
            ] 
        },
        { name: 'Conference Activity', path: `${base}/conference-activity` },
        { name: 'Teaching', path: `${base}/teaching` },
        { name: 'CV', path: `${base}/cv` }
    ];

    // State management
    let mobileMenuOpen = false;
    let activeDropdown: number | null = null;
    let dropdownTimer: ReturnType<typeof setTimeout> | null = null;
    let bodyOverflowHidden = false;
    
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
    
    function clearHideTimer() {
        if (dropdownTimer) {
            clearTimeout(dropdownTimer);
            dropdownTimer = null;
        }
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
        if (mobileMenuOpen && target && 
            !target.closest('.mobile-nav-container') && 
            !target.closest('.hamburger')) {
            closeMobileMenu();
        }
        
        // Close dropdown if clicked outside
        if (activeDropdown !== null && target &&
            !target.closest('.dropdown-container')) {
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
    onMount(() => {
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

<svelte:window on:click={handleClickOutside} />

<header class="site-header">
    <div class="container">
        <div class="header-inner">
            <div class="header-logo">
                <a href="{base}/" class="site-title">
                    Frédérick Madore
                </a>
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
            <HamburgerButton 
                isActive={mobileMenuOpen} 
                onClick={toggleMobileMenu}
            />
            
            <!-- Mobile Navigation -->
            <MobileMenu 
                {navItems}
                isActive={mobileMenuOpen}
                onCloseMenu={closeMobileMenu}
            />
        </div>
    </div>
</header>

<style>
    /* Header-specific styles - main navigation styles are in unified CSS */
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
    
    @media (min-width: 640px) {
        .container {
            padding: 0 var(--spacing-6);
        }
    }
    
    @media (min-width: 1024px) {
        .header-inner {
            height: 72px;
        }
    }
</style>