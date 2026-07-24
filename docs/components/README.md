# Components Documentation

Documentation for a subset of the components in `src/lib/components/`. The component library loosely follows **Atomic Design** (atoms → molecules → organisms) plus shared `common/` components and feature-specific directories.

> **Note:** All components use **Svelte 5 runes** (`$props()`, `$state()`, `$derived()`, `$effect()`) and snippet/children render patterns (`{@render children?.()}`, `{#snippet ...}`), not Svelte 4 slots or `export let` props. See the repository root `CLAUDE.md` for the required patterns and styling conventions (Ink + Signal design system).

## Directory Structure

The real tree of `src/lib/components/`:

```
src/lib/components/
├── atoms/               # Basic elements (Button, ToggleButton, RangeSlider, ...)
├── molecules/           # Simple compositions (Breadcrumb, TagList, Pagination, ...)
├── organisms/           # Complex UI (RelatedItemsList)
├── common/              # Shared layout & display (Card, PageHeader, EntityListPageLayout, ...)
├── entity-index/        # Entity index facets and filter bar
├── activities/          # Activities feature components
├── communications/      # Communications feature components
├── cv/                  # CV feature components
├── digital-humanities/  # Digital humanities feature components
├── media/               # Media feature components
├── menu/                # Header, navigation, theme toggle
├── panels/              # Panel components
├── publications/        # Publications feature components
├── reference/           # Citation references (ItemReference, ReferenceLink, ...)
├── research/            # Research feature components
└── visualisations/      # ECharts/D3/MapLibre visualisation components
```

## Documented Components

Several documented components now live outside the folder their doc sits in; the actual source location is given for each.

### Atoms (`docs/components/atoms/`)

- [Button](./atoms/Button.md) — `atoms/Button.svelte`
- [HamburgerButton](./atoms/HamburgerButton.md) — `menu/HamburgerButton.svelte`
- [NavLink](./atoms/NavLink.md) — `menu/NavLink.svelte`
- [ThemeToggle](./atoms/ThemeToggle.md) — `menu/ThemeToggle.svelte`
- [ReferenceLink](./atoms/ReferenceLink.md) — `reference/ReferenceLink.svelte`
- [ReferencePreviewCard](./atoms/ReferencePreviewCard.md) — `reference/ReferencePreviewCard.svelte`

### Molecules (`docs/components/molecules/`)

- [Breadcrumb](./molecules/Breadcrumb.md) — `molecules/Breadcrumb.svelte`
- [ItemReference](./molecules/ItemReference.md) — `reference/ItemReference.svelte`
- [DesktopNav](./molecules/DesktopNav.md) — `menu/DesktopNav.svelte`
- [MobileMenu](./molecules/MobileMenu.md) — `menu/MobileMenu.svelte`
- [DropdownMenu](./molecules/DropdownMenu.md) — `menu/DropdownMenu.svelte`
- [NavItemWithDropdown](./molecules/NavItemWithDropdown.md) — `menu/NavItemWithDropdown.svelte`

### Organisms (`docs/components/organisms/`)

- [Header](./organisms/Header.md) — `menu/Header.svelte`

### Common (`docs/components/common/`)

- [Card](./common/Card.md) — `common/Card.svelte`
- [EntityListPageLayout](./common/EntityListPageLayout.md) — `common/EntityListPageLayout.svelte`
- [FilteredListDisplay](./common/FilteredListDisplay.md) — `common/FilteredListDisplay.svelte`
- [PageHeader](./common/PageHeader.md) — `common/PageHeader.svelte`

## Component Usage Guidelines

1. **Component placement**: Put new components in the directory matching their role (atomic level, `common/`, or the relevant feature directory)
2. **Svelte 5 only**: Use runes and snippet props; never legacy reactive syntax, slots, or `createEventDispatcher`
3. **Styling**: Use CSS variables/design tokens only; flat print register (no shadows, glass, gradients, or rounded corners) — see `CLAUDE.md`
4. **Accessibility**: Components must meet WCAG standards (ARIA attributes, keyboard navigation, focus states)
5. **Docs**: The typed `Props` interface in each `.svelte` file is the source of truth — these pages are a curated, hand-maintained subset. When a documented component's props change, update its doc file here or delete it
