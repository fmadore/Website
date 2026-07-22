# Common Components

Common components are reusable UI elements that don't fit neatly into the atomic design hierarchy but are used extensively throughout the website (`src/lib/components/common/`).

## Documented Components

| Component                                         | Description                                                                     | Usage                              |
| ------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------- |
| [Card](./Card.md)                                 | Versatile card component for displaying content with image, title, and sections | Entity displays, previews          |
| [EntityListPageLayout](./EntityListPageLayout.md) | Layout component for list pages with sidebar and content                        | Publication/communication listings |
| [FilteredListDisplay](./FilteredListDisplay.md)   | Component for displaying filtered lists with empty states                       | Data-driven listings               |
| [PageHeader](./PageHeader.md)                     | Standard page header with title, metadata, and tags                             | Detail and section pages           |

Undocumented components in `src/lib/components/common/`: `BaseMetaTags`, `ContentBody`, `Footer`, `PWAUpdatePrompt`, `PageIntro`, `ProfileBanner`, `ProjectImageBanner`, `Sorter`.

## Component Design Philosophy

1. **Consistency** — Provide consistent UI patterns across the site
2. **Flexibility** — Adaptable to different contexts through props
3. **Simplicity** — Focus on a single responsibility
4. **Accessibility** — Designed to be accessible by default

All components use Svelte 5 runes and snippet/children patterns; see the root `CLAUDE.md` for conventions.
