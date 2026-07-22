# Molecules

Molecules are relatively simple combinations of atoms that form functional groups in the design system.

> Note: several components documented here have moved out of `src/lib/components/molecules/` into feature directories (`menu/`, `reference/`). The actual source location is listed for each.

## Documented Components

- [Breadcrumb](./Breadcrumb.md) — `molecules/Breadcrumb.svelte` — Navigation breadcrumb showing the current location
- [ItemReference](./ItemReference.md) — `reference/ItemReference.svelte` — Citation-style reference that shows a preview card on hover/focus
- [DesktopNav](./DesktopNav.md) — `menu/DesktopNav.svelte` — Main navigation for desktop viewport sizes
- [MobileMenu](./MobileMenu.md) — `menu/MobileMenu.svelte` — Responsive mobile navigation menu
- [DropdownMenu](./DropdownMenu.md) — `menu/DropdownMenu.svelte` — Dropdown menu component
- [NavItemWithDropdown](./NavItemWithDropdown.md) — `menu/NavItemWithDropdown.svelte` — Navigation item with dropdown functionality

Undocumented molecules in `src/lib/components/molecules/`: `AbstractSection`, `ActionLinks`, `BibliographyRow`, `DetailsGrid`, `HeroImageDisplay`, `IframeRenderer`, `Pagination`, `RelatedItemCard`, `TagCloud`, `TagList`.

## Characteristics of Molecules

- Composed of multiple atoms
- Serve a specific UI function
- Reusable in different contexts
- Can have their own state and interaction logic
- More complex than atoms but simpler than organisms

## Creating New Molecules

1. Use atoms as building blocks whenever possible
2. Keep the molecule focused on a single responsibility
3. Use Svelte 5 runes: `$props()` with callback props for events, snippet props for composition
4. Coordinate ARIA relationships between constituent atoms; complex interactions (like dropdowns) follow WAI-ARIA design patterns
