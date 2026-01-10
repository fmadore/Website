# Sorter Component

A reusable sorting button component that cycles through different sort options with visual feedback and accessibility features. The component now features enhanced glassmorphism styling and better integration with the design system.

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

| Prop             | Type                                   | Default                          | Description                                            |
| ---------------- | -------------------------------------- | -------------------------------- | ------------------------------------------------------ |
| `activeSort`     | `'date' \| 'title' \| 'citations'`     | `'date'`                         | Currently active sort method                           |
| `onsortchange`   | `(data: { sortBy: string }) => void`   | `undefined`                      | Callback fired when sort option changes                |
| `availableSorts` | `('date' \| 'title' \| 'citations')[]` | `['date', 'title', 'citations']` | Array of available sort options to cycle through       |
| `glass`          | `boolean`                              | `true`                           | Enable glassmorphism effect for enhanced visual appeal |

## Features

- **Configurable Sort Options**: Specify which sort options are available using the `availableSorts` prop
- **Cycling Logic**: Automatically cycles through only the available sort options
- **Visual Feedback**: Shows appropriate icons and labels for each sort state
- **Accessibility**: Proper ARIA labels and titles that describe current state and next action
- **Enhanced Glassmorphism**: Modern glass effect with backdrop blur and subtle gradients
- **CSS Variables Integration**: Uses global design tokens for consistent styling
- **Dark Mode Support**: Automatic adaptation to dark theme
- **Reduced Motion Support**: Respects user preferences for reduced motion

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

## Sort States

The component displays different icons and labels based on the current sort:

- **Date**: `lucide:arrow-down-wide-narrow` icon with "Sorted by Date" label
- **Title**: `lucide:arrow-down-a-z` icon with "Sorted A-Z" label
- **Citations**: `lucide:trending-up` icon with "Sorted by Citations" label

## Styling

The component uses several CSS classes for enhanced styling:

### Primary Classes

- `.sorter-button` - Base styling with CSS variables integration
- `.glass-button` - Glassmorphism effect (when `glass={true}`)

### Features

- **CSS Variables**: Uses design tokens like `--border-radius-lg`, `--shadow-sm`, `--duration-normal`
- **Glassmorphism**: Backdrop blur with `--glass-blur-amount` and subtle gradients
- **Hover Effects**: Transform lift with `--transform-lift-sm` and enhanced shadows
- **Active States**: Scale transform with `--scale-95` for press feedback
- **Dark Mode**: Automatic color scheme adaptation
- **Accessibility**: Respects `prefers-reduced-motion` setting

## Integration with Pages

### Publications Page

Uses all three sort options since publications have citation data:

```svelte
<Sorter
	{activeSort}
	onsortchange={handleSortChange}
	availableSorts={['date', 'title', 'citations']}
/>
```

### Conference Activity Page

Uses only date and title since communications don't have citation data:

```svelte
<Sorter {activeSort} onsortchange={handleSortChange} availableSorts={['date', 'title']} />
```

## Accessibility Features

- **ARIA Labels**: Dynamic labels that describe current state and next action
- **Keyboard Navigation**: Full keyboard support through Button component
- **Screen Reader Support**: Clear descriptions of sorting state changes
- **Focus Management**: Visible focus indicators with proper contrast
- **Reduced Motion**: Animations disabled when user prefers reduced motion

## Technical Notes

- Built on top of the `Button` component for consistent styling and behavior
- Uses Svelte 5 syntax with `$props()` and `$derived()`
- Integrates with the global CSS design system
- Supports both light and dark themes
- Optimized for performance with efficient reactivity
