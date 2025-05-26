# FilteredListDisplay

A flexible component for displaying filtered lists of items with empty states and event handling.

## Usage

```svelte
<script>
	import FilteredListDisplay from '$lib/components/common/FilteredListDisplay.svelte';
	import PublicationItem from '$lib/components/publications/PublicationItem.svelte';
	import {
		filteredPublications,
		areFiltersActive,
		clearAllFilters
	} from '$lib/data/publications/filters';

	function handleItemEvent(event) {
		if (event.type === 'filterrequest') {
			// Handle filter request
		}
	}
</script>

<FilteredListDisplay
	filteredItems={filteredPublications}
	itemComponent={PublicationItem}
	itemPropName="publication"
	entityName="publications"
	areFiltersActive={$areFiltersActive}
	{clearAllFilters}
	onItemEvent={handleItemEvent}
/>
```

## Props

| Prop                         | Type                                     | Default                                    | Description                                                        |
| ---------------------------- | ---------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| `filteredItems`              | `Readable<any[]>`                        | _Required_                                 | Store of filtered items to display                                 |
| `itemComponent`              | `ComponentType`                          | _Required_                                 | Component to render each item                                      |
| `itemComponentProps`         | `ComponentProps<any>`                    | `{}`                                       | Additional props to pass to each item component                    |
| `entityName`                 | `string`                                 | `"items"`                                  | Customizable name of entities (e.g., "publications", "activities") |
| `areFiltersActive`           | `boolean`                                | `false`                                    | Whether filters are currently active                               |
| `clearAllFilters`            | `() => void`                             | _Required_                                 | Function to clear all filters                                      |
| `emptyStateMessage`          | `string`                                 | `"No items found matching your criteria."` | Message for empty state when filters are active                    |
| `emptyStateNoFiltersMessage` | `string`                                 | `"Try adding some items to the system."`   | Message when no filters but still empty                            |
| `itemPropName`               | `string`                                 | `"item"`                                   | The prop name used by the item component (e.g., "publication")     |
| `onItemEvent`                | `((event: CustomEvent) => void) \| null` | `null`                                     | Optional event handler for item events                             |

## Events

The component doesn't emit events directly, but handles events from child item components:

- `filterrequest`: When an item component requests a filter
- `click`: Click events from item components
- `customaction`: Custom actions from item components

## Example

```svelte
<FilteredListDisplay
	filteredItems={filteredPublications}
	itemComponent={PublicationItem}
	itemPropName="publication"
	entityName="academic publications"
	areFiltersActive={$areFiltersActive}
	{clearAllFilters}
	emptyStateMessage="No publications match your current filters."
	emptyStateNoFiltersMessage="No publications have been added yet."
	onItemEvent={(e) => {
		if (e.detail.type === 'tag') {
			toggleTagFilter(e.detail.value);
		} else if (e.detail.type === 'author') {
			toggleAuthorFilter(e.detail.value);
		}
	}}
/>
```
