<script lang="ts">
	// Svelte 5: use $props() for props
	let { size = 18 } = $props();
	import { getTheme, toggleTheme } from '$lib/stores/themeStore.svelte';
	import Icon from '@iconify/svelte';

	// Get reactive theme value
	const currentTheme = $derived(getTheme());
</script>

<!--
	Both icons are always rendered and CSS decides which one shows, keyed off the
	`dark` class that the inline script in app.html puts on <html> before first
	paint. An `{#if currentTheme === 'light'}` cannot work here: the store has no
	localStorage during prerendering, so the server always emits the light branch
	and a visitor in midnight hydrates the other one — a structural mismatch that
	made Svelte discard and re-render the whole header on every page load.
-->
<button
	class="theme-toggle"
	onclick={toggleTheme}
	aria-label={currentTheme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
	title={currentTheme === 'light' ? 'Midnight' : 'Daylight'}
>
	<span class="icon-stack">
		<span class="icon-slot icon-slot--moon">
			<Icon icon="mdi:moon-waning-crescent" width={size} height={size} />
		</span>
		<span class="icon-slot icon-slot--sun">
			<Icon icon="mdi:white-balance-sunny" width={size} height={size} />
		</span>
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
		transition: opacity var(--duration-fast) var(--ease-out);
	}

	/* Moon in daylight, sun in midnight. Driven by the html class rather than
	 * component state so the markup is identical on the server and the client;
	 * see the note above the button. */
	.icon-slot--sun {
		opacity: 0;
	}

	:global(html.dark) .icon-slot--moon {
		opacity: 0;
	}

	:global(html.dark) .icon-slot--sun {
		opacity: 1;
	}

	.theme-toggle :global(svg) {
		color: currentColor;
	}

	@media (prefers-reduced-motion: reduce) {
		.theme-toggle,
		.theme-toggle :global(svg),
		.icon-slot {
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
