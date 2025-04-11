# ReferenceLink Component

An atomic component that renders a citation-style reference link to publications or communications. 

## Import

```svelte
import ReferenceLink from '$lib/components/atoms/ReferenceLink.svelte';
```

## Usage

```svelte
<ReferenceLink 
  item={publication} 
  itemType="publication" 
  id="pub-2023-01"
  hasPopup={true} 
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `item` | `Publication \| Communication \| undefined` | `undefined` | The item data to reference |
| `itemType` | `'publication' \| 'communication' \| undefined` | `undefined` | The type of the referenced item |
| `id` | `string` | *required* | ID of the referenced item (used as fallback if item not found) |
| `hasPopup` | `boolean` | `false` | Whether this link has an associated popup |

## Features

- Displays citation text in the format `(Author, Year)`
- Properly handles all item types
- Sets appropriate ARIA attributes and styling
- Generates an appropriate URL for the referenced item
- Uses dotted underline to indicate interactive reference 