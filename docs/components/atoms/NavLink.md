# NavLink Component

A specialized navigation link component that supports active states and dropdown indicators, commonly used within navigation menus.

## Import

```svelte
import NavLink from '$lib/components/atoms/NavLink.svelte';
```

## Usage

### Basic Navigation Link

```svelte
<NavLink href="/some-page">Page Name</NavLink>
```

### Active Navigation Link

```svelte
<NavLink href="/current-page" active={true}>Current Page</NavLink>
```

### Navigation Link with Dropdown Indicator

```svelte
<NavLink href="/section" hasDropdown={true}>Section with Submenu</NavLink>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | *required* | The URL the link points to |
| `active` | `boolean` | `false` | Whether this link represents the current page |
| `hasDropdown` | `boolean` | `false` | Whether this link has an associated dropdown menu |

## Slots

| Slot | Description |
|------|-------------|
| default | Content of the navigation link (typically text) |

## Events

| Event | Description |
|-------|-------------|
| `click` | Forwarded from the underlying `<a>` element |
| `keydown` | Forwarded from the underlying `<a>` element |

## Styling

The component includes several CSS features:
- Animated underline effect on hover
- Dropdown caret icon when `hasDropdown` is true
- Color changes on hover/active states
- Touch-specific behavior for mobile devices

## Accessibility

- Uses `aria-haspopup="true"` when `hasDropdown` is true
- Can receive additional ARIA attributes through `$$restProps` 

## Example

```svelte
<nav>
  <ul>
    <li>
      <NavLink 
        href="/home" 
        active={$page.url.pathname === '/home'}
      >
        Home
      </NavLink>
    </li>
    <li>
      <NavLink 
        href="/products" 
        hasDropdown={true}
        on:keydown={(e) => handleKeyDown(e, 'products')}
      >
        Products
      </NavLink>
      <!-- Dropdown implementation -->
    </li>
  </ul>
</nav>
```

## CSS Variables

The component uses these CSS variables for styling:
- `--color-text` - Default text color
- `--color-primary` - Color for hover/active states
- `--spacing-2` - Padding for the link