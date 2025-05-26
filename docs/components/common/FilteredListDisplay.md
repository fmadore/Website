# FilteredListDisplay Component

A reusable component for displaying filtered lists of items with support for empty states, item count display, and filter clearing functionality.

## Import

```svelte
import FilteredListDisplay from '$lib/components/common/FilteredListDisplay.svelte';
```

## Usage

```svelte
<script>
	import FilteredListDisplay from '$lib/components/common/FilteredListDisplay.svelte';
	import PublicationItem from '$lib/components/publications/PublicationItem.svelte';

	// Reactive store containing filtered items
	let filteredPublications = writable([
		/* items */
	]);

	// Handle events from items (like filter requests)
	function handleItemEvent(event) {
		// Add a filter based on clicked tag, etc.
	}

	function clearAllFilters() {
		// Reset filters logic
	}
</script>

<FilteredListDisplay
	filteredItems={filteredPublications}
	itemComponent={PublicationItem}
	itemPropName="publication"
	entityName="publications"
	areFiltersActive={true}
	{clearAllFilters}
	onItemEvent={handleItemEvent}
/>
```

## Props

| Prop                         | Type                                     | Default                                    | Description                                             |
| ---------------------------- | ---------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| `filteredItems`              | `Readable<any[]>`                        | _required_                                 | Svelte store containing the filtered items              |
| `itemComponent`              | `ComponentType`                          | _required_                                 | Component to render for each item                       |
| `itemComponentProps`         | `ComponentProps<any>`                    | `{}`                                       | Additional props to pass to each item component         |
| `entityName`                 | `string`                                 | `"items"`                                  | Name of entities being displayed (e.g., "publications") |
| `areFiltersActive`           | `boolean`                                | `false`                                    | Whether any filters are currently active                |
| `clearAllFilters`            | `() => void`                             | _required_                                 | Function to clear all active filters                    |
| `emptyStateMessage`          | `string`                                 | `"No items found matching your criteria."` | Message shown when no items match filters               |
| `emptyStateNoFiltersMessage` | `string`                                 | `"Try adding some items to the system."`   | Message shown when no items exist (no filters active)   |
| `itemPropName`               | `string`                                 | `"item"`                                   | The prop name used by the item component                |
| `onItemEvent`                | `((event: CustomEvent) => void) \| null` | `null`                                     | Optional handler for events from items                  |

## Events

The component itself doesn't dispatch events, but it forwards these events from item components:

- `filterrequest` - When an item element requests a filter change
- `click` - Click events from items
- `customaction` - Any custom actions from items

## Empty States

The component shows different empty states based on whether filters are active:

- With filters: Shows a message with a "Clear all filters" button
- Without filters: Shows a message indicating no items exist
