# Atoms

Atoms are the smallest, most basic components in the design system — the building blocks of the interface that can't be broken down further without losing their meaning or functionality.

> Note: several components documented here have moved out of `src/lib/components/atoms/` into feature directories (`menu/`, `reference/`). The actual source location is listed for each.

## Documented Components

- [Button](./Button.md) — `atoms/Button.svelte` — Standard button component with variants
- [HamburgerButton](./HamburgerButton.md) — `menu/HamburgerButton.svelte` — Button for toggling the mobile navigation menu
- [NavLink](./NavLink.md) — `menu/NavLink.svelte` — Navigation link with active state handling
- [ThemeToggle](./ThemeToggle.md) — `menu/ThemeToggle.svelte` — Toggle for switching between light (daylight) and dark (midnight) themes
- [ReferenceLink](./ReferenceLink.md) — `reference/ReferenceLink.svelte` — Citation-style reference link
- [ReferencePreviewCard](./ReferencePreviewCard.md) — `reference/ReferencePreviewCard.svelte` — Rich preview card for referenced items

Undocumented atoms in `src/lib/components/atoms/`: `NetworkStatusIndicator`, `RangeSlider`, `ToggleButton`, `TweenedCount`.

## Characteristics of Atoms

- Simple, small components that serve a single purpose
- Don't depend on other components
- Reusable across multiple contexts
- Accept props to change their appearance and behavior

## Creating New Atoms

1. Keep them simple with a focused purpose
2. Use CSS variables/design tokens for all styling (see `CLAUDE.md`)
3. Ensure they're accessible (ARIA attributes, keyboard navigation, focus states)
4. Use Svelte 5 runes: `$props()` for props, callback props (e.g. `onclick`) instead of `createEventDispatcher`, snippet props instead of slots
