<script lang="ts">
	// Svelte 5: use $props() for props
	let { size = 20 } = $props();
	import { getTheme, toggleTheme } from '$lib/stores/themeStore.svelte';
	import Icon from '@iconify/svelte';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { motionDuration } from '$lib/utils/motion';

	// Get reactive theme value
	const currentTheme = $derived(getTheme());

	// Icon swap timing — short enough to feel instant, long enough to read as
	// a deliberate transition rather than a flicker.
	const ICON_FADE = 200;
</script>

<button
	class="theme-toggle"
	onclick={toggleTheme}
	aria-label={currentTheme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
>
	<span class="icon-stack">
		{#if currentTheme === 'light'}
			<span
				class="icon-slot"
				in:fade={{ duration: motionDuration(ICON_FADE), easing: cubicOut }}
				out:fade={{ duration: motionDuration(ICON_FADE), easing: cubicOut }}
			>
				<Icon icon="mdi:moon-waning-crescent" width={size} height={size} />
			</span>
		{:else}
			<span
				class="icon-slot"
				in:fade={{ duration: motionDuration(ICON_FADE), easing: cubicOut }}
				out:fade={{ duration: motionDuration(ICON_FADE), easing: cubicOut }}
			>
				<Icon icon="mdi:white-balance-sunny" width={size} height={size} />
			</span>
		{/if}
	</span>
</button>

<style>
	/*
	 * Theme toggle chip — warm paper tile inside the header. Previously
	 * built with white-tinted glass highlights (inset top-edge shine); the
	 * warm palette calls for tinting toward primary instead.
	 */
	.theme-toggle {
		background: color-mix(in srgb, var(--color-primary) calc(var(--opacity-5) * 100%), transparent);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-15) * 100%), transparent);
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
		box-shadow: var(--shadow-sm);
		will-change: transform;
	}

	.theme-toggle:hover {
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-10) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-30) * 100%),
			transparent
		);
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-md);
	}

	.theme-toggle:active {
		transform: translateY(0) scale(var(--scale-95));
		box-shadow: var(--shadow-xs);
		animation: themeChangePulse var(--duration-moderate) var(--ease-out);
	}

	.theme-toggle:focus-visible {
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: var(--space-1);
		box-shadow:
			var(--shadow-md),
			0 0 0 var(--border-width-medium) color-mix(in srgb, var(--color-primary) 30%, transparent);
	}

	/* Icon stack — both icons (when transitioning between themes) occupy the
	 * same grid cell so the cross-fade reads as one icon morphing into the
	 * next, not two stacked icons offset from each other. */
	.icon-stack {
		display: inline-grid;
		place-items: center;
	}

	.icon-slot {
		grid-column: 1;
		grid-row: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	/* Icon animations */
	.theme-toggle :global(svg) {
		transition:
			transform var(--duration-slow) var(--ease-spring),
			filter var(--duration-normal) var(--ease-out);
		filter: drop-shadow(
			0 var(--space-1) var(--space-2)
				color-mix(in srgb, var(--color-black) calc(var(--opacity-10) * 100%), transparent)
		);
	}

	.theme-toggle:hover :global(svg) {
		transform: rotate(var(--rotate-12)) scale(var(--scale-110));
		filter: drop-shadow(
			0 var(--space-2) var(--space-3)
				color-mix(in srgb, var(--color-black) calc(var(--opacity-15) * 100%), transparent)
		);
	}

	/* Smooth theme transition animation */
	.theme-toggle:active :global(svg) {
		transform: rotate(var(--rotate-180)) scale(var(--scale-90));
	}

	/* Dark mode — warm primary-tinted tile, no inset white highlights. */
	:global(html.dark) .theme-toggle {
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-10) * 100%),
			transparent
		);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-25) * 100%), transparent);
		box-shadow: var(--shadow-sm);
	}

	:global(html.dark) .theme-toggle:hover {
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-20) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-40) * 100%),
			transparent
		);
		box-shadow: var(--shadow-md);
	}

	:global(html.dark) .theme-toggle:active {
		box-shadow: var(--shadow-xs);
	}

	:global(html.dark) .theme-toggle :global(svg) {
		filter: drop-shadow(
			0 var(--space-1) var(--space-2)
				color-mix(in srgb, var(--color-black) calc(var(--opacity-30) * 100%), transparent)
		);
	}

	:global(html.dark) .theme-toggle:hover :global(svg) {
		filter: drop-shadow(
			0 var(--space-2) var(--space-3)
				color-mix(in srgb, var(--color-black) calc(var(--opacity-40) * 100%), transparent)
		);
	}

	/* Enhanced glow effect for theme icons */
	/* Light mode: moon icon (shown when in light mode, to switch to dark) */
	:global(html:not(.dark)) .theme-toggle :global(svg) {
		color: var(--color-secondary);
	}

	/* Dark mode: sun icon (shown when in dark mode, to switch to light) */
	:global(html.dark) .theme-toggle :global(svg) {
		color: var(--color-highlight);
	}

	:global(html:not(.dark)) .theme-toggle:hover :global(svg) {
		color: var(--color-text-light);
		filter: drop-shadow(
			0 0 var(--space-3)
				color-mix(in srgb, var(--color-secondary) calc(var(--opacity-50) * 100%), transparent)
		);
	}

	:global(html.dark) .theme-toggle:hover :global(svg) {
		color: var(--color-highlight);
		filter: drop-shadow(
			0 0 var(--space-4)
				color-mix(in srgb, var(--color-highlight) calc(var(--opacity-60) * 100%), transparent)
		);
	}

	/* Pulse animation on theme change — single shadow layer, no inset shine. */
	@keyframes themeChangePulse {
		0% {
			transform: scale(var(--scale-100));
			box-shadow: var(--shadow-md);
		}
		50% {
			transform: scale(var(--scale-110));
			box-shadow: var(--shadow-lg);
		}
		100% {
			transform: scale(var(--scale-100));
			box-shadow: var(--shadow-md);
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
