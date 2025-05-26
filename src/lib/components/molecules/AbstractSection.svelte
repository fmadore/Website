<script lang="ts">
	let {
		abstract = undefined,
		sectionClass = 'mb-6',
		titleClass = 'text-xl font-semibold mb-2',
		titleText = 'Abstract',
		contentClass = 'text-text'
	}: {
		abstract?: string | undefined | null;
		sectionClass?: string;
		titleClass?: string;
		titleText?: string;
		contentClass?: string;
	} = $props();
</script>

{#if abstract}
	<section class={sectionClass}>
		<h2 class={titleClass}>{titleText}</h2>
		<div class={contentClass}>{abstract}</div>
	</section>
{/if}
