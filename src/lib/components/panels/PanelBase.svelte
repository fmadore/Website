<script lang="ts">
	import '../../../styles/components/panels.css';
	import { type Snippet } from 'svelte';

	// Props
	let {
		title = '',
		variant = 'default',
		showFooter = false,
		glassEffect = 'glass-panel',
		header,
		content,
		footer
	}: {
		title?: string;
		variant?: 'default' | 'activities' | 'items';
		showFooter?: boolean;
		glassEffect?: 'glass-card' | 'glass-panel' | 'glass-panel-light' | 'glass-medium' | 'glass-light';
		header?: Snippet;
		content?: Snippet;
		footer?: Snippet;
	} = $props();

	// Combine classes based on variant and glass effect
	const baseClasses = 'panel';
	const variantClasses = {
		default: 'panel-default',
		activities: 'panel-activities',
		items: 'panel-items'
	};
	
	const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${glassEffect}`.trim();
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
