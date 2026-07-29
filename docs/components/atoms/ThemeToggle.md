# ThemeToggle Component

A toggle button component that switches between light and dark themes. It displays different icons based on the current theme.

## Import

```svelte
import ThemeToggle from '$lib/components/menu/ThemeToggle.svelte';
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

| Prop   | Type     | Default | Description                |
| ------ | -------- | ------- | -------------------------- |
| `size` | `number` | `18`    | Size of the icon in pixels |

## Functionality

The component:

- Reads the current theme via `getTheme()` from `$lib/stores/themeStore.svelte`
- Calls `toggleTheme()` when clicked to switch between light and dark modes
- Displays a Moon icon in light mode and a Sun icon in dark mode
- Uses Iconify (`@iconify/svelte`) for the icons

### Why both icons are always rendered

Which icon is visible is decided in CSS, from the `dark` class that the inline
script in `app.html` puts on `<html>` before first paint — **not** by an
`{#if currentTheme === 'light'}`. The store has no `localStorage` during
prerendering, so it always reports `light` on the server; a conditional would
therefore emit the light branch to every visitor, and anyone in midnight would
hydrate the other branch. That is a structural mismatch, and Svelte responds by
throwing away the server markup and re-rendering the whole header on every page
load. Keep the two icons unconditional and let CSS choose.

## Stores

The component uses `$lib/stores/themeStore.svelte`:

- `getTheme()` - Returns the current theme value ('light' or 'dark')
- `toggleTheme()` - Toggles between light and dark themes

## Accessibility

- Has dynamic `aria-label` that changes based on the current theme
- Uses proper button semantics for keyboard navigation

## Example

```svelte
<script>
	import ThemeToggle from '$lib/components/menu/ThemeToggle.svelte';
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
