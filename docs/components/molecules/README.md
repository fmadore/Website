# Molecules

Molecules are relatively simple combinations of atoms that form functional groups in our design system.

## Available Molecules

- [ItemCard](./ItemCard.md) - Displays a single generic item (like a publication or communication) with meta, title, authors, and abstract
- [ItemReference](./ItemReference.md) - Citation-style reference that shows a preview card on hover/focus
- [MobileMenu](./MobileMenu.md) - Responsive mobile navigation menu
- [DesktopNav](./DesktopNav.md) - Main navigation for desktop viewport sizes
- [RelatedItemCard](./RelatedItemCard.md) - Displays a card for items related to the current context
- [AbstractSection](./AbstractSection.md) - Formatted display of an item's abstract
- [DetailsGrid](./DetailsGrid.md) - Grid layout for displaying item metadata
- [ActionLinks](./ActionLinks.md) - Group of action links for an item (download, share, etc.)
- [TagList](./TagList.md) - Displays a list of tags or keywords
- [HeroImageDisplay](./HeroImageDisplay.md) - Hero image with optional attribution
- ~~[Breadcrumb](./Breadcrumb.md)~~ - **Moved to common components** - Navigation breadcrumb showing the current location
- [DropdownMenu](./DropdownMenu.md) - Dropdown menu component
- [NavItemWithDropdown](./NavItemWithDropdown.md) - Navigation item with dropdown functionality

## Characteristics of Molecules

- Composed of multiple atoms
- Serve a specific UI function
- Reusable in different contexts
- Can have their own state and interaction logic
- More complex than atoms but simpler than organisms

## Creating New Molecules

When creating new molecules:

1. Use atoms as building blocks whenever possible
2. Keep the molecule focused on a single responsibility
3. Ensure it's reusable across different parts of the application
4. Document its composition and behavior thoroughly

## Usage

Import molecules directly into page components or organisms:

```svelte
<script>
	import ItemCard from '$lib/components/molecules/ItemCard.svelte';
	import ItemReference from '$lib/components/molecules/ItemReference.svelte';
</script>

<div class="publication">
	<h2>Research Paper</h2>
	<p>
		This builds on previous work <ItemReference id="pub-2021-03" /> and expands...
	</p>

	<h3>Related Publications</h3>
	<div class="related-items">
		<ItemCard item={publication1} />
		<ItemCard item={publication2} />
	</div>
</div>
```

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
	<NavLink {...navLinkProps}>Link Text</NavLink>

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
