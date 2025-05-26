# PageHeader Component

A consistent header component for pages, supporting titles, navigation links, metadata, and tags.

## Import

```svelte
import PageHeader from '$lib/components/common/PageHeader.svelte';
```

## Usage

### Basic Header

```svelte
<PageHeader title="Publications" />
```

### Detailed Header for Entity Pages

```svelte
<PageHeader
	title="The Impact of Climate Change on West African Agriculture"
	backLinkHref="publications"
	backLinkLabel="← Back to Publications"
	date="2023-05-12"
	typeBadgeText="Journal Article"
	authors={['Jane Smith', 'John Doe', 'Sarah Johnson']}
	tags={['Climate Change', 'Agriculture', 'West Africa']}
/>
```

### With Editors (for Books/Special Issues)

```svelte
<PageHeader
	title="Special Issue: African Studies"
	typeBadgeText="Special Issue"
	date="2022"
	editors={['Michael Brown', 'Lisa Chen']}
/>
```

## Props

| Prop            | Type                              | Default     | Description                          |
| --------------- | --------------------------------- | ----------- | ------------------------------------ |
| `title`         | `string`                          | _required_  | Main page title                      |
| `backLinkHref`  | `string \| undefined`             | `undefined` | Path for the back link (if needed)   |
| `backLinkLabel` | `string`                          | `'← Back'`  | Text for the back link               |
| `date`          | `string \| undefined`             | `undefined` | Publication or creation date         |
| `tags`          | `string[] \| undefined`           | `undefined` | Array of tags/keywords               |
| `typeBadgeText` | `string \| undefined`             | `undefined` | Type label (e.g., "Journal Article") |
| `authors`       | `string[] \| undefined`           | `undefined` | Array of author names                |
| `editors`       | `string \| string[] \| undefined` | `undefined` | Editor(s) for edited works           |

## Features

- Back navigation link with customizable text
- Type badge for indicating content type (article, book, etc.)
- Publication date display
- Author list with proper formatting
- Editor list with proper formatting ("Edited by X" or "Edited by X and Y")
- Tag list using the TagList component

## Layout

The component has a consistent vertical layout:

1. Back link (if provided)
2. Type badge and date (on same line)
3. Title
4. Authors
5. Editors (if provided)
6. Tags (if provided)

## CSS Variables Used

The component uses these CSS variables for styling:

- `--color-primary` - Color for back link and page title
- `--color-primary-light`, `--color-primary-dark` - Colors for the type badge
- `--color-text` - Main text color for title and authors
- `--color-text-muted` - Color for the date
- `--font-size-xs`, `--font-size-sm`, `--font-size-base` - Font sizes
- `--border-radius-full` - Border radius for the type badge
