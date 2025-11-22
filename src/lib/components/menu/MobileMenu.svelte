<script lang="ts">
	import type { NavItem } from '$lib/types/navigation';
	import ThemeToggle from '$lib/components/menu/ThemeToggle.svelte';
	import { base } from '$app/paths';

	let {
		navItems,
		isActive = false,
		onCloseMenu
	}: {
		navItems: NavItem[];
		isActive?: boolean;
		onCloseMenu: () => void;
	} = $props();
</script>

<div id="mobile-menu" class="mobile-nav-container" class:active={isActive}>
	<nav class="mobile-nav" aria-label="Mobile navigation">
		<!-- Mobile Menu Header -->
		<div class="mobile-nav-header">
			<ThemeToggle size={20} />

			<a href="{base}/" class="mobile-site-title" onclick={onCloseMenu}> Frédérick Madore </a>

			<!-- Close button -->
			<button class="mobile-close-button" onclick={onCloseMenu} aria-label="Close navigation menu">
				<span class="mobile-close-line"></span>
				<span class="mobile-close-line"></span>
			</button>
		</div>

		<ul class="mobile-nav-list">
			{#each navItems as item (item.path)}
				<li class="mobile-nav-item">
					<a href={item.path} class="mobile-nav-link" onclick={onCloseMenu}>
						{item.name}
					</a>

					{#if item.dropdown}
						<ul class="mobile-dropdown">
							{#each item.dropdown as subItem (subItem.path)}
								<li class="mobile-dropdown-item">
									<a
										href={subItem.path}
										class="mobile-dropdown-link"
										onclick={onCloseMenu}
										target={subItem.path.startsWith('http') ? '_blank' : null}
										rel={subItem.path.startsWith('http') ? 'noopener noreferrer' : null}
									>
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

<style>
        .mobile-nav-container {
                position: fixed;
                top: 0;
                left: 0;
                height: 100vh;
                width: 100%;
                background: rgba(var(--color-white-rgb), var(--glass-opacity-fallback-light));
                backdrop-filter: blur(var(--glass-blur-amount, var(--glass-blur-fallback))) saturate(180%);
                -webkit-backdrop-filter: blur(var(--glass-blur-amount, var(--glass-blur-fallback))) saturate(180%);
                z-index: var(--z-modal);
                transform: translateY(-100%);
                transition: transform var(--anim-duration-base) var(--anim-ease-in-out);
                overflow-y: auto;
                box-shadow:
                        var(--shadow-2xl),
                        inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), var(--opacity-80));
                will-change: transform;
        }

	.mobile-nav-container.active {
		transform: translateY(0);
	}

        .mobile-nav {
                padding: var(--spacing-4);
                height: 100%;
                display: flex;
                flex-direction: column;
                gap: var(--spacing-4);
        }

        .mobile-nav-header {
                display: grid;
                grid-template-columns: 1fr auto 1fr;
                align-items: center;
                margin-bottom: 0;
                padding: var(--spacing-4) var(--spacing-2);
                border-bottom: var(--border-width-thin) solid rgba(var(--color-white-rgb), 0.2);
                background: rgba(var(--color-white-rgb), 0.98);
                backdrop-filter: blur(var(--glass-blur-amount, 32px)) saturate(180%);
                -webkit-backdrop-filter: blur(var(--glass-blur-amount, 32px)) saturate(180%);
                position: sticky;
                top: 0;
                z-index: 10;
                box-shadow: var(--shadow);
        }

        .mobile-close-line {
                width: calc(var(--spacing-6) - var(--spacing-1));
                height: var(--border-width-medium);
                background-color: var(--color-text);
                position: absolute;
                transition: all var(--anim-duration-base) var(--anim-ease-base);
        }

	.mobile-close-line:first-child {
		transform: rotate(45deg);
	}

        .mobile-close-line:last-child {
                transform: rotate(-45deg);
        }

        .mobile-close-button:focus-visible {
                outline: var(--border-width-medium) solid var(--color-primary);
                outline-offset: var(--spacing-1);
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
                transition: color var(--anim-duration-fast) var(--anim-ease-base);
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
                padding: var(--spacing-1);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                width: var(--spacing-6);
                height: var(--spacing-6);
                position: relative;
                justify-self: end;
        }

	:global(.mobile-nav-list) {
		list-style: none;
		padding: var(--spacing-6) 0 0 0;
		margin: 0;
		flex: 1;
		display: flex;
		flex-direction: column;
                gap: var(--spacing-2);
        }

        :global(.mobile-nav-item) {
                opacity: 0;
                transform: translateX(calc(-1 * var(--spacing-6)));
                transition:
                        transform var(--anim-duration-base) var(--anim-ease-out),
                        opacity var(--anim-duration-base) var(--anim-ease-out);
                will-change: opacity, transform;
        }

	.mobile-nav-container.active :global(.mobile-nav-item) {
		opacity: 1;
		transform: translateX(0);
	}

	/* Staggered animation for mobile nav items - faster and smoother */
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(1)) {
		transition-delay: var(--anim-delay-1);
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(2)) {
		transition-delay: var(--anim-delay-2);
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(3)) {
		transition-delay: var(--anim-delay-3);
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(4)) {
		transition-delay: var(--anim-delay-4);
	}
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(5)) {
		transition-delay: var(--anim-delay-5);
	}
        .mobile-nav-container.active :global(.mobile-nav-item:nth-child(6)) {
                transition-delay: var(--anim-delay-6);
        }
	.mobile-nav-container.active :global(.mobile-nav-item:nth-child(7)) {
		transition-delay: calc(var(--anim-delay-6) + 0.05s);
	}

	:global(.mobile-nav-item:last-child) {
		margin-top: auto;
		padding-top: var(--spacing-4);
	}

        :global(.mobile-nav-link) {
                display: block;
                padding: var(--spacing-4) var(--spacing-6);
                color: var(--color-text);
                text-decoration: none;
                font-size: var(--font-size-lg);
                font-weight: var(--font-weight-semibold);
                border-radius: var(--border-radius-lg);
                background: rgba(var(--color-white-rgb), 0.05);
                backdrop-filter: blur(var(--glass-blur-amount, 8px));
                -webkit-backdrop-filter: blur(var(--glass-blur-amount, 8px));
                border: var(--border-width-thin) solid rgba(var(--color-white-rgb), 0.1);
                margin: var(--spacing-2) var(--spacing-4);
                transition: all var(--anim-duration-fast) var(--anim-ease-in-out);
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
                        rgba(var(--color-white-rgb), 0.3),
                        transparent
                );
                transition: left var(--anim-duration-slow) var(--anim-ease-in-out);
        }

        :global(.mobile-nav-link:hover),
        :global(.mobile-nav-link:focus) {
                color: var(--color-primary);
                background: rgba(var(--color-primary-rgb), 0.1);
                border-color: rgba(var(--color-primary-rgb), 0.3);
                transform: translateX(var(--spacing-1));
                box-shadow:
                        var(--shadow-lg),
                        inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), 0.4);
        }

	:global(.mobile-nav-link:hover::before) {
		left: 100%;
	}

        :global(.mobile-dropdown) {
                list-style: none;
                padding: var(--spacing-3);
                margin: var(--spacing-3) var(--spacing-6);
                background: rgba(var(--color-white-rgb), 0.08);
                backdrop-filter: blur(var(--glass-blur-amount, 12px));
                -webkit-backdrop-filter: blur(var(--glass-blur-amount, 12px));
                border: var(--border-width-thin) solid rgba(var(--color-white-rgb), 0.15);
                border-radius: var(--border-radius-md);
                box-shadow:
                        var(--shadow-xl),
                        inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), 0.3);
        }

        :global(.mobile-dropdown-link) {
                display: block;
                padding: var(--spacing-3) var(--spacing-4);
                color: var(--color-text-light);
                text-decoration: none;
                font-size: var(--font-size-base);
                font-weight: var(--font-weight-medium);
                transition: all var(--anim-duration-fast) var(--anim-ease-in-out);
                border-radius: var(--border-radius-sm);
                margin-bottom: var(--spacing-1);
                position: relative;
                background: rgba(var(--color-white-rgb), 0.03);
                border: var(--border-width-thin) solid rgba(var(--color-white-rgb), 0.05);
                will-change: transform, background-color, border-color;
        }

	:global(.mobile-dropdown-link:hover),
        :global(.mobile-dropdown-link:focus) {
                color: var(--color-primary);
                background: rgba(var(--color-primary-rgb), 0.1);
                border-color: rgba(var(--color-primary-rgb), 0.3);
                box-shadow:
                        var(--shadow-md),
                        inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), 0.3);
        }

	/* Hide mobile nav on desktop */
        @media (--xl) {
                .mobile-nav-container {
                        display: none;
                }
        }

	/* Dark mode */
        :global(html.dark) .mobile-nav-container {
                background: rgba(var(--color-dark-surface-rgb), 0.95);
                box-shadow:
                        var(--shadow-2xl),
                        inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), 0.1);
        }

        :global(html.dark) .mobile-nav-header {
                background: rgba(var(--color-dark-surface-rgb), 0.98);
                border-bottom: var(--border-width-thin) solid rgba(var(--color-white-rgb), 0.1);
                box-shadow: var(--shadow);
        }

        :global(html.dark .mobile-nav-link) {
                background: rgba(var(--color-dark-surface-rgb), 0.1);
                border: var(--border-width-thin) solid rgba(var(--color-white-rgb), 0.05);
        }

        :global(html.dark .mobile-nav-link::before) {
                background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(var(--color-white-rgb), 0.1),
                        transparent
                );
        }

        :global(html.dark .mobile-dropdown) {
                background: rgba(var(--color-dark-surface-rgb), 0.15);
                border: var(--border-width-thin) solid rgba(var(--color-white-rgb), 0.08);
                box-shadow:
                        var(--shadow-xl),
                        inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), 0.1);
        }

        :global(html.dark .mobile-dropdown-link) {
                background: rgba(var(--color-dark-surface-rgb), 0.05);
                border: var(--border-width-thin) solid rgba(var(--color-white-rgb), 0.03);
        }

	/* Touch device optimizations */
	@media (hover: none) {
		:global(.mobile-dropdown-link:hover) {
			color: var(--color-text-light);
			transform: none;
		}

		:global(.mobile-dropdown-link:active) {
			color: var(--color-primary);
			transform: translateX(var(--spacing-2));
		}
	}

	/* Animation keyframes - optimized for performance */
	@keyframes mobileNavSlideIn {
		from {
			transform: translateY(-100%);
		}
		to {
			transform: translateY(0);
		}
	}

        @keyframes mobileNavItemFadeIn {
                from {
                        opacity: 0;
                        transform: translateX(calc(-1 * var(--spacing-5)));
                }
                to {
                        opacity: 1;
                        transform: translateX(0);
                }
	}

	/* Use transform-based animations for better performance */
        .mobile-nav-container.active {
                animation: mobileNavSlideIn var(--anim-duration-base) var(--anim-ease-in-out) forwards;
        }

        .mobile-nav-container.active :global(.mobile-nav-item) {
                animation: mobileNavItemFadeIn var(--anim-duration-fast) var(--anim-ease-in-out) forwards;
        }
</style>
