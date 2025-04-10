# ThemeToggle Component

A toggle button component that switches between light and dark themes. It displays different icons based on the current theme.

## Import

```svelte
import ThemeToggle from '$lib/components/atoms/ThemeToggle.svelte';
```

## Usage

### Basic Usage

```svelte
<ThemeToggle />
```

### With Custom Size

```svelte
<ThemeToggle size={24} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | `20` | Size of the icon in pixels |

## Functionality

The component:
- Reads the current theme from the Svelte store (`$theme`)
- Calls `toggleTheme()` when clicked to switch between light and dark modes
- Displays a Moon icon in light mode and a Sun icon in dark mode
- Uses the Lucide SVG icon library

## Stores

The component uses the following Svelte stores:
- `theme` - A readable store with the current theme value ('light' or 'dark')
- `toggleTheme` - A function to toggle between light and dark themes

## Accessibility

- Has dynamic `aria-label` that changes based on the current theme
- Uses proper button semantics for keyboard navigation

## Example

```svelte
<script>
  import ThemeToggle from '$lib/components/atoms/ThemeToggle.svelte';
</script>

<header>
  <div class="logo">Site Logo</div>
  <nav><!-- Navigation content --></nav>
  <ThemeToggle size={22} />
</header>
```

## CSS Variables

The component uses these CSS variables for styling:
- `--color-text` - Color of the icon
- `--color-border` - Color of button background on hover
- `--spacing-1` - Internal padding