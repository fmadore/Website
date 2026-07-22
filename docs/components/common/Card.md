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
	{#snippet subtitle()}2020-2022 • Collaborative Research{/snippet}

	{#snippet details()}
		<div>Lead Researcher: Dr. Jane Smith</div>
		<div>Funding: National Science Foundation</div>
	{/snippet}

	{#snippet action()}
		<a href="/projects/research-project" class="btn btn-primary">Learn More</a>
	{/snippet}

	<p>This research project focused on exploring new methodologies...</p>
</Card>
```

## Props

| Prop        | Type                          | Default                    | Description                                                    |
| ----------- | ----------------------------- | -------------------------- | -------------------------------------------------------------- |
| `imageUrl`  | `string \| undefined \| null` | `undefined`                | Optional URL for the card's image                              |
| `imageAlt`  | `string`                      | `''` (falls back to title) | Alt text for the image                                         |
| `linkUrl`   | `string \| undefined \| null` | `undefined`                | Optional URL to link the title and image                       |
| `target`    | `string`                      | `'_blank'`                 | Target attribute for links (`_blank`, `_self`, etc.)           |
| `title`     | `string`                      | `''`                       | The main title for the card                                    |
| `editorial` | `boolean`                     | `false`                    | Render as the chrome-less editorial "lead" of a featured block |

## Snippet props (Svelte 5)

| Name       | Description                                                    |
| ---------- | -------------------------------------------------------------- |
| `children` | The main content/description of the card (default content)     |
| `subtitle` | Optional subtitle displayed below the title                    |
| `details`  | Additional details displayed below the main content            |
| `action`   | Action elements like buttons or links, displayed at the bottom |

## Styling

The card follows the flat Ink + Signal print register: square corners, 1px border, no shadow or glass. All colours, spacing, and type sizes come from the design tokens in `src/styles/base/variables.css`.
