# Organisms

Organisms are complex UI components that combine multiple molecules and atoms to create distinct sections of a user interface.

## Documented Components

- [Header](./Header.md) — `menu/Header.svelte` — Site header with responsive navigation (lives in `src/lib/components/menu/`, not `organisms/`)

The only component currently in `src/lib/components/organisms/` is `RelatedItemsList.svelte` (undocumented), which renders a titled list of items related to the current context.

## Characteristics of Organisms

- Complex components that can contain multiple molecules and atoms
- Represent distinct sections of the interface (headers, footers, sidebars, ...)
- Typically specific to the application's domain
- May manage complex state and interactions between child components

## Creating New Organisms

1. Identify a distinct section of the UI that serves a specific purpose
2. Break the section down into its constituent molecules and atoms
3. Use Svelte 5 runes for state (`$state()`, `$derived()`, `$effect()`) and callback/snippet props for the component interface
4. Document how the organism integrates with the overall page layout
