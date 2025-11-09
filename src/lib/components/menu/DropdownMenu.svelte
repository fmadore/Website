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
                background: rgba(var(--color-white-rgb), 0.95);
                backdrop-filter: blur(var(--glass-blur-amount, 20px)) saturate(180%);
                -webkit-backdrop-filter: blur(var(--glass-blur-amount, 20px)) saturate(180%);
                border: var(--border-width-thin) solid rgba(var(--color-white-rgb), 0.4);
                border-radius: var(--border-radius-lg);
                box-shadow:
                        var(--shadow-xl),
                        inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), 0.6),
                        inset 0 calc(-1 * var(--border-width-thin)) 0 rgba(var(--color-white-rgb), 0.2);
                padding: var(--spacing-3);
                opacity: 0;
                visibility: hidden;
                transform: translateY(calc(-1 * var(--spacing-3))) scale(0.95);
                transition:
                        opacity var(--anim-duration-base) var(--anim-ease-base),
                        visibility var(--anim-duration-base) var(--anim-ease-base),
                        transform var(--anim-duration-base) var(--anim-ease-base);
                pointer-events: none;
        }

	.dropdown-menu.active {
		opacity: 1;
		visibility: visible;
		transform: translateY(0) scale(1);
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
                transition: all var(--anim-duration-base) var(--anim-ease-base);
                margin-bottom: var(--spacing-2);
                position: relative;
                overflow: hidden;
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
                        rgba(var(--color-white-rgb), 0.4),
                        transparent
                );
                transition: left var(--anim-duration-slow) var(--anim-ease-base);
        }

        :global(.dropdown-item:hover),
        :global(.dropdown-item:focus) {
                background: rgba(var(--color-primary-rgb), 0.1);
                color: var(--color-primary);
                transform: translateX(var(--spacing-2)) scale(1.02);
                box-shadow:
                        var(--shadow-lg),
                        inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), 0.3);
        }

	:global(.dropdown-item:hover::before) {
		left: 100%;
	}

	:global(.dropdown-item:last-child) {
		margin-bottom: 0;
	}

	/* Dark mode */
        :global(html.dark) .dropdown-menu {
                background: rgba(var(--color-dark-surface-rgb), 0.9);
                border: var(--border-width-thin) solid rgba(var(--color-white-rgb), 0.2);
                box-shadow:
                        var(--shadow-xl),
                        inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), 0.2),
                        inset 0 calc(-1 * var(--border-width-thin)) 0 rgba(var(--color-white-rgb), 0.1);
        }

        :global(html.dark .dropdown-item::before) {
                background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(var(--color-white-rgb), 0.2),
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

	/* Animation keyframes */
        @keyframes dropdownFadeIn {
                from {
                        opacity: 0;
                        transform: translateY(calc(-1 * var(--spacing-3))) scale(0.95);
                }
                to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                }
        }

        .dropdown-menu.active {
                animation: dropdownFadeIn var(--anim-duration-base) var(--anim-ease-base) forwards;
        }

        /* Staggered item animation */
        :global(.dropdown-item) {
                opacity: 0;
                transform: translateX(calc(-1 * (var(--spacing-2) + var(--spacing-05))));
                animation: dropdownItemFadeIn var(--anim-duration-base) var(--anim-ease-base) forwards;
        }

	.dropdown-menu.active :global(.dropdown-item:nth-child(1)) {
		animation-delay: 0.05s;
	}

	.dropdown-menu.active :global(.dropdown-item:nth-child(2)) {
		animation-delay: 0.1s;
	}

	.dropdown-menu.active :global(.dropdown-item:nth-child(3)) {
		animation-delay: 0.15s;
	}

	.dropdown-menu.active :global(.dropdown-item:nth-child(4)) {
		animation-delay: 0.2s;
	}

        @keyframes dropdownItemFadeIn {
                from {
                        opacity: 0;
                        transform: translateX(calc(-1 * (var(--spacing-2) + var(--spacing-05))));
                }
                to {
                        opacity: 1;
                        transform: translateX(0);
                }
	}
</style>
