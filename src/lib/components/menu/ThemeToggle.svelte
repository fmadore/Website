<script lang="ts">
	// Svelte 5: use $props() for props
	let { size = 20 } = $props();
	import { getTheme, toggleTheme } from '$lib/stores/themeStore.svelte';
	import Icon from '@iconify/svelte';

	// Get reactive theme value
	const currentTheme = $derived(getTheme());
</script>

<button
	class="theme-toggle"
	onclick={toggleTheme}
	aria-label={currentTheme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
>
	{#if currentTheme === 'light'}
		<Icon icon="mdi:moon-waning-crescent" width={size} height={size} />
	{:else}
		<Icon icon="mdi:white-balance-sunny" width={size} height={size} />
	{/if}
</button>

<style>
	.theme-toggle {
		background: color-mix(in srgb, var(--color-white) calc(var(--opacity-low) * 100%), transparent);
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-medium) * 100%), transparent);
		cursor: pointer;
		padding: var(--space-2);
		color: var(--color-text);
		border-radius: var(--border-radius-full);
		transition:
			background-color var(--duration-normal) var(--ease-out),
			border-color var(--duration-normal) var(--ease-out),
			transform var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: calc(var(--space-8) + var(--space-2));
		height: calc(var(--space-8) + var(--space-2));
		position: relative;
		box-shadow:
			var(--shadow-md),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-medium-high) * 100%), transparent);
		will-change: transform, box-shadow;
	}

	.theme-toggle:hover {
		background: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-medium) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-medium-high) * 100%),
			transparent
		);
		transform: var(--transform-lift-md) scale(var(--scale-105));
		box-shadow:
			var(--shadow-lg),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-40) * 100%), transparent);
	}

	.theme-toggle:active {
		transform: translateY(0) scale(var(--scale-95));
		box-shadow:
			var(--shadow-sm),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-medium) * 100%), transparent);
		animation: themeChangePulse var(--duration-moderate) var(--ease-out);
	}

	.theme-toggle:focus-visible {
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: var(--space-1);
		box-shadow:
			var(--shadow-lg),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-40) * 100%), transparent),
			0 0 0 var(--border-width-medium) var(--color-primary);
	}

	/* Icon animations */
	.theme-toggle :global(svg) {
		transition:
			transform var(--duration-slow) var(--ease-spring),
			filter var(--duration-normal) var(--ease-out);
		filter: drop-shadow(
			0 var(--space-1) var(--space-2)
				color-mix(in srgb, var(--color-black) calc(var(--opacity-low) * 100%), transparent)
		);
	}

	.theme-toggle:hover :global(svg) {
		transform: rotate(var(--rotate-12)) scale(var(--scale-110));
		filter: drop-shadow(
			0 var(--space-2) var(--space-3)
				color-mix(in srgb, var(--color-black) calc(var(--opacity-medium) * 100%), transparent)
		);
	}

	/* Smooth theme transition animation */
	.theme-toggle:active :global(svg) {
		transform: rotate(var(--rotate-180)) scale(var(--scale-90));
	}

	/* Dark mode glassmorphism */
	:global(html.dark) .theme-toggle {
		background: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--opacity-medium) * 100%),
			transparent
		);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-low) * 100%), transparent);
		box-shadow:
			var(--shadow-md),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-low) * 100%), transparent);
	}

	:global(html.dark) .theme-toggle:hover {
		background: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--opacity-medium-high) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-medium) * 100%),
			transparent
		);
		box-shadow:
			var(--shadow-lg),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-15) * 100%), transparent);
	}

	:global(html.dark) .theme-toggle:active {
		box-shadow:
			var(--shadow-sm),
			inset 0 var(--border-width-thin) 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-10) * 100%), transparent);
	}

	:global(html.dark) .theme-toggle :global(svg) {
		filter: drop-shadow(
			0 var(--space-1) var(--space-2)
				color-mix(in srgb, var(--color-black) calc(var(--opacity-medium-high) * 100%), transparent)
		);
	}

	:global(html.dark) .theme-toggle:hover :global(svg) {
		filter: drop-shadow(
			0 var(--space-2) var(--space-3)
				color-mix(in srgb, var(--color-black) calc(var(--opacity-40) * 100%), transparent)
		);
	}

	/* Enhanced glow effect for theme icons */
	.theme-toggle :global(svg[data-icon*='moon']) {
		color: var(--color-secondary);
	}

	.theme-toggle :global(svg[data-icon*='sun']) {
		color: var(--color-highlight);
	}

	.theme-toggle:hover :global(svg[data-icon*='moon']) {
		color: var(--color-text-light);
		text-shadow: 0 0 var(--space-3)
			color-mix(in srgb, var(--color-secondary) calc(var(--opacity-50) * 100%), transparent);
	}

	.theme-toggle:hover :global(svg[data-icon*='sun']) {
		color: var(--color-highlight);
		text-shadow: 0 0 var(--space-4)
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-60) * 100%), transparent);
	}

	/* Pulse animation on theme change */
	@keyframes themeChangePulse {
		0% {
			transform: scale(var(--scale-100));
			box-shadow:
				var(--shadow-md),
				inset 0 var(--border-width-thin) 0
					color-mix(
						in srgb,
						var(--color-white) calc(var(--opacity-medium-high) * 100%),
						transparent
					);
		}
		50% {
			transform: scale(var(--scale-110));
			box-shadow:
				var(--shadow-xl),
				inset 0 var(--border-width-thin) 0
					color-mix(in srgb, var(--color-white) calc(var(--opacity-50) * 100%), transparent);
		}
		100% {
			transform: scale(var(--scale-100));
			box-shadow:
				var(--shadow-md),
				inset 0 var(--border-width-thin) 0
					color-mix(
						in srgb,
						var(--color-white) calc(var(--opacity-medium-high) * 100%),
						transparent
					);
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.theme-toggle,
		.theme-toggle :global(svg) {
			transition: none;
		}

		.theme-toggle:active {
			animation: none;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.theme-toggle {
			border-width: var(--border-width-medium);
		}

		.theme-toggle:focus-visible {
			outline-width: var(--border-width-thick);
		}
	}
</style>
