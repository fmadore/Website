# Sorter Component

A button component that allows users to toggle between different sorting options for lists of items.

## Import

```svelte
import Sorter from '$lib/components/common/Sorter.svelte';
```

## Usage

```svelte
<script>
	import Sorter from '$lib/components/common/Sorter.svelte';

	let currentSort = 'date';

	function handleSortChange(event) {
		const { sortBy } = event.detail;
		currentSort = sortBy;

		// Apply sorting logic to your data
		// ...
	}
</script>

<Sorter activeSort={currentSort} on:sortChange={handleSortChange} />
```

## Props

| Prop         | Type                | Default  | Description                  |
| ------------ | ------------------- | -------- | ---------------------------- |
| `activeSort` | `'date' \| 'title'` | `'date'` | Currently active sort method |

## Events

| Event        | Detail                          | Description                                                |
| ------------ | ------------------------------- | ---------------------------------------------------------- |
| `sortChange` | `{ sortBy: 'date' \| 'title' }` | Fired when the user clicks the button to change sort order |

## Visual Indicators

The component provides clear visual feedback about the current sort method:

- When sorting by date: Shows a calendar/chronological icon and "Sorted by Date" text
- When sorting by title: Shows an alphabetical icon and "Sorted A-Z" text

## Accessibility

- Provides descriptive `aria-label` based on current sort state
- Includes `title` attribute for tooltip information on hover
- Uses the Button atom component which ensures keyboard accessibility

## Customization

This component uses the common Button atom component with an "outline-primary" variant. It applies additional global CSS classes for styling:

- `.control-button-rounded` - Adds rounded corners
- Custom hover state styling for consistent visual feedback

## Example within a Controls Bar

```svelte
<div class="controls-bar">
	<div class="controls-left">
		<ToggleButton isToggled={showMap} baseText="Map View" on:toggle={() => (showMap = !showMap)} />
	</div>

	<div class="controls-right">
		<Sorter activeSort={currentSort} on:sortChange={handleSortChange} />
	</div>
</div>
```
