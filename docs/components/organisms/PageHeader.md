# PageHeader Component

The `PageHeader` component is a complex organism that combines multiple elements to create a consistent and informative page header. It serves as a top-level container for page introductions, integrating breadcrumb navigation, titles, metadata, and optional content.

## Import

```svelte
import PageHeader from '$lib/components/organisms/PageHeader.svelte';
```

## Usage

### Basic Usage

```svelte
<PageHeader title="Page Title" />
```

### With Breadcrumbs

```svelte
<PageHeader 
  title="Research Project" 
  breadcrumbItems={[
    { label: "Research", href: "/research" },
    { label: "Projects", href: "/research/projects" }
  ]}
/>
```

### Publication Header Example

```svelte
<PageHeader 
  title="The Evolution of Islamic Education in West Africa" 
  authors={["Jane Smith", "John Doe"]}
  date="March 2025"
  typeBadgeText="Journal Article"
  tags={["Education", "Islam", "West Africa"]}
/>
```

### With Additional Content

```svelte
<PageHeader title="Project Overview">
  <div class="custom-content">
    <!-- Additional content goes here -->
  </div>
</PageHeader>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | *required* | The main title for the page |
| `backLinkHref` | `string \| undefined` | `undefined` | If provided, creates a "Back" link to the specified URL |
| `backLinkLabel` | `string` | `"← Back"` | Label text for the back link |
| `date` | `string \| undefined` | `undefined` | Date information (publication date, event date, etc.) |
| `tags` | `string[] \| undefined` | `undefined` | Array of tags/keywords related to the content |
| `typeBadgeText` | `string \| undefined` | `undefined` | Type badge text (e.g., "Journal Article", "Conference Paper") |
| `authors` | `string[] \| undefined` | `undefined` | Array of author names |
| `editors` | `string \| string[] \| undefined` | `undefined` | Editors (string or array of strings) |
| `breadcrumbItems` | `Array<{ label: string; href: string; }>` | `[]` | Breadcrumb items for navigation |
| `showBreadcrumb` | `boolean` | `true` | Whether to show breadcrumb navigation |
| `showHomeInBreadcrumb` | `boolean` | `true` | Whether to show "Home" as the first breadcrumb item |

## Component Composition

This component combines:
- `Breadcrumb` molecule - For navigation context
- `TagList` component - For displaying associated tags/keywords

## Slots

| Slot | Description |
|------|-------------|
| default | Content to display below the header metadata |

## Styling

The component includes comprehensive styling for:
- Title formatting with appropriate sizing and emphasis
- Metadata display with proper spacing and typography
- Type badge with distinctive visual treatment
- Back link with arrow indicator
- Consistent spacing between elements

## Example with Dynamic Breadcrumbs

```svelte
<script>
  import { page } from '$app/stores';
  import PageHeader from '$lib/components/organisms/PageHeader.svelte';
  
  export let data;
  const publication = data.publication;
  
  // Generate breadcrumb from current path
  $: path = $page.url.pathname;
  $: segments = path.split('/').filter(segment => segment);
  $: breadcrumbItems = segments.slice(0, -1).map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    return { label, href };
  });
</script>

<PageHeader 
  title={publication.title}
  authors={publication.authors}
  date={publication.date}
  typeBadgeText={publication.type}
  tags={publication.tags}
  breadcrumbItems={breadcrumbItems}
/>
```

## CSS Variables Used

- `--spacing-4` - Spacing for breadcrumb container and back link
- `--color-primary` - Color for title and links
- `--color-primary-light` - Background color for type badge
- `--color-primary-dark` - Text color for type badge
- `--color-text` - Text color for authors and main content
- `--color-text-muted` - Color for date information
- `--font-size-xs` - Font size for type badge
- `--font-size-sm` - Font size for date
- `--font-size-base` - Font size for editors
- `--border-radius-full` - Border radius for rounded type badge