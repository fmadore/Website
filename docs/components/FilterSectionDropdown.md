# FilterSectionDropdown Component

A reusable dropdown filter component for categories with long lists of values, built with Svelte 5 and integrated with the global CSS design system.

## Overview

The `FilterSectionDropdown` component provides a space-efficient way to handle filters with many options. It features:

- **Dropdown menu** with multi-select capability
- **Search functionality** (automatically shown when items exceed threshold)
- **Item counts** display
- **Active selection indicator** in the trigger button
- **Clear selection** button
- **Keyboard navigation** (Escape to close)
- **Click outside** to close
- **Glassmorphism effects** matching the design system
- **Dark mode support**
- **Accessibility features** with proper ARIA labels

## Usage

### Basic Example

```svelte
<script>
	import FilterSectionDropdown from '$lib/components/molecules/filters/FilterSectionDropdown.svelte';
	import { toggleAuthorFilter, authorCounts } from '$lib/data/publications/filters.svelte';

	let activeAuthors = $state(['Author One', 'Author Two']);
	let allAuthors = ['Author One', 'Author Two', 'Author Three', /* ... many more */];
</script>

<FilterSectionDropdown
	title="Authors"
	items={allAuthors}
	activeItems={activeAuthors}
	toggleItem={toggleAuthorFilter}
	counts={authorCounts}
/>
```

### With Custom Labels

```svelte
<FilterSectionDropdown
	title="Publication Types"
	items={['book', 'article', 'chapter']}
	itemLabels={{
		book: 'Books',
		article: 'Journal Articles',
		chapter: 'Book Chapters'
	}}
	activeItems={activeTypes}
	toggleItem={toggleTypeFilter}
	counts={typeCounts}
/>
```

### With Custom Settings

```svelte
<FilterSectionDropdown
	title="Countries"
	items={countries}
	activeItems={activeCountries}
	toggleItem={toggleCountryFilter}
	counts={countryCounts}
	placeholder="Select countries..."
	searchThreshold={5}
	maxHeight="300px"
/>
```

### In UniversalFiltersSidebar Config

```typescript
const filterConfig = $derived({
	sections: [
		{
			type: 'dropdown',
			title: 'Authors',
			items: $filterOptions.authors,
			activeItems: $activeFilters.authors,
			toggleItem: toggleAuthorFilter,
			counts: $authorCounts,
			placeholder: 'Select authors...',
			searchThreshold: 10
		} as DropdownFilterOption<string>,
		// ... other sections
	],
	clearAllFilters: clearAllFilters
});
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | Required | Section title displayed above the dropdown |
| `items` | `string[]` | Required | Array of all available filter items |
| `activeItems` | `string[]` | Required | Array of currently selected items |
| `toggleItem` | `(item: string) => void` | Required | Function to toggle an item's selection |
| `counts` | `{ [key: string]: number }` | `undefined` | Optional count for each item |
| `itemLabels` | `{ [key: string]: string }` | `undefined` | Optional display labels for items |
| `placeholder` | `string` | `'Select...'` | Placeholder text when nothing is selected |
| `searchThreshold` | `number` | `8` | Minimum items to show search functionality |
| `maxHeight` | `string` | `'400px'` | Maximum height of the dropdown menu |

## Features

### Multi-Select Behavior

- Click items to toggle selection
- Checkboxes indicate selected state
- Dropdown remains open during selection for easier multi-select
- Active count badge shows number of selections

### Search Functionality

- Automatically appears when items exceed `searchThreshold`
- Real-time filtering as you type
- Clear button to reset search
- Auto-focuses when dropdown opens

### Display Text

The trigger button shows:
- Placeholder text when nothing is selected
- Single item name when one item is selected
- "X selected" when multiple items are selected

### Accessibility

- Proper keyboard navigation
- Escape key closes dropdown
- Click outside closes dropdown
- Focus management for search input
- ARIA labels for screen readers

## Styling

The component uses CSS variables from the global design system:

- Spacing: `var(--spacing-*)` scale
- Colors: `var(--color-*)` palette
- Typography: `var(--font-*)` system
- Borders: `var(--border-radius-*)`, `var(--border-width-*)`
- Shadows: `var(--shadow-*)`
- Transitions: `var(--anim-duration-*)`, `var(--anim-ease-*)`
- Opacity: `var(--opacity-*)`

### Glassmorphism

The dropdown inherits the glassmorphism effects from the design system:
- Backdrop blur filters
- Semi-transparent backgrounds
- Subtle gradient overlays
- Soft shadows

### Dark Mode

Full dark mode support with automatic theme switching:
- Adjusted backgrounds and borders
- Enhanced contrast for readability
- Consistent glassmorphism effects

## When to Use

Use `FilterSectionDropdown` when:

- You have **many filter options** (>10 items)
- Screen space is limited
- Users typically select a few items from many
- You want a compact, professional appearance

Use `FilterSectionChips` or `FilterSectionCheckbox` when:

- You have fewer options (<10 items)
- All options should be visible at once
- Screen space is not a constraint
- Quick visual scanning of options is important

## Performance

The component is optimized for performance:

- Efficient reactivity with Svelte 5 runes (`$state`, `$derived`)
- Smart event listener management (auto-cleanup)
- Smooth animations with CSS transitions
- Virtual scrolling ready (for extremely long lists)

## Browser Support

Modern browsers with support for:
- CSS custom properties
- Backdrop filter (with graceful fallback)
- ES6+ JavaScript
- Flexbox

Respects user preferences:
- `prefers-reduced-motion` for animations
- High contrast mode adaptations
