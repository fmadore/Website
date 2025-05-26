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
</script>

<div class="panel panel-{variant}">
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
