# Card Component

A versatile card component for displaying content with an optional image, title, and various content sections. Designed to be used across the site for displaying entities in a consistent format.

## Import

```svelte
import Card from '$lib/components/common/Card.svelte';
```

## Usage

### Basic Card with Image

```svelte
<Card
	title="Research Project"
	imageUrl="/images/project-photo.jpg"
	linkUrl="/projects/research-project"
>
	<p>This research project focused on exploring new methodologies...</p>
</Card>
```

### Card with Multiple Sections

```svelte
<Card
	title="Research Project"
	imageUrl="/images/project-photo.jpg"
	linkUrl="/projects/research-project"
	target="_self"
>
	<svelte:fragment slot="subtitle">2020-2022 • Collaborative Research</svelte:fragment>

	<p>This research project focused on exploring new methodologies...</p>

	<svelte:fragment slot="details">
		<div>Lead Researcher: Dr. Jane Smith</div>
		<div>Funding: National Science Foundation</div>
	</svelte:fragment>

	<svelte:fragment slot="action">
		<a href="/projects/research-project" class="btn btn-primary">Learn More</a>
	</svelte:fragment>
</Card>
```

## Props

| Prop       | Type                          | Default                    | Description                                          |
| ---------- | ----------------------------- | -------------------------- | ---------------------------------------------------- |
| `imageUrl` | `string \| undefined \| null` | `undefined`                | Optional URL for the card's image                    |
| `imageAlt` | `string`                      | `''` (falls back to title) | Alt text for the image                               |
| `linkUrl`  | `string \| undefined \| null` | `undefined`                | Optional URL to link the title and image             |
| `target`   | `string`                      | `'_blank'`                 | Target attribute for links (`_blank`, `_self`, etc.) |
| `title`    | `string`                      | `''`                       | The main title for the card                          |

## Slots

| Name       | Description                                                    |
| ---------- | -------------------------------------------------------------- |
| default    | The main content/description of the card                       |
| `subtitle` | Optional subtitle displayed below the title                    |
| `details`  | Additional details displayed below the main content            |
| `action`   | Action elements like buttons or links, displayed at the bottom |

## Styling

The card component includes several visual features:

- Subtle elevation with shadow that increases on hover
- Card slightly elevates on hover (translateY)
- Images scale slightly on hover
- Consistent spacing using CSS variables

## CSS Variables Used

The component uses these CSS variables for styling:

- `--border-radius-lg` - Border radius for the card
- `--shadow-md`, `--shadow-lg` - Shadow for normal and hover states
- `--color-background` - Background color of the card
- `--color-border` - Border color
- `--color-primary` - Color for title and links
- `--color-primary-dark` - Color for link hover state
- `--spacing-*` - Various spacing values (1, 3, 4, 6)
- `--font-size-sm`, `--font-size-xl` - Font sizes for subtitle and title
