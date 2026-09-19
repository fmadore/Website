<script lang="ts">
	let { retry, label }: { retry?: () => void; label?: string } = $props();
</script>

<div class="recovery-actions">
	{#if retry}<button type="button" class="btn btn-secondary" onclick={retry}>{label}</button>{/if}
	<button type="button" class="btn btn-secondary" onclick={() => window.location.reload()}
		>Reload page</button
	>
</div>

<style>
	.recovery-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		flex-shrink: 0;
	}
</style>
