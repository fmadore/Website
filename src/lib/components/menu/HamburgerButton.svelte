<script lang="ts">
	let {
		isActive = false,
		onClick
	}: {
		isActive?: boolean;
		onClick: () => void;
	} = $props();
</script>

<button
	class="hamburger"
	class:active={isActive}
	onclick={onClick}
	aria-label="Toggle navigation menu"
	aria-expanded={isActive ? 'true' : 'false'}
	aria-controls="mobile-menu"
>
	<span class="hamburger-line"></span>
	<span class="hamburger-line"></span>
	<span class="hamburger-line"></span>
</button>

<style>
        .hamburger {
                display: flex;
                flex-direction: column;
                justify-content: center;
                width: calc(var(--spacing-6) + var(--spacing-1));
                height: calc(var(--spacing-6) + var(--spacing-1));
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 0;
                z-index: var(--z-fixed);
                position: relative;
                gap: var(--spacing-1);
        }

        .hamburger-line {
                width: 100%;
                height: var(--border-width-medium);
                background-color: var(--color-text);
                transition: all var(--anim-duration-base) var(--anim-ease-base);
                transform-origin: center;
        }

	/* Hamburger to X animation */
        .hamburger.active .hamburger-line:first-child {
                transform: translateY(calc(var(--spacing-2) - var(--spacing-05))) rotate(var(--rotate-45));
        }

        .hamburger.active .hamburger-line:nth-child(2) {
                opacity: var(--opacity-0);
                transform: scaleX(var(--scale-0));
        }

        .hamburger.active .hamburger-line:last-child {
                transform: translateY(calc(-1 * (var(--spacing-2) - var(--spacing-05)))) rotate(calc(-1 * var(--rotate-45)));
        }

        /* Hide hamburger completely when menu is active */
        .hamburger.active {
                opacity: var(--opacity-0);
                pointer-events: none;
        }

        /* Hide hamburger on desktop */
        @media (min-width: 80rem) {
                .hamburger {
                        display: none;
                }
        }

        .hamburger:focus-visible {
                outline: var(--border-width-medium) solid var(--color-primary);
                outline-offset: var(--spacing-1);
                border-radius: var(--border-radius-sm);
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
                .hamburger-line {
                        height: calc(var(--border-width-medium) + var(--border-width-thin));
                }
        }

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.hamburger-line {
			transition: none;
		}
	}
</style>
