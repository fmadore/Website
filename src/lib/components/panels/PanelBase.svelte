<script lang="ts">
	import '../../../styles/components/panels.css';
	import { type Snippet } from 'svelte';

	// Props
	let {
		title = '',
		variant = 'default',
		showFooter = false,
		header,
		content,
		footer
	}: {
		title?: string;
		variant?: 'default' | 'activities' | 'items';
		showFooter?: boolean;
		header?: Snippet;
		content?: Snippet;
		footer?: Snippet;
	} = $props();

	// The redesign renders panels as flat ruled sections rather than glass
	// boxes: `.panel--ruled` (styled below) supplies the 3px section rule.
	const baseClasses = 'panel panel--ruled scroll-reveal';
	const variantClasses = {
		default: 'panel-default',
		activities: 'panel-activities',
		items: 'panel-items'
	};

	const combinedClasses = $derived(`${baseClasses} ${variantClasses[variant]}`.trim());
</script>

<div class={combinedClasses}>
	<div class="panel-header">
		{#if header}
			{@render header()}
		{:else if title}
			<h2 class="panel-title">{title}</h2>
		{/if}
	</div>

	<div class="panel-content">
		{#if content}
			{@render content()}
		{/if}
	</div>

	{#if showFooter && footer}
		<div class="panel-footer">
			{@render footer()}
		</div>
	{/if}
</div>

<style>
	/* A ruled section, not a glass box: transparent surface, a 3px ink rule
	 * across the top, and the mono panel-title label hanging beneath it. The
	 * side padding is dropped so the panel reads as content on paper; the
	 * hairline-separated rows inside carry the structure. */
	.panel.panel--ruled {
		background: transparent;
		border: none;
		border-top: var(--rule-section) solid var(--color-primary);
		border-radius: 0;
		padding: var(--space-md) 0 0 0;
		overflow: visible;
	}
</style>
