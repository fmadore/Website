<script lang="ts">
	import '../../../styles/components/panels.css';

	// Props
	export let title: string = '';
	export let variant: 'default' | 'activities' | 'items' = 'default';
	export let showFooter: boolean = false;
</script>

<div class="panel panel-{variant}">
	<div class="panel-header">
		<slot name="header">
			{#if title}
				<h2 class="panel-title">{title}</h2>
			{/if}
		</slot>
	</div>

	<div class="panel-content">
		<slot name="content" />
	</div>

	{#if showFooter}
		<div class="panel-footer">
			<slot name="footer" />
		</div>
	{/if}
</div>
