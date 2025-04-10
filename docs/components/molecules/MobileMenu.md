# MobileMenu Component

A responsive mobile navigation menu that slides in from the right side of the screen. This component provides a mobile-friendly navigation experience with collapsible sections for dropdown menus.

## Import

```svelte
import MobileMenu from '$lib/components/molecules/MobileMenu.svelte';
```

## Usage

```svelte
<MobileMenu
  navItems={navigationItems}
  isActive={mobileMenuOpen}
  onCloseMenu={closeMobileMenu}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `navItems` | `NavItem[]` | *required* | Array of navigation items to display |
| `isActive` | `boolean` | `false` | Controls whether the mobile menu is visible |
| `onCloseMenu` | `() => void` | *required* | Function called when the close button is clicked |

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
- `ThemeToggle` atom - For theme switching within the mobile menu

## Features

- Slide-in animation from right side
- Full-height menu with scrollable content
- Supports multilevel navigation (main links + dropdowns)
- Includes backdrop overlay for focusing attention on the menu
- Sticky header with theme toggle and close button

## Visual Effects

- Backdrop blur to partially obscure content behind the menu
- Animation for smooth entry/exit
- Box shadow for depth effect

## Example

```svelte
<script lang="ts">
  import { base } from '$app/paths';
  import type { NavItem } from '$lib/types/navigation';
  import MobileMenu from '$lib/components/molecules/MobileMenu.svelte';
  import HamburgerButton from '$lib/components/atoms/HamburgerButton.svelte';
  
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
  
  let mobileMenuOpen = false;
  
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    
    // Toggle body scroll blocking
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
  
  function closeMobileMenu() {
    if (mobileMenuOpen) {
      mobileMenuOpen = false;
      document.body.style.overflow = '';
    }
  }
</script>

<header>
  <div class="logo">Site Logo</div>
  
  <HamburgerButton 
    isActive={mobileMenuOpen}
    onClick={toggleMobileMenu}
  />
  
  <MobileMenu 
    {navItems}
    isActive={mobileMenuOpen}
    onCloseMenu={closeMobileMenu}
  />
</header>
```

## Accessibility

- Uses `aria-label="Mobile navigation"` for screen readers
- Close button has proper aria label
- Has appropriate focus management
- Screen reader text for the close button

## CSS Variables

The component uses these CSS variables for styling:
- `--color-background` - Background color of the menu
- `--color-text` - Text color for menu items
- `--color-primary` - Color for hover effects
- `--color-border` - Color for dividers and hover states
- `--spacing-*` - Various spacing values for padding and margins
- `--font-size-*` - Various font sizes for different elements
- `--border-radius-sm` - Border radius for the close button