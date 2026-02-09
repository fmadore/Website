# Breadcrumb Component

The `Breadcrumb` molecule component provides a navigation aid that helps users understand their current location within the website's hierarchy and easily navigate to parent sections.

## Import

```svelte
import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
```

## Usage

```svelte
<Breadcrumb
	items={[
		{ label: 'Research', href: '/research' },
		{ label: 'Projects', href: '/research/projects' },
		{ label: 'Current Project', href: '' }
	]}
	showHomeLink={true}
/>
```

## Props

| Prop           | Type                                      | Default | Description                                      |
| -------------- | ----------------------------------------- | ------- | ------------------------------------------------ |
| `items`        | `Array<{ label: string; href: string; }>` | `[]`    | Array of breadcrumb items to display             |
| `showHomeLink` | `boolean`                                 | `true`  | Whether to show the "Home" link at the beginning |

## Component Composition

This component is built using:

- `BreadcrumbLink` atom - For each individual link in the breadcrumb path

## Accessibility

- Uses semantic HTML with appropriate ARIA attributes
- Includes `<nav>` element with `aria-label="Breadcrumb"`
- Structured as an ordered list `<ol>` to convey hierarchy
- Last item correctly marked with `aria-current="page"`

## Styling

- Clean, minimal design following standard breadcrumb conventions
- Visual separators between items
- Consistent styling with the rest of your application using CSS variables
- Responsive layout that wraps on smaller screens

## Example with Dynamic Routes

```svelte
<script>
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';

	// Generate breadcrumb items from current path
	$: path = $page.url.pathname;
	$: segments = path.split('/').filter((segment) => segment);
	$: breadcrumbItems = segments.map((segment, index) => {
		const href = '/' + segments.slice(0, index + 1).join('/');
		const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
		return { label, href };
	});
</script>

<Breadcrumb items={breadcrumbItems} />
```

## CSS Variables Used

- `--font-size-sm` - Font size for breadcrumb text
- `--spacing-2` - Spacing between breadcrumb items
- `--spacing-4` - Bottom margin for the breadcrumb container
- `--color-text-light` - Color for separator and inactive links
