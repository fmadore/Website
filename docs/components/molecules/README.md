# Molecules

Molecules are compound components made up of multiple atoms working together to provide more complex functionality. They form meaningful UI patterns that are reusable across the application.

## Characteristics of Molecules

- Composed of two or more atoms
- Have a single, focused purpose or functionality
- Encapsulate UI patterns that appear throughout the application
- More specific and less reusable than atoms, but still designed for reuse

## Available Molecule Components

| Component | Description | Usage |
|-----------|-------------|-------|
| [DesktopNav](./DesktopNav.md) | Desktop navigation menu with dropdown support | Main site navigation |
| [MobileMenu](./MobileMenu.md) | Mobile navigation menu with collapsible sections | Mobile navigation |
| [DropdownMenu](./DropdownMenu.md) | Dropdown menu for navigation links with submenu items | Navigation submenus |
| [NavItemWithDropdown](./NavItemWithDropdown.md) | Navigation item that includes dropdown functionality | Navigation items with submenus |

## Designing New Molecules

When creating new molecule components:

1. Identify a UI pattern that appears in multiple places
2. Break the pattern down into its atomic components
3. Compose atoms together into a cohesive molecule
4. Establish clear props and events APIs
5. Document the component thoroughly

## Implementation Details

### Component Composition Pattern

Molecules typically compose atoms through direct imports:

```svelte
<script>
  import NavLink from '$lib/components/atoms/NavLink.svelte';
  import DropdownMenu from '$lib/components/molecules/DropdownMenu.svelte';
  
  // Props, state, and event handlers
</script>

<div class="molecule-wrapper">
  <NavLink {...navLinkProps}>
    Link Text
  </NavLink>
  
  <DropdownMenu {...dropdownProps} />
</div>
```

### Event Delegation Pattern

Molecules often serve as mediators, delegating events from child atoms to parent components:

```typescript
// In a molecule component
export let onSomeAction: (data: SomeData) => void;

function handleAtomEvent(event) {
  // Process the event from the atom
  const processedData = someProcessing(event.detail);
  
  // Delegate to parent through props
  onSomeAction(processedData);
}
```

### Props API Pattern

Molecules follow a consistent props API pattern:

```typescript
// Data props (required)
export let items: Item[];

// State props (optional with defaults)
export let isActive = false;

// Event handler props (required or optional)
export let onItemClick: (item: Item) => void;
```

### Accessibility Considerations

- Molecules coordinate ARIA relationships between their constituent atoms
- Complex interactions (like dropdowns) follow WAI-ARIA design patterns
- Focus management is handled at the molecule level when needed