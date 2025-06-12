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
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		cursor: pointer;
		padding: var(--spacing-2);
		color: var(--color-text);
		border-radius: 50%;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		position: relative;
		box-shadow: 
			0 4px 16px 0 rgba(31, 38, 135, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.theme-toggle:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.3);
		transform: translateY(-2px) scale(1.05);
		box-shadow: 
			0 8px 24px 0 rgba(31, 38, 135, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
	}

	.theme-toggle:active {
		transform: translateY(0) scale(0.98);
		box-shadow: 
			0 2px 8px 0 rgba(31, 38, 135, 0.25),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.theme-toggle:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
		box-shadow: 
			0 8px 24px 0 rgba(31, 38, 135, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.4),
			0 0 0 2px var(--color-primary);
	}

	/* Icon animations */
	.theme-toggle :global(svg) {
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
	}

	.theme-toggle:hover :global(svg) {
		transform: rotate(15deg) scale(1.1);
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
	}

	/* Smooth theme transition animation */
	.theme-toggle:active :global(svg) {
		transform: rotate(180deg) scale(0.9);
	}

	/* Dark mode glassmorphism */
	:global(html.dark) .theme-toggle {
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 
			0 4px 16px 0 rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	:global(html.dark) .theme-toggle:hover {
		background: rgba(0, 0, 0, 0.3);
		border-color: rgba(255, 255, 255, 0.15);
		box-shadow: 
			0 8px 24px 0 rgba(0, 0, 0, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}

	:global(html.dark) .theme-toggle:active {
		box-shadow: 
			0 2px 8px 0 rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.08);
	}

	:global(html.dark) .theme-toggle :global(svg) {
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	:global(html.dark) .theme-toggle:hover :global(svg) {
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
	}

	/* Enhanced glow effect for theme icons */
	.theme-toggle :global(svg[data-icon*="moon"]) {
		color: #64748b;
	}

	.theme-toggle :global(svg[data-icon*="sun"]) {
		color: #f59e0b;
	}

	.theme-toggle:hover :global(svg[data-icon*="moon"]) {
		color: #475569;
		text-shadow: 0 0 8px rgba(100, 116, 139, 0.5);
	}

	.theme-toggle:hover :global(svg[data-icon*="sun"]) {
		color: #d97706;
		text-shadow: 0 0 12px rgba(245, 158, 11, 0.6);
	}

	/* Pulse animation on theme change */
	@keyframes themeChangePulse {
		0% {
			transform: scale(1);
			box-shadow: 
				0 4px 16px 0 rgba(31, 38, 135, 0.2),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
		}
		50% {
			transform: scale(1.1);
			box-shadow: 
				0 8px 32px 0 rgba(31, 38, 135, 0.4),
				inset 0 1px 0 rgba(255, 255, 255, 0.5);
		}
		100% {
			transform: scale(1);
			box-shadow: 
				0 4px 16px 0 rgba(31, 38, 135, 0.2),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
		}
	}

	.theme-toggle:active {
		animation: themeChangePulse 0.3s ease-out;
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
			border-width: 2px;
		}
		
		.theme-toggle:focus-visible {
			outline-width: 3px;
		}
	}
</style>
