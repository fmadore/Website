<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		href,
		active = false,
		hasDropdown = false,
		onclick,
		onkeydown,
		preloadStrategy = 'eager',
		children,
		...restProps
	}: {
		href: string;
		active?: boolean;
		hasDropdown?: boolean;
		onclick?: (event: MouseEvent) => void;
		onkeydown?: (event: KeyboardEvent) => void;
		preloadStrategy?: 'eager' | 'hover' | 'tap' | 'off';
		children?: Snippet;
		[key: string]: unknown;
	} = $props();

</script>

<a
	{href}
	class="nav-link"
	class:active
	aria-haspopup={hasDropdown ? 'true' : 'false'}
	data-sveltekit-preload-code={preloadStrategy}
	{onclick}
	{onkeydown}
	{...restProps}
>
	{@render children?.()}
	{#if hasDropdown}
		<span class="dropdown-icon">▾</span>
	{/if}
</a>

<style>
        .nav-link {
                color: var(--color-text);
                text-decoration: none;
                font-weight: var(--font-weight-medium);
                font-size: var(--font-size-base);
                padding: var(--spacing-2) 0;
                transition: all var(--anim-duration-fast) var(--anim-ease-base);
                position: relative;
                display: flex;
                align-items: center;
                gap: var(--spacing-1);
        }

        .nav-link::after {
                content: '';
                position: absolute;
                bottom: calc(-1 * var(--spacing-05));
                left: 0;
                width: 0;
                height: var(--border-width-medium);
                background-color: var(--color-primary);
                transition: width var(--anim-duration-base) var(--anim-ease-base);
        }

	.nav-link:hover {
		color: var(--color-primary);
	}

        .nav-link:hover::after {
                width: 100%;
        }

        .dropdown-icon {
                display: inline-block;
                font-size: var(--font-size-xs);
                transition: transform var(--anim-duration-base) var(--anim-ease-base);
                line-height: 1;
        }

        .nav-link:focus-visible {
                outline: var(--border-width-medium) solid var(--color-primary);
                outline-offset: var(--spacing-1);
        }

	@media (hover: none) {
		/* Prevent hover state issues on touch devices */
                .nav-link:hover::after {
                        width: 0;
                }

                .nav-link:active::after {
                        width: 100%;
                }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
                .nav-link::after {
                        height: calc(var(--border-width-medium) + var(--border-width-thin));
                }
        }

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.nav-link,
		.nav-link::after,
		.dropdown-icon {
			transition: none;
		}
	}
</style>
