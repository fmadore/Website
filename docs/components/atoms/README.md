# Atoms

Atoms are the basic building blocks of the UI. They are the smallest functional UI elements that cannot be broken down further without losing their meaning or functionality.

## Characteristics of Atoms

- Cannot be broken down into smaller functional components
- Highly reusable across the application
- Usually correspond to simple HTML elements with enhanced functionality
- Generally handle a single responsibility

## Available Atom Components

| Component | Description | Usage |
|-----------|-------------|-------|
| [Button](./Button.md) | Configurable button component with multiple variants | Form submissions, actions, links |
| [BreadcrumbLink](./BreadcrumbLink.md) | Specialized link element for breadcrumb navigation | Breadcrumb navigation paths |
| [HamburgerButton](./HamburgerButton.md) | Animated hamburger icon for toggling mobile navigation | Mobile navigation toggle |
| [NavLink](./NavLink.md) | Navigation link with active state and dropdown support | Navigation menus |
| [ThemeToggle](./ThemeToggle.md) | Toggle switch for light/dark theme | Theme switching |

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