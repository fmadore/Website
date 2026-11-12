<script lang="ts">
	import NetworkGraph from './NetworkGraph.svelte';
	import NetworkControls from './NetworkControls.svelte';
	import VizSection from './VizSection.svelte';
	import type { NetworkData } from '#lib/utils/networkAggregation.ts';
	let {
		network,
		section
	}: { network: NetworkData; section: { id: string; no: string; title: string; count: string } } =
		$props();
	const suggestions = $derived(network.nodes.map((node) => node.id));
	let topN = $state(20);
	let search = $state('');
</script>

<VizSection
	{...section}
	description="Institutions are linked when their members appeared in the same panel, workshop, or event. Node size reflects how many talks each institution took part in. An event shares one unit of tie strength among its pairs, so a workshop of two dozen institutions draws hairlines that pull little, and a pair that met at several small events draws the heavier line; the tooltip counts every shared event. Credit lines that describe a role (“Author of …”) are not institutions and are left out. This one stays a map rather than a matrix: the question here is which institutions cluster together, and spatial grouping answers it more directly than a grid of pairs."
	variant="network"
	height="500px"
	hasData={network.nodes.length > 0}
	empty="No institutions recorded."
>
	{#snippet controls()}
		{#if network.nodes.length > 0}
			<NetworkControls
				bind:topN
				bind:searchQuery={search}
				maxN={network.nodes.length}
				searchLabel="Search institutions"
				searchPlaceholder="Type an institution…"
				entityLabel="institutions"
				{suggestions}
			/>
		{/if}
	{/snippet}
	<NetworkGraph
		nodes={network.nodes}
		edges={network.edges}
		entityColor="sage"
		maxNodes={topN}
		highlightQuery={search}
		filename="institution-network"
		labels={{
			itemSingular: 'talk',
			itemPlural: 'Talks',
			entityNode: 'Institutions',
			cooccurrenceEdge: 'Shared event',
			cooccurrenceShared: 'Talks in common'
		}}
	/>
</VizSection>
