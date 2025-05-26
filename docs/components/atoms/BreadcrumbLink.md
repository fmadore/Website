# BreadcrumbLink Component

**Note: This component has been moved to `$lib/components/common/BreadcrumbLink.svelte` as it's a general-purpose navigation component.**

The `BreadcrumbLink` component is a specialized link element designed specifically for use in breadcrumb navigation. It handles both active (current page) and inactive (navigation link) states.

## Import

```svelte
import BreadcrumbLink from '$lib/components/common/BreadcrumbLink.svelte';
```

## Usage

### Basic Navigation Link

```svelte
<BreadcrumbLink href="/some-path">Link Text</BreadcrumbLink>
```

### Current Page (Active State)

```svelte
<BreadcrumbLink href="/current-page" active={true}>Current Page</BreadcrumbLink>
```

## Props

| Prop     | Type      | Default    | Description                                   |
| -------- | --------- | ---------- | --------------------------------------------- |
| `href`   | `string`  | _required_ | The URL the link points to                    |
| `active` | `boolean` | `false`    | Whether this link represents the current page |

## Accessibility

- When `active={true}`, renders as a `<span>` with `aria-current="page"` attribute
- When `active={false}`, renders as an `<a>` element with proper navigation functionality
- Uses appropriate color contrast between normal and active states

## Styling

- Active state has a different color and font weight to indicate current page
- Link state has hover effects and transitions for better user experience
- Uses CSS variables for consistent styling with the rest of the application

## Example within a Breadcrumb

```svelte
<nav aria-label="Breadcrumb">
	<ol>
		<li>
			<BreadcrumbLink href="/">Home</BreadcrumbLink>
		</li>
		<li>
			<BreadcrumbLink href="/section">Section</BreadcrumbLink>
		</li>
		<li>
			<BreadcrumbLink href="/section/page" active={true}>Current Page</BreadcrumbLink>
		</li>
	</ol>
</nav>
```

## CSS Variables Used

- `--color-text-light` - Color for inactive breadcrumb links
- `--color-primary` - Color for hover state
- `--color-text` - Color for active (current page) state
