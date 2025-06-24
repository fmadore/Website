# Sorter Component

A button component that allows users to toggle between different sorting options for lists of items.

## Import

```svelte
import Sorter from '$lib/components/common/Sorter.svelte';
```

## Usage

### Basic Usage (All Sort Options)

```svelte
<script>
	import Sorter from '$lib/components/common/Sorter.svelte';

	let currentSort = 'date';

	function handleSortChange(data) {
		const { sortBy } = data;
		currentSort = sortBy;

		// Apply sorting logic to your data
		// ...
	}
</script>

<Sorter activeSort={currentSort} onsortchange={handleSortChange} />
```

### Limited Sort Options (e.g., for Communications)

```svelte
<script>
	import Sorter from '$lib/components/common/Sorter.svelte';

	let currentSort = 'date';

	function handleSortChange(data) {
		const { sortBy } = data;
		if (sortBy === 'date' || sortBy === 'title') {
			currentSort = sortBy;
		}
	}
</script>

<Sorter 
	activeSort={currentSort} 
	onsortchange={handleSortChange} 
	availableSorts={['date', 'title']} 
/>
```

## Props

| Prop             | Type                                              | Default                            | Description                                    |
| ---------------- | ------------------------------------------------- | ---------------------------------- | ---------------------------------------------- |
| `activeSort`     | `'date' \| 'title' \| 'citations'`               | `'date'`                           | Currently active sort method                   |
| `onsortchange`   | `(data: { sortBy: string }) => void`             | `undefined`                        | Callback fired when sort option changes        |
| `availableSorts` | `('date' \| 'title' \| 'citations')[]`           | `['date', 'title', 'citations']`   | Array of available sort options to cycle through |

## Events

The component uses Svelte 5 callback props instead of events:

- `onsortchange` - Called with `{ sortBy: 'date' | 'title' | 'citations' }` when the user clicks to change sort order

## Visual Indicators

The component provides clear visual feedback about the current sort method:

- When sorting by date: Shows a chronological icon and "Sorted by Date" text
- When sorting by title: Shows an alphabetical icon and "Sorted A-Z" text  
- When sorting by citations: Shows a trending icon and "Sorted by Citations" text

## Accessibility

- Provides descriptive `aria-label` based on current sort state and next available option
- Includes `title` attribute for tooltip information on hover
- Uses the Button atom component which ensures keyboard accessibility
- Dynamically updates accessibility text based on available sort options

## Customization

This component uses the common Button atom component with an "outline-primary" variant. It applies additional global CSS classes for styling:

- `.control-button-rounded` - Adds rounded corners
- Custom hover state styling for consistent visual feedback

## Use Cases

### Publications (All Sort Options)
For content with citation data, use all three sort options:
```svelte
<Sorter {activeSort} onsortchange={handleSortChange} />
<!-- Cycles: date → title → citations → date -->
```

### Communications/Conference Activity (Limited Options)
For content without citation data, limit to date and title:
```svelte
<Sorter {activeSort} onsortchange={handleSortChange} availableSorts={['date', 'title']} />
<!-- Cycles: date → title → date -->
```

### Custom Sort Sequence
You can define any sequence of available sorts:
```svelte
<Sorter {activeSort} onsortchange={handleSortChange} availableSorts={['title', 'date']} />
<!-- Cycles: title → date → title -->
```

## Example within a Controls Bar

```svelte
<div class="controls-bar">
	<div class="controls-left">
		<ToggleButton isToggled={showMap} baseText="Map View" onclick={() => (showMap = !showMap)} />
	</div>

	<div class="controls-right">
		<Sorter {activeSort} onsortchange={handleSortChange} availableSorts={['date', 'title']} />
	</div>
</div>
```
