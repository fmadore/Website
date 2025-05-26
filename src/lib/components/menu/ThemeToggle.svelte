<script lang="ts">
	// Svelte 5: use $props() for props
	let { size = 20 } = $props();
	import { theme, toggleTheme } from '$lib/stores/themeStore';
	import Icon from '@iconify/svelte';
	import { onDestroy } from 'svelte';
	let currentTheme = $state('light');
	const unsubscribe = theme.subscribe((value) => (currentTheme = value));
	onDestroy(unsubscribe);
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
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--spacing-1);
		color: var(--color-text);
		border-radius: 50%;
		transition: all 0.2s ease;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		position: relative;
	}

	.theme-toggle:hover {
		background-color: var(--color-border);
		transform: scale(1.05);
	}

	.theme-toggle:active {
		transform: scale(0.95);
	}

	.theme-toggle:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	/* Icon rotation animation */
	.theme-toggle :global(svg) {
		transition: transform 0.3s ease;
	}

	.theme-toggle:hover :global(svg) {
		transform: rotate(15deg);
	}
</style>
