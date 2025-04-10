# Components Documentation

This website follows the **Atomic Design** methodology, organizing components into a hierarchical structure that promotes reusability, consistency, and maintainability.

## Atomic Design Structure

The component library is organized into three main levels:

1. **[Atoms](./atoms/README.md)** - Basic building blocks that cannot be broken down further
2. **[Molecules](./molecules/README.md)** - Simple functional groups of atoms
   - `ItemCard` - Displays a single generic item (like a publication or communication) with meta, title, authors, and abstract.
3. **[Organisms](./organisms/README.md)** - Complex UI components composed of molecules and atoms
   - `RelevantItemsList` - Displays a titled list of items (e.g., publications, communications) relevant to a specific context (like a project), including filtering links and a "view all" link.

## Other Component Categories

In addition to the atomic design components, we have:

- **[Common](./common/README.md)** - Shared components used across multiple pages
- **[Filters](./filters/README.md)** - Components related to data filtering
- **[Publications](./publications/README.md)** - Components specific to the publications section
- **[Communications](./communications/README.md)** - Components specific to the communications section

## Component Usage Guidelines

When using or creating components:

1. **Component Placement**: Place new components in the appropriate category based on their complexity
2. **Props Documentation**: Document all props with their types, defaults, and purpose
3. **Event Handling**: Document events emitted by components and how to handle them
4. **Accessibility**: Ensure components meet accessibility standards (WCAG)
5. **Responsive Design**: All components should be responsive by default

## Component Development Workflow

When developing new components:

1. Identify the appropriate level (atom, molecule, organism)
2. Check for existing components that might fulfill the need
3. Create the new component following the established patterns
4. Document the component in the appropriate docs directory
5. Update this documentation if introducing new patterns or categories

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
- `ItemCard` - Moved to molecules (Generic display for list items)
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
├── molecules/
│   └── ItemCard.svelte
├── organisms/
│   ├── RelevantItemsList.svelte
│   ├── RelevantPublications.svelte
│   └── RelevantCommunications.svelte
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