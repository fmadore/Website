<script lang="ts">
	import { base } from '$app/paths';
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

<div
	class="dropdown-menu"
	class:active={isActive}
>
	<ul
		role="menu"
		aria-label={`${parentName} submenu`}
	>
		{#each items as item (item.path)}
			<li role="none">
				<a
					href={item.path}
					class="dropdown-item"
					data-sveltekit-preload-code="eager"
					onclick={onItemClick}
					role="menuitem"
					target={item.path.startsWith('http') ? '_blank' : null}
					rel={item.path.startsWith('http') ? 'noopener noreferrer' : null}
				>
					{item.name}
				</a>
			</li>
		{/each}
	</ul>
</div>

<style>
        .dropdown-menu {
                position: absolute;
                top: calc(100% + var(--spacing-3));
                left: 0;
                z-index: var(--z-dropdown);
                min-width: min(90vw, var(--content-width-xs));
                width: max-content;
                max-width: min(100vw, var(--content-width-sm));
                background: rgba(var(--color-white-rgb), var(--glass-opacity-fallback-light));
                backdrop-filter: blur(var(--glass-blur-amount, var(--glass-blur-fallback))) saturate(180%);
                -webkit-backdrop-filter: blur(var(--glass-blur-amount, var(--glass-blur-fallback))) saturate(180%);
                border: var(--border-width-thin) solid rgba(var(--color-white-rgb), var(--opacity-40));
                border-radius: var(--border-radius-lg);
                box-shadow:
                        var(--shadow-xl),
                        inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), var(--opacity-60)),
                        inset 0 calc(-1 * var(--border-width-thin)) 0 rgba(var(--color-white-rgb), var(--opacity-20));
                padding: var(--spacing-3);
                opacity: 0;
                visibility: hidden;
                transform: translateY(calc(-1 * var(--transform-distance-sm))) scale(var(--scale-95));
                transition:
                        opacity var(--duration-normal) var(--ease-out),
                        visibility var(--duration-normal) var(--ease-out),
                        transform var(--duration-normal) var(--ease-out);
                pointer-events: none;
                will-change: opacity, transform, visibility;
        }

	.dropdown-menu.active {
		opacity: 1;
		visibility: visible;
		transform: translateY(0) scale(var(--scale-100));
		pointer-events: auto;
	}

	.dropdown-menu ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

        :global(.dropdown-item) {
                display: block;
                padding: var(--spacing-3) var(--spacing-4);
                color: var(--color-text);
                text-decoration: none;
                font-size: var(--font-size-sm);
                font-weight: var(--font-weight-medium);
                border-radius: var(--border-radius-md);
                transition:
                        background-color var(--duration-fast) var(--ease-out),
                        color var(--duration-fast) var(--ease-out),
                        transform var(--duration-normal) var(--ease-out),
                        box-shadow var(--duration-normal) var(--ease-out);
                margin-bottom: var(--spacing-2);
                position: relative;
                overflow: hidden;
                will-change: transform, background-color;
        }

        :global(.dropdown-item::before) {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(var(--color-white-rgb), var(--opacity-40)),
                        transparent
                );
                transition: left var(--duration-slow) var(--ease-out);
        }

        :global(.dropdown-item:hover),
        :global(.dropdown-item:focus) {
                background: rgba(var(--color-primary-rgb), var(--opacity-10));
                color: var(--color-primary);
                transform: translateX(var(--spacing-2)) scale(var(--transform-scale-lg));
                box-shadow:
                        var(--shadow-lg),
                        inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), var(--opacity-30));
        }

	:global(.dropdown-item:hover::before) {
		left: 100%;
	}

	:global(.dropdown-item:last-child) {
		margin-bottom: 0;
	}

	/* Dark mode */
        :global(html.dark) .dropdown-menu {
                background: rgba(var(--color-dark-surface-rgb), var(--opacity-90));
                border: var(--border-width-thin) solid rgba(var(--color-white-rgb), var(--opacity-20));
                box-shadow:
                        var(--shadow-xl),
                        inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), var(--opacity-20)),
                        inset 0 calc(-1 * var(--border-width-thin)) 0 rgba(var(--color-white-rgb), var(--opacity-10));
        }

        :global(html.dark .dropdown-item::before) {
                background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(var(--color-white-rgb), var(--opacity-20)),
                        transparent
                );
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
                        transform: translateY(calc(-1 * var(--transform-distance-sm))) scale(var(--scale-95));
                }
                to {
                        opacity: 1;
                        transform: translateY(0) scale(var(--scale-100));
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

        .dropdown-menu.active :global(.dropdown-item:nth-child(n+6)) {
		animation-delay: var(--stagger-6);
	}

	/* ===== REDUCED MOTION SUPPORT ===== */
        /* Respect user preference for reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.dropdown-menu {
			transition: opacity var(--duration-instant) linear;
                        transform: translateY(0) scale(var(--scale-100));
		}

		.dropdown-menu.active {
			animation: none;
                        opacity: 1;
		}

		:global(.dropdown-item) {
			animation: none !important;
			opacity: 1 !important;
			transform: none !important;
                        transition: background-color var(--duration-instant) linear,
                                    color var(--duration-instant) linear;
                        will-change: auto;
		}

		:global(.dropdown-item:hover),
		:global(.dropdown-item:focus) {
			transform: none;
		}

		:global(.dropdown-item::before) {
			display: none;
		}
	}

        /* ===== PERFORMANCE OPTIMIZATION ===== */
        /* Remove will-change after animation completes for better memory usage */
        .dropdown-menu:not(.active) {
                will-change: auto;
        }
</style>
