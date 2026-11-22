<!--
LocationMapPlate — the map plate of a visualisation page's locations section.

Draws the map once its chunk has arrived, imported only when the plate comes
within the shared 400px of the viewport (`use:inView`): MapLibre is nearly a
megabyte of JavaScript and a stack of vector tiles, for a plate a dozen
viewports down at phone width. Until then, and if the chunk never arrives,
the plate holds a `.state-note` in the box the section reserved, so the
pending, failed and drawn states all occupy the same plate.

A failed load can be retried from here. `CollaboratorLocations.loadMap` asks
again, which recovers where the browser does not remember the failure. Chromium
does: a module whose fetch failed rejects every later `import()` of the same
URL at once, without a request, and so do the chunks it depends on. Where the
second attempt fails too, the control reloads the page, which the browser
returns to the same scroll position, with the map's chunks fetched afresh.
-->
<script lang="ts">
	import { inView } from '#lib/actions/inView.ts';
	import type { CollaboratorLocations } from '#lib/utils/collaboratorLocations.svelte.ts';

	let {
		locations,
		basePath,
		itemLabel
	}: {
		locations: CollaboratorLocations;
		basePath: '/publications' | '/communications';
		/** Singular, as the map's popups count it: 'publication', 'talk'. */
		itemLabel: string;
	} = $props();

	const LocationMap = $derived(locations.map);

	async function retry() {
		await locations.loadMap();
		if (locations.mapStatus === 'error') location.reload();
	}
</script>

{#if LocationMap}
	<LocationMap
		data={locations.selected}
		precisePoints={locations.dataset === 'collaborators'}
		loadingPoints={locations.loadingPoints}
		{basePath}
		{itemLabel}
		bind:failed={locations.mapFailed}
	/>
{:else if locations.mapStatus === 'error'}
	<div class="state-note map-plate-note" role="status">
		<span class="dateline">Map unavailable</span>
		<p>The map could not be loaded. The data table below holds the same records.</p>
		<button type="button" class="mono-action" onclick={retry}>Try again</button>
	</div>
{:else}
	<div class="state-note map-plate-note" role="status" use:inView={locations.loadMap}>
		<span class="dateline">Loading map…</span>
	</div>
{/if}

<style>
	/* Fill the 500px box the section reserved, as `.map-state-note` does inside
	   LocationMap, so the three states occupy the same plate. */
	.map-plate-note {
		width: 100%;
		height: 100%;
	}
</style>
