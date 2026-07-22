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
	areFiltersActive={true}
	{clearAllFilters}
	onitemrequest={handleItemEvent}
/>
```

## Props

| Prop                         | Type                                                         | Default                                    | Description                                              |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------ | -------------------------------------------------------- |
| `filteredItems`              | `Readable<Item[]> \| Item[]`                                 | _required_                                 | Store (or plain array) of filtered items                 |
| `itemComponent`              | `ComponentType`                                              | _required_                                 | Component to render for each item                        |
| `itemComponentProps`         | `ComponentProps<any>`                                        | `{}`                                       | Additional props to pass to each item component          |
| `areFiltersActive`           | `boolean`                                                    | `false`                                    | Whether any filters are currently active                 |
| `clearAllFilters`            | `() => void`                                                 | _required_                                 | Function to clear all active filters                     |
| `emptyStateMessage`          | `string`                                                     | `"No items found matching your criteria."` | Message shown when no items match filters                |
| `emptyStateNoFiltersMessage` | `string`                                                     | `"Try adding some items to the system."`   | Message shown when no items exist (no filters active)    |
| `itemPropName`               | `string`                                                     | `"item"`                                   | The prop name used by the item component                 |
| `onitemrequest`              | `((event: { type: string; value: string }) => void) \| null` | `null`                                     | Optional handler for item events (e.g., filter requests) |

## Item events

Item components receive an `onitemrequest` callback (when provided) so they can request actions such as adding a filter for a clicked tag.

## Empty States

The component shows different empty states based on whether filters are active:

- With filters: Shows a message with a "Clear all filters" button
- Without filters: Shows a message indicating no items exist
