# DesktopNav Component

A navigation component designed for desktop displays that renders a horizontal navigation bar with support for dropdown menus. This component orchestrates navigation item interactions and dropdown behavior.

## Import

```svelte
import DesktopNav from '$lib/components/molecules/DesktopNav.svelte';
```

## Usage

```svelte
<DesktopNav
	navItems={navigationItems}
	activeDropdown={activeDropdownIndex}
	onMouseEnter={handleMouseEnter}
	onMouseLeave={handleMouseLeave}
	onFocusIn={handleFocusIn}
	onFocusOut={handleFocusOut}
	onKeyDown={handleKeyDown}
	onDropdownItemClick={handleDropdownItemClick}
/>
```

## Props

| Prop                  | Type                                            | Default    | Description                                         |
| --------------------- | ----------------------------------------------- | ---------- | --------------------------------------------------- |
| `navItems`            | `NavItem[]`                                     | _required_ | Array of navigation items to display                |
| `activeDropdown`      | `number \| null`                                | `null`     | Index of the currently active dropdown menu, if any |
| `onMouseEnter`        | `(index: number) => void`                       | _required_ | Handler for mouse enter on nav items                |
| `onMouseLeave`        | `() => void`                                    | _required_ | Handler for mouse leave from nav items              |
| `onFocusIn`           | `(index: number) => void`                       | _required_ | Handler for focus on nav items                      |
| `onFocusOut`          | `() => void`                                    | _required_ | Handler for focus leaving nav items                 |
| `onKeyDown`           | `(event: KeyboardEvent, index: number) => void` | _required_ | Handler for keyboard events                         |
| `onDropdownItemClick` | `() => void`                                    | _required_ | Handler for clicks on dropdown menu items           |

## Type Definitions

```typescript
interface NavItem {
	name: string;
	path: string;
	dropdown?: NavItem[];
}
```

## Component Composition

This component uses:

- `NavItemWithDropdown` molecule - For each navigation item in the list

## Responsive Behavior

- By default, the component is hidden on mobile screens
- Becomes visible at the 1024px (lg) breakpoint
- Adjusts spacing between nav items at larger screen sizes

## Example

```svelte
<script lang="ts">
	import { base } from '$app/paths';
	import type { NavItem } from '$lib/types/navigation';
	import DesktopNav from '$lib/components/molecules/DesktopNav.svelte';

	// Navigation items data
	const navItems: NavItem[] = [
		{ name: 'Home', path: `${base}/` },
		{
			name: 'Services',
			path: `${base}/services`,
			dropdown: [
				{ name: 'Consulting', path: `${base}/services/consulting` },
				{ name: 'Development', path: `${base}/services/development` }
			]
		},
		{ name: 'About', path: `${base}/about` },
		{ name: 'Contact', path: `${base}/contact` }
	];

	let activeDropdown: number | null = null;

	function showDropdown(index: number) {
		activeDropdown = index;
	}

	function hideDropdown() {
		activeDropdown = null;
	}

	function handleKeyDown(event: KeyboardEvent, index: number) {
		if (event.key === 'Escape') {
			activeDropdown = null;
		}
	}
</script>

<header>
	<div class="logo">Site Logo</div>

	<DesktopNav
		{navItems}
		{activeDropdown}
		onMouseEnter={showDropdown}
		onMouseLeave={hideDropdown}
		onFocusIn={showDropdown}
		onFocusOut={hideDropdown}
		onKeyDown={handleKeyDown}
		onDropdownItemClick={() => (activeDropdown = null)}
	/>

	<div class="actions">
		<!-- Other header actions -->
	</div>
</header>
```

## Accessibility

- Includes proper `aria-label="Main navigation"` for screen readers
- Delegates keyboard navigation and focus management to child components
- Follows standard navigation patterns for familiarity
