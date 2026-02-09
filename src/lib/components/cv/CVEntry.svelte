<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		year,
		yearWidth = 'auto',
		children
	}: {
		year: string | number;
		yearWidth?: 'auto' | 'fixed';
		children: Snippet;
	} = $props();
</script>

<div class="cv-entry">
	<div class="cv-entry-year" class:cv-entry-year-fixed={yearWidth === 'fixed'}>
		{year}
	</div>
	<div class="cv-entry-content">
		{@render children()}
	</div>
</div>

<style>
	.cv-entry {
		display: flex;
		gap: var(--space-4);
	}

	.cv-entry-year {
		font-weight: var(--font-weight-semibold);
		white-space: nowrap;
	}

	.cv-entry-year-fixed {
		width: var(--space-20, 5rem);
	}

	.cv-entry-content {
		flex: 1;
	}
</style>
