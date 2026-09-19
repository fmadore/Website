<script lang="ts">
	import RecoveryActions from './RecoveryActions.svelte';
	let { error, retry }: { error: string | null; retry: () => void } = $props();
</script>

{#if error}
	<div class="state-note" role="status" style:flex="0 0 auto">
		<p>The chart could not be displayed. You can still read the data table.</p>
		<RecoveryActions {retry} label="Retry chart" />
	</div>
{/if}
