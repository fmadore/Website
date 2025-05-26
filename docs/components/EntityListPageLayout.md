# EntityListPageLayout

A flexible layout component for displaying entities in a standard page format with a sidebar and main content area.

## Usage

```svelte
<script>
	import EntityListPageLayout from '$lib/components/common/EntityListPageLayout.svelte';
</script>

<EntityListPageLayout title="Publications">
	<svelte:fragment slot="top-area">
		<!-- Optional content for top area (filters, buttons, etc.) -->
		<ToggleButton />
	</svelte:fragment>

	<svelte:fragment slot="sidebar">
		<!-- Sidebar content (usually filters) -->
		<FiltersSidebar />
	</svelte:fragment>

	<!-- Main content area -->
	<FilteredListDisplay />
</EntityListPageLayout>
```

## Props

| Prop             | Type      | Default                                   | Description                                        |
| ---------------- | --------- | ----------------------------------------- | -------------------------------------------------- |
| `title`          | `string`  | _Required_                                | The page title displayed at the top                |
| `containerClass` | `string`  | `"container mx-auto py-6"`                | CSS class for the main container                   |
| `gridClass`      | `string`  | `"grid grid-cols-1 md:grid-cols-4 gap-6"` | CSS class for the grid layout                      |
| `titleClass`     | `string`  | `"text-primary mb-6"`                     | CSS class for the title                            |
| `sidebarClass`   | `string`  | `"md:col-span-1"`                         | CSS class for the sidebar                          |
| `mainClass`      | `string`  | `"md:col-span-3"`                         | CSS class for the main content area                |
| `showTopArea`    | `boolean` | `false`                                   | Whether to show the top area for optional controls |

## Slots

| Name       | Description                                                                                |
| ---------- | ------------------------------------------------------------------------------------------ |
| `top-area` | Optional slot for content to appear at the top of the page (e.g., toggle buttons, filters) |
| `sidebar`  | Content for the sidebar (typically filter components)                                      |
| default    | Main content area (e.g., filtered list of items)                                           |

## Example

```svelte
<EntityListPageLayout
	title="Publications"
	showTopArea={true}
	gridClass="grid grid-cols-1 lg:grid-cols-5 gap-6"
	sidebarClass="lg:col-span-1"
	mainClass="lg:col-span-4"
>
	<svelte:fragment slot="top-area">
		<ToggleButton baseText="Map View" isToggled={showMap} on:toggle={() => (showMap = !showMap)} />
	</svelte:fragment>

	<svelte:fragment slot="sidebar">
		<FiltersSidebar />
	</svelte:fragment>

	{#if showMap}
		<MapVisualization markersData={mapMarkers} />
	{:else}
		<FilteredListDisplay
			filteredItems={filteredPublications}
			itemComponent={PublicationItem}
			itemPropName="publication"
			entityName="publications"
			onItemEvent={handleFilterRequest}
		/>
	{/if}
</EntityListPageLayout>
```
