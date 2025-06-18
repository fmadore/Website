<script lang="ts">	// Svelte 5: use $props() for props
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
		background: rgba(var(--color-white-rgb), var(--opacity-low));
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		border: var(--border-width-thin) solid rgba(var(--color-white-rgb), var(--opacity-medium));
		cursor: pointer;
		padding: var(--spacing-2);
		color: var(--color-text);
		border-radius: var(--border-radius-full);
		transition: all var(--transition-duration-300) var(--anim-ease-in-out);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: calc(var(--spacing-8) + var(--spacing-2));
		height: calc(var(--spacing-8) + var(--spacing-2));
		position: relative;
		box-shadow: 
			var(--shadow-md),
			inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), var(--opacity-medium-high));
	}

	.theme-toggle:hover {
		background: rgba(var(--color-white-rgb), var(--opacity-medium));
		border-color: rgba(var(--color-white-rgb), var(--opacity-medium-high));
		transform: var(--transform-lift-md) scale(var(--scale-105));
		box-shadow: 
			var(--shadow-lg),
			inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), 0.4);
	}

	.theme-toggle:active {
		transform: translateY(0) scale(var(--scale-95));
		box-shadow: 
			var(--shadow-sm),
			inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), var(--opacity-medium));
		animation: themeChangePulse var(--transition-duration-300) var(--transition-ease-out);
	}

	.theme-toggle:focus-visible {
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: var(--spacing-1);
		box-shadow: 
			var(--shadow-lg),
			inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), 0.4),
			0 0 0 var(--border-width-medium) var(--color-primary);
	}

	/* Icon animations */
	.theme-toggle :global(svg) {
		transition: all var(--anim-duration-slow) var(--anim-ease-in-out);
		filter: drop-shadow(0 var(--spacing-1) var(--spacing-2) rgba(var(--color-black-rgb), var(--opacity-low)));
	}

	.theme-toggle:hover :global(svg) {
		transform: rotate(var(--rotate-12)) scale(var(--scale-110));
		filter: drop-shadow(0 var(--spacing-2) var(--spacing-3) rgba(var(--color-black-rgb), 0.15));
	}

	/* Smooth theme transition animation */
	.theme-toggle:active :global(svg) {
		transform: rotate(var(--rotate-180)) scale(var(--scale-90));
	}

	/* Dark mode glassmorphism */
	:global(html.dark) .theme-toggle {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-medium));
		border: var(--border-width-thin) solid rgba(var(--color-white-rgb), var(--opacity-low));
		box-shadow: 
			var(--shadow-md),
			inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), var(--opacity-low));
	}

	:global(html.dark) .theme-toggle:hover {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-medium-high));
		border-color: rgba(var(--color-white-rgb), 0.15);
		box-shadow: 
			var(--shadow-lg),
			inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), 0.15);
	}

	:global(html.dark) .theme-toggle:active {
		box-shadow: 
			var(--shadow-sm),
			inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), 0.08);
	}

	:global(html.dark) .theme-toggle :global(svg) {
		filter: drop-shadow(0 var(--spacing-1) var(--spacing-2) rgba(var(--color-black-rgb), var(--opacity-medium-high)));
	}

	:global(html.dark) .theme-toggle:hover :global(svg) {
		filter: drop-shadow(0 var(--spacing-2) var(--spacing-3) rgba(var(--color-black-rgb), 0.4));
	}

	/* Enhanced glow effect for theme icons */
	.theme-toggle :global(svg[data-icon*="moon"]) {
		color: var(--color-secondary);
	}

	.theme-toggle :global(svg[data-icon*="sun"]) {
		color: var(--color-highlight);
	}

	.theme-toggle:hover :global(svg[data-icon*="moon"]) {
		color: var(--color-text-light);
		text-shadow: 0 0 var(--spacing-3) rgba(var(--color-secondary-rgb), 0.5);
	}

	.theme-toggle:hover :global(svg[data-icon*="sun"]) {
		color: var(--color-highlight);
		text-shadow: 0 0 var(--spacing-4) rgba(var(--color-highlight-rgb), 0.6);
	}

	/* Pulse animation on theme change */
	@keyframes themeChangePulse {
		0% {
			transform: scale(var(--scale-100));
			box-shadow: 
				var(--shadow-md),
				inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), var(--opacity-medium-high));
		}
		50% {
			transform: scale(var(--scale-110));
			box-shadow: 
				var(--shadow-xl),
				inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), 0.5);
		}
		100% {
			transform: scale(var(--scale-100));
			box-shadow: 
				var(--shadow-md),
				inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb), var(--opacity-medium-high));
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
