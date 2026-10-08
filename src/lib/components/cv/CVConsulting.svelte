<script lang="ts">
	import { consulting } from '$lib/data/consulting';
	import CVSection from './CVSection.svelte';
</script>

<CVSection
	title="Consulting and Legal Expertise"
	items={consulting}
	year={(item) => item.year}
	key={(item) => item.role}
>
	{#snippet entry(item)}
		{item.role}, {item.organization}.
		{#each item.descriptions as description (description)}
			<p class="cv-detail">{description}</p>
		{/each}
	{/snippet}
</CVSection>
