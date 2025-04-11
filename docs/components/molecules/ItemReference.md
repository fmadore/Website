# ItemReference Component

A component that displays citation-style references to publications or communications with an interactive preview card that appears on hover/focus.

## Import

```svelte
import ItemReference from '$lib/components/molecules/ItemReference.svelte';
```

## Usage

```svelte
<p>
  As demonstrated in previous research <ItemReference id="pub-2021-03" />, 
  this approach has proven effective in various contexts.
</p>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | *required* | ID of the publication or communication to reference |

## Features

The ItemReference component provides several interactive features:

- Displays as a parenthetical citation (Author, Year) in the text
- Shows a rich preview card on hover/focus with details about the referenced item
- Preview includes image (if available), title, authors, and publication details
- Click/tap toggles preview for mobile users
- Escape key dismisses preview when opened via click
- Automatically positions preview above or below based on available space
- Fully keyboard accessible
- **Mobile-optimized** with preview card that stays within viewport bounds

## Atomic Design Structure

This component follows the atomic design pattern and is composed of:

1. **Atoms**:
   - `ReferenceLink` - The citation link itself
   - `ReferencePreviewCard` - The preview card with item details

2. **Molecules**:
   - `ItemReference` - Combines the atoms with interaction logic

## Integration with Data

The component automatically:
- Looks up the referenced item in your data stores (publications and communications)
- Determines the type of the referenced item
- Constructs the appropriate citation text and preview content
- Creates a link to the full item page

## Accessibility

- Uses `aria-haspopup="dialog"` to indicate the preview functionality
- Accessible to keyboard-only users with proper focus management
- Preview can be toggled with Enter/Space keys
- Preview can be dismissed with Escape key
- Proper ARIA roles and labels

## Example

```svelte
<script>
  import ItemReference from '$lib/components/molecules/ItemReference.svelte';
</script>

<article>
  <h2>Research Summary</h2>
  
  <p>
    Recent studies in West Africa <ItemReference id="pub-2023-01" /> 
    have shown promising results. This builds on earlier work by 
    <ItemReference id="comm-2022-05" /> presented at the annual conference.
  </p>
  
  <p>
    For more information, see the complete analysis <ItemReference id="pub-2022-12" />.
  </p>
</article>
```

## CSS Variables Used

The component uses these CSS variables for styling:
- `--color-primary` - Color for reference links and card title
- `--color-primary-dark` - Color for hover states
- `--color-background` - Background color for preview card
- `--color-border` - Border color for preview card
- `--color-text`, `--color-text-secondary` - Text colors
- `--shadow-lg` - Shadow for preview card
- `--border-radius-md` - Border radius for preview card
- `--font-size-*` - Various font size variables
- `--spacing-*` - Various spacing variables 