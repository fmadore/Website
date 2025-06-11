<script lang="ts">
	import { type Snippet } from 'svelte';

	let {
		containerClass = 'container mx-auto py-6', // Customizable container class
		gridClass = 'grid grid-cols-1 md:grid-cols-4 gap-6', // Customizable grid class
		sidebarClass = 'md:col-span-1', // Class for the sidebar
		sidebar,
		children
	}: {
		containerClass?: string;
		gridClass?: string;
		sidebarClass?: string;
		sidebar?: Snippet;
		children?: Snippet;
	} = $props();
</script>

<div class={containerClass}>
	<div class={gridClass}>
		<div class="{sidebarClass} sidebar-column">
			{#if sidebar}
				{@render sidebar()}
			{/if}
		</div>

		<div class="md:col-span-3 main-content-column">
			{#if children}
				{@render children()}
			{/if}
		</div>
	</div>
</div>

<style>
	.sidebar-column {
		/* Ensure sidebar column maintains its width and position */
		min-width: 0;
		/* Prevent layout shifts */
		contain: layout;
	}

	.main-content-column {
		/* Ensure main content column can grow/shrink as needed */
		min-width: 0;
		/* Allow content changes without affecting sidebar */
		contain: layout;
	}

	/* Ensure grid stability */
	:global(.grid) {
		/* Prevent grid from shifting during content changes */
		align-items: start;
	}
</style>
