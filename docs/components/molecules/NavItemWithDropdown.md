# NavItemWithDropdown Component

A navigation item component that combines a link with dropdown menu functionality. It integrates the `NavLink` atom and the `DropdownMenu` molecule to create a complete dropdown navigation item.

## Import

```svelte
import NavItemWithDropdown from '$lib/components/molecules/NavItemWithDropdown.svelte';
```

## Usage

```svelte
<NavItemWithDropdown 
  item={navItem}
  isActive={activeDropdown === index}
  index={index}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
  onFocusIn={handleFocusIn}
  onFocusOut={handleFocusOut}
  onKeyDown={handleKeyDown}
  onDropdownItemClick={handleDropdownItemClick}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `item` | `NavItem` | *required* | The navigation item data including name, path and dropdown items |
| `isActive` | `boolean` | `false` | Whether the dropdown menu is currently active/visible |
| `index` | `number` | *required* | The index of this item in the navigation array (for identification) |
| `onMouseEnter` | `(index: number) => void` | *required* | Handler for mouse enter event |
| `onMouseLeave` | `() => void` | *required* | Handler for mouse leave event |
| `onFocusIn` | `(index: number) => void` | *required* | Handler for focus in event |
| `onFocusOut` | `() => void` | *required* | Handler for focus out event |
| `onKeyDown` | `(event: KeyboardEvent, index: number) => void` | *required* | Handler for keyboard events |
| `onDropdownItemClick` | `() => void` | *required* | Handler for when an item in the dropdown is clicked |

## Type Definitions

```typescript
interface NavItem {
  name: string;
  path: string;
  dropdown?: NavItem[];
}
```

## Component Composition

This component combines:
- `NavLink` atom - For the main navigation link
- `DropdownMenu` molecule - For the dropdown content

## Mouse and Keyboard Interaction

The component handles multiple interaction patterns:
- Hover interaction (mouse enter/leave)
- Focus interaction (focus in/out)
- Keyboard navigation (via onKeyDown)

## Special Styling

- Features a visual buffer zone (`::after` pseudo-element) below the nav item to prevent dropdown from closing when moving mouse to dropdown
- Implements rotation of dropdown icon when dropdown is active

## Example

```svelte
<script lang="ts">
  import type { NavItem } from '$lib/types/navigation';
  import NavItemWithDropdown from '$lib/components/molecules/NavItemWithDropdown.svelte';
  
  const navItems: NavItem[] = [
    { 
      name: 'Research', 
      path: '/research',
      dropdown: [
        { name: 'Current Projects', path: '/research/current' },
        { name: 'Publications', path: '/research/publications' }
      ] 
    },
    // Other nav items...
  ];
  
  let activeDropdown: number | null = null;
  
  function showDropdown(index: number) {
    activeDropdown = index;
  }
  
  function hideDropdown() {
    activeDropdown = null;
  }
  
  function handleKeyDown(event: KeyboardEvent, index: number) {
    // Handle keyboard interactions
  }
</script>

<ul class="nav-list">
  {#each navItems as item, i}
    <NavItemWithDropdown 
      {item}
      isActive={activeDropdown === i}
      index={i}
      onMouseEnter={showDropdown}
      onMouseLeave={hideDropdown}
      onFocusIn={showDropdown}
      onFocusOut={hideDropdown}
      onKeyDown={handleKeyDown}
      onDropdownItemClick={() => activeDropdown = null}
    />
  {/each}
</ul>
```

## Accessibility

- The component properly manages ARIA attributes across the NavLink and DropdownMenu
- Supports keyboard navigation 
- Maintains focus management between the main link and its dropdown