# Atoms

Atoms are the smallest, most basic components in our design system - they're the building blocks of the interface that can't be broken down any further without losing their meaning or functionality.

## Available Atoms

- [Button](./Button.md) - Standard button component with variants
- ~~[BreadcrumbLink](./BreadcrumbLink.md)~~ - **Moved to common components** - Individual link within a breadcrumb navigation
- [HamburgerButton](./HamburgerButton.md) - Button for toggling mobile navigation menu
- [NavLink](./NavLink.md) - Navigation link with active state handling
- [ThemeToggle](./ThemeToggle.md) - Toggle for switching between light and dark themes
- [ReferenceLink](./ReferenceLink.md) - Citation-style reference link for academic references
- [ReferencePreviewCard](./ReferencePreviewCard.md) - Rich preview card for referenced items

## Characteristics of Atoms

- They are simple, small components that serve a single purpose
- They don't depend on other components
- They can be reused across multiple contexts
- They can accept props to change their appearance and behavior
- They define basic design patterns like colors, typography, and spacing

## Creating New Atoms

When creating new atoms:

1. Keep them as simple as possible with a focused purpose
2. Use CSS variables for theming to maintain consistency
3. Ensure they're accessible
4. Document all props and usage patterns
5. Keep styling isolated

## Usage

Import atoms directly into other components:

```svelte
<script>
	import Button from '$lib/components/atoms/Button.svelte';
	import NavLink from '$lib/components/atoms/NavLink.svelte';
</script>

<div>
	<NavLink href="/home">Home</NavLink>
	<Button variant="primary">Click Me</Button>
</div>
```

## Designing New Atoms

When creating new atom components:

1. Keep them simple and focused on a single responsibility
2. Ensure they're fully accessible (keyboard navigation, screen readers)
3. Make them adaptable through props rather than creating multiple similar atoms
4. Document all props thoroughly
5. Include responsive behaviors where applicable

## Implementation Details

### Props API Pattern

Atoms follow a consistent props API pattern:

```typescript
// Common props pattern
export let variant: 'primary' | 'secondary' | 'outline' = 'primary';
export let size: 'sm' | 'base' | 'lg' = 'base';
export let disabled = false;
```

### Event Handling Pattern

Atoms typically forward events to parent components:

```typescript
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

function handleClick(event) {
	dispatch('click', { event, value: someValue });
}
```

### Accessibility Considerations

- All interactive atoms have appropriate ARIA attributes
- Focus states are visually distinct
- Color contrast meets WCAG standards
- Keyboard navigation is fully supported
