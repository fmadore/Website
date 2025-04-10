# DropdownMenu Component

A dropdown menu component that displays a list of navigation items in a styled popup. It's designed to work with navigation items that have submenu options.

## Import

```svelte
import DropdownMenu from '$lib/components/molecules/DropdownMenu.svelte';
```

## Usage

```svelte
<DropdownMenu 
  items={dropdownItems} 
  isActive={showDropdown}
  parentName="Research"
  onItemClick={handleItemClick}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `NavItem[]` | *required* | Array of navigation items to display in the dropdown |
| `isActive` | `boolean` | `false` | Controls whether the dropdown is visible |
| `parentName` | `string` | `''` | Name of the parent menu item for accessibility |
| `onItemClick` | `() => void` | `() => {}` | Function called when a dropdown item is clicked |

## Type Definitions

```typescript
interface NavItem {
  name: string;
  path: string;
  dropdown?: NavItem[]; // Not used in this component, but part of the NavItem type
}
```

## Accessibility

- Uses appropriate ARIA attributes (`role="menu"`, `role="menuitem"`, etc.)
- Provides an accessible name through `aria-label="${parentName} submenu"`
- Is keyboard navigable

## Animation and Positioning

- Animated entry/exit transitions
- Positioned centered below the parent menu item
- Includes a decorative arrow pointing to the parent item
- Responsive width with maximum constraints

## Example

```svelte
<script>
  import { base } from '$app/paths';
  import DropdownMenu from '$lib/components/molecules/DropdownMenu.svelte';
  
  // Navigation dropdown items
  const researchItems = [
    { name: 'Current Research', path: `${base}/research/current` },
    { name: 'Past Projects', path: `${base}/research/past` },
    { name: 'Collaborations', path: `${base}/research/collaborations` }
  ];
  
  let showDropdown = false;
  
  function toggleDropdown() {
    showDropdown = !showDropdown;
  }
  
  function handleItemClick() {
    showDropdown = false;
  }
</script>

<div class="nav-item">
  <button on:click={toggleDropdown}>
    Research
    <span class="caret">▾</span>
  </button>
  
  <DropdownMenu 
    items={researchItems}
    isActive={showDropdown}
    parentName="Research"
    onItemClick={handleItemClick}
  />
</div>
```

## CSS Variables

The component uses these CSS variables for styling:
- `--color-background` - Background color of the dropdown
- `--color-text` - Text color of dropdown items
- `--color-primary` - Color for hover state
- `--color-border` - Color for hover state background
- `--shadow-md` - Box shadow for the dropdown
- `--border-radius-md` - Border radius for the dropdown
- `--border-radius-sm` - Border radius for individual items
- `--spacing-2`, `--spacing-3`, `--spacing-4` - Padding and spacing
- `--font-size-sm` - Font size for dropdown items