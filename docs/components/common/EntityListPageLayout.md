# EntityListPageLayout Component

A layout component for pages that display lists of entities (such as publications or communications) with a sidebar for filters and a main content area.

## Import

```svelte
import EntityListPageLayout from '$lib/components/common/EntityListPageLayout.svelte';
```

## Usage

```svelte
<EntityListPageLayout>
	{#snippet sidebar()}
		<!-- Sidebar content (typically filters) -->
	{/snippet}

	<FilteredListDisplay
		filteredItems={$filteredItems}
		itemComponent={PublicationItem}
		itemPropName="publication"
		areFiltersActive={$activeFilters.size > 0}
		{clearAllFilters}
	/>
</EntityListPageLayout>
```

## Props

| Prop             | Type     | Default                                   | Description                       |
| ---------------- | -------- | ----------------------------------------- | --------------------------------- |
| `containerClass` | `string` | `"container mx-auto py-6"`                | CSS class for the outer container |
| `gridClass`      | `string` | `"grid grid-cols-1 lg:grid-cols-4 gap-6"` | CSS class for the grid layout     |
| `sidebarClass`   | `string` | `"lg:col-span-1"`                         | CSS class for the sidebar column  |

## Snippet props (Svelte 5)

| Name       | Description                                                   |
| ---------- | ------------------------------------------------------------- |
| `children` | Content for the main content area (typically a list of items) |
| `sidebar`  | Content for the sidebar (typically filters)                   |

## Layout Structure

The component creates a responsive grid layout:

- On mobile: Single column with sidebar above content
- On desktop: 4-column grid with sidebar taking 1 column and content taking 3 columns

## Customization

The default classes use utility-first CSS, but you can provide custom classes to match your design system:

```svelte
<EntityListPageLayout
	containerClass="max-w-screen-xl mx-auto px-4 py-8"
	gridClass="flex flex-col lg:flex-row gap-8"
	sidebarClass="lg:w-1/4"
>
	<!-- Content here -->
</EntityListPageLayout>
```
