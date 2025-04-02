# Component Documentation

This directory contains documentation for all reusable components in the application.

## Layout Components

- [EntityListPageLayout](./EntityListPageLayout.md) - A flexible layout component for entity list pages with sidebar and main content

## Display Components

- [FilteredListDisplay](./FilteredListDisplay.md) - A component for displaying filtered lists with empty states
- [Card](./Card.md) - A versatile card component for displaying content with image, title, and various sections (moved to common/)

## Interface Components

- ToggleButton - A simple button that toggles between two states
- MapVisualization - Displays items on an interactive map using Leaflet

## Item Components

- PublicationItem - Displays a publication with all its details
- CommunicationItem - Displays a communication/conference activity
- CitedBy - Displays works that cited a publication
- Reviews - Displays reviews of a publication

## Filter Components

- FilterSectionButtons - Displays filter options as clickable buttons (e.g., tags)
- FilterSectionCheckbox - Displays filter options as checkboxes
- FilterSectionRangeSlider - Provides a range slider for filtering by year
- FiltersSidebar (Publications) - Complete sidebar with filter sections for publications
- FiltersSidebar (Communications) - Complete sidebar with filter sections for communications

## Component Structure

```
src/lib/components/
├── common/
│   ├── EntityListPageLayout.svelte
│   ├── FilteredListDisplay.svelte
│   ├── ToggleButton.svelte
│   └── Card.svelte
├── filters/
│   ├── FilterSectionButtons.svelte
│   ├── FilterSectionCheckbox.svelte
│   └── FilterSectionRangeSlider.svelte
├── publications/
│   ├── FiltersSidebar.svelte
│   ├── PublicationItem.svelte
│   ├── Reviews.svelte
│   └── CitedBy.svelte
├── communications/
│   ├── CommunicationItem.svelte
│   ├── FiltersSidebar.svelte
│   └── MapVisualization.svelte
```

## Usage Patterns

Most components follow these usage patterns:

### List Pages

```svelte
<EntityListPageLayout title="Publications">
  <svelte:fragment slot="top-area">
    <ToggleButton ... />
  </svelte:fragment>
  
  <svelte:fragment slot="sidebar">
    <FiltersSidebar ... />
  </svelte:fragment>
  
  <FilteredListDisplay ... />
</EntityListPageLayout>
```

### Item Display

Item components can be used directly within `FilteredListDisplay`:

```svelte
<FilteredListDisplay 
  filteredItems={filteredPublications}
  itemComponent={PublicationItem}
  itemPropName="publication"
  onItemEvent={handleItemEvent}
  ...
/>
```

### Creating Custom Filter Sections

Filter sections can be composed to create custom filtering interfaces:

```svelte
<aside class="filter-sidebar">
  <FilterSectionCheckbox ... />
  <FilterSectionRangeSlider ... />
  <FilterSectionButtons ... />
</aside>
``` 