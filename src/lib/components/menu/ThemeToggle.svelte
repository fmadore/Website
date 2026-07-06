<script lang="ts">
	// Svelte 5: use $props() for props
	let { size = 18 } = $props();
	import { getTheme, toggleTheme } from '$lib/stores/themeStore.svelte';
	import Icon from '@iconify/svelte';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { motionDuration } from '$lib/utils/motion';

	// Get reactive theme value
	const currentTheme = $derived(getTheme());

	// Icon swap timing — short enough to feel instant, long enough to read as
	// a deliberate transition rather than a flicker.
	const ICON_FADE = 160;
</script>

<button
	class="theme-toggle"
	onclick={toggleTheme}
	aria-label={currentTheme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
	title={currentTheme === 'light' ? 'Midnight' : 'Daylight'}
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
	 * Theme toggle — a square ink control in the masthead. No glass, glow,
	 * rotation or shadow: it flips daylight ⇆ midnight (the microfilm negative).
	 * The icon warms to pine on hover.
	 */
	.theme-toggle {
		background: transparent;
		border: var(--border-width-thin) solid var(--color-border-dark);
		border-radius: 0;
		cursor: pointer;
		padding: var(--space-2);
		color: var(--color-text-soft);
		transition:
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			background var(--duration-fast) var(--ease-out);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: calc(var(--space-8) + var(--space-1));
		height: calc(var(--space-8) + var(--space-1));
	}

	.theme-toggle:hover {
		border-color: var(--color-primary);
		color: var(--color-accent);
		background: var(--color-surface-alt);
	}

	.theme-toggle:active {
		background: var(--color-surface-alt);
	}

	.theme-toggle:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-1);
	}

	/* Icon stack — both icons occupy one grid cell so the cross-fade reads as
	 * a single icon flipping. */
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

	.theme-toggle :global(svg) {
		color: currentColor;
	}

	@media (prefers-reduced-motion: reduce) {
		.theme-toggle,
		.theme-toggle :global(svg) {
			transition: none;
		}
	}

	@media (prefers-contrast: high) {
		.theme-toggle {
			border-width: var(--border-width-medium);
		}

		.theme-toggle:focus-visible {
			outline-width: var(--border-width-thick);
		}
	}
</style>
