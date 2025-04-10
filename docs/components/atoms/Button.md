# Button Component

The `Button` component is a versatile, customizable button element that can be rendered either as a native `<button>` element or as an anchor `<a>` tag with button styling.

## Import

```svelte
import Button from '$lib/components/atoms/Button.svelte';
```

## Usage

### Basic Button

```svelte
<Button>Click Me</Button>
```

### Button with Different Variants

```svelte
<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="outline-primary">Outline Primary</Button>
<Button variant="outline-secondary">Outline Secondary</Button>
```

### Button Sizes

```svelte
<Button size="sm">Small Button</Button>
<Button size="base">Base Button</Button>
<Button size="lg">Large Button</Button>
```

### Link Button

```svelte
<Button href="/some-path">I'm a link styled as a button</Button>
```

### Button with Icon

```svelte
<Button>
  <svelte:fragment slot="icon">
    <SomeIcon />
  </svelte:fragment>
  Button with Icon
</Button>
```

### Icon-Only Button

```svelte
<Button iconOnly={true} ariaLabel="Close dialog">
  <svelte:fragment slot="icon">
    <CloseIcon />
  </svelte:fragment>
</Button>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline-primary' \| 'outline-secondary'` | `'primary'` | Style variant of the button |
| `size` | `'sm' \| 'base' \| 'lg'` | `'base'` | Size of the button |
| `href` | `string \| undefined` | `undefined` | If provided, renders as an anchor tag |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Native button type (only for `<button>`) |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `block` | `boolean` | `false` | Whether the button should take up full width |
| `iconOnly` | `boolean` | `false` | For icon-only buttons (adjusts padding) |
| `ariaLabel` | `string \| undefined` | `undefined` | Accessibility label, required for icon-only buttons |

## Slots

| Slot | Description |
|------|-------------|
| default | Main content of the button |
| icon | Optional icon to display inside the button |

## Events

| Event | Description |
|-------|-------------|
| `click` | Fired when the button is clicked (not fired if disabled) |

## CSS Variables

The button uses these CSS variables for styling:

- `--color-text`
- `--spacing-1`
- `--spacing-2`
- `--spacing-3`
- `--spacing-4`

## Accessibility

- Renders as a semantically correct button or link based on usage
- Enforces proper `aria-label` for icon-only buttons
- Ensures disabled links have correct styling and interaction behavior
- Supports all standard keyboard interactions (`Enter`, `Space` for activation)

## Examples

### Form Submit Button

```svelte
<form on:submit={handleSubmit}>
  <!-- form fields -->
  <Button type="submit" variant="primary">Submit</Button>
</form>
```

### Block-Level Button

```svelte
<div class="container">
  <Button block={true} variant="secondary">Full Width Button</Button>
</div>
```